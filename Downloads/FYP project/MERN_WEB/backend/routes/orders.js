const express = require('express')
const { auth } = require('../middleware/auth')
const Order = require('../models/Order')

const router = express.Router()

// @route   GET /api/orders
// @desc    Get user's orders (customer)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image')
    
    res.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/orders/vendor
// @desc    Get vendor's orders
// @access  Private (Vendor only)
router.get('/vendor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor role required.' })
    }

    const orders = await Order.find({
      'vendorOrders.vendorId': req.user.id
    })
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name image')
    
    // Filter vendor-specific data
    const vendorOrders = orders.map(order => ({
      ...order.toObject(),
      vendorOrders: order.vendorOrders.filter(vo => vo.vendorId.toString() === req.user.id)
    }))
    
    res.json({ orders: vendorOrders })
  } catch (error) {
    console.error('Get vendor orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name image')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user has access to this order
    if (order.customerId.toString() !== req.user.id && 
        !order.vendorOrders.some(vo => vo.vendorId.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/orders/:id/vendor-status
// @desc    Update vendor order status
// @access  Private (Vendor only)
router.put('/:id/vendor-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor role required.' })
    }

    const { status, trackingNumber } = req.body
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Find the vendor's order
    const vendorOrder = order.vendorOrders.find(vo => vo.vendorId.toString() === req.user.id)
    
    if (!vendorOrder) {
      return res.status(404).json({ message: 'Vendor order not found' })
    }

    // Update vendor order status
    vendorOrder.status = status
    if (trackingNumber) {
      vendorOrder.trackingNumber = trackingNumber
    }
    
    if (status === 'shipped') {
      vendorOrder.shippedAt = new Date()
    } else if (status === 'delivered') {
      vendorOrder.deliveredAt = new Date()
    }

    await order.save()
    
    res.json({ 
      message: 'Order status updated successfully',
      order: order
    })
  } catch (error) {
    console.error('Update vendor order status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
