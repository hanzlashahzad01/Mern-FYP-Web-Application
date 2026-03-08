const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { auth } = require('../middleware/auth')
const Order = require('../models/Order')

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    console.log('Creating payment intent with:', { amount, currency, metadata })

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        customerId: req.user.id,
        customerEmail: req.user.email,
        ...metadata
      },
      // Explicitly enable only card payments for test mode
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: false, // Disable automatic payment methods to avoid issues
      },
    })

    console.log('Payment intent created successfully:', paymentIntent.id)

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    res.status(500).json({ message: 'Error creating payment intent' })
  }
})

// Create order after successful payment
router.post('/create-order', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      shippingMethod = 'standard',
      paymentIntentId
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' })
    }

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' })
    }

    // Verify payment intent was successful
    console.log('Retrieving payment intent:', paymentIntentId)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    console.log('Payment intent status:', paymentIntent.status)
    
    if (paymentIntent.status !== 'succeeded') {
      console.log('Payment not succeeded, status:', paymentIntent.status)
      return res.status(400).json({ 
        message: 'Payment not completed', 
        status: paymentIntent.status 
      })
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shippingCost = shippingMethod === 'express' ? 15 : 5
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + shippingCost + tax

    // Group items by vendor for vendor orders
    const vendorGroups = {}
    items.forEach(item => {
      if (!vendorGroups[item.vendorId]) {
        vendorGroups[item.vendorId] = {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          items: [],
          subtotal: 0
        }
      }
      vendorGroups[item.vendorId].items.push({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })
      vendorGroups[item.vendorId].subtotal += item.price * item.quantity
    })

    console.log('Creating order with data:', {
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      itemsCount: items.length,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentIntentId,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod
    })

    // Create order with confirmed payment
    const order = new Order({
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        vendorId: item.vendorId,
        vendorName: item.vendorName
      })),
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod: 'stripe',
      paymentIntentId,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      status: 'confirmed', // Start as confirmed since payment succeeded
      paymentStatus: 'paid'
    })

    // Calculate vendor amounts (assuming 10% commission)
    order.vendorOrders = Object.values(vendorGroups).map(vendor => ({
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      items: vendor.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        vendorId: vendor.vendorId, // Add vendorId to each item
        vendorName: vendor.vendorName // Add vendorName to each item
      })),
      subtotal: vendor.subtotal,
      commission: vendor.subtotal * 0.1,
      vendorAmount: vendor.subtotal * 0.9,
      status: 'pending' // Vendor needs to fulfill
    }))

    await order.save()

    console.log('Order created successfully:', order._id)

    res.json({
      success: true,
      order: order,
      message: 'Order created and payment confirmed successfully'
    })

  } catch (error) {
    console.error('Create order error:', error)
    console.error('Error details:', error.message)
    console.error('Stack trace:', error.stack)
    res.status(500).json({ message: 'Error creating order', error: error.message })
  }
})

// Get payment methods for customer
router.get('/payment-methods', auth, async (req, res) => {
  try {
    // Check if customer exists in Stripe
    let customer
    const existingCustomers = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id
        }
      })
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card'
    })

    res.json({
      customerId: customer.id,
      paymentMethods: paymentMethods.data
    })
  } catch (error) {
    console.error('Get payment methods error:', error)
    res.status(500).json({ message: 'Error fetching payment methods' })
  }
})

// Webhook for payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Update order status
        if (paymentIntent.metadata.orderId) {
          await Order.findByIdAndUpdate(
            paymentIntent.metadata.orderId,
            {
              paymentStatus: 'paid',
              status: 'confirmed'
            }
          )
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Payment failed:', failedPayment.id)
        
        // Update order status
        if (failedPayment.metadata.orderId) {
          await Order.findByIdAndUpdate(
            failedPayment.metadata.orderId,
            {
              paymentStatus: 'failed',
              status: 'cancelled'
            }
          )
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})

// Get order by payment intent
router.get('/order/:paymentIntentId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      paymentIntentId: req.params.paymentIntentId,
      customerId: req.user.id
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Error fetching order' })
  }
})

// Test endpoint for debugging payment issues
router.post('/test-payment', auth, async (req, res) => {
  try {
    console.log('Test payment endpoint called')
    
    // Create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: false,
      },
      metadata: {
        test: 'true',
        userId: req.user.id
      }
    })
    
    console.log('Test payment intent created:', paymentIntent.id)
    
    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status
    })
  } catch (error) {
    console.error('Test payment error:', error)
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
})

module.exports = router
