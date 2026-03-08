const express = require('express')
const { auth, isAdmin } = require('../middleware/auth')
const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Vendor = require('../models/Vendor')
const VendorProfile = require('../models/VendorProfile')
const { sendVendorApprovalNotification } = require('../utils/emailService')

const router = express.Router()

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', [auth, isAdmin], async (req, res) => {
  try {
    // Get real statistics from database
    const totalUsers = await User.countDocuments()
    const totalVendors = await User.countDocuments({ role: 'vendor' })
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    // Get pending approvals (vendors waiting for approval)
    const pendingApprovals = await User.countDocuments({
      role: 'vendor',
      vendorApprovalStatus: 'pending'
    })

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingApprovals
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/users
// @desc    Get all users with pagination and search
// @access  Private (Admin only)
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const role = req.query.role || ''
    const status = req.query.status || ''

    // Build query
    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (role) {
      query.role = role
    }

    if (status === 'active') {
      query.isActive = true
    } else if (status === 'inactive') {
      query.isActive = false
    }

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private (Admin only)
router.get('/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('vendorProfileId')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const { isActive } = req.body
    const userId = req.params.id

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [auth, isAdmin], async (req, res) => {
  try {
    const { role } = req.body
    const userId = req.params.id

    // Validate role
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be customer, vendor, or admin'
      })
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot change your own role'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'User role updated successfully',
      user
    })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const userId = req.params.id

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      })
    }

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/products
// @desc    Get all products with pagination and search
// @access  Private (Admin only)
router.get('/products', [auth, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const category = req.query.category || ''
    const status = req.query.status || ''

    // Build query
    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      query.category = category
    }

    if (status === 'active') {
      query.isActive = true
    } else if (status === 'inactive') {
      query.isActive = false
    }

    // Get products with pagination
    const skip = (page - 1) * limit
    const products = await Product.find(query)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalProducts = await Product.countDocuments(query)
    const totalPages = Math.ceil(totalProducts / limit)

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/products/:id', [auth, isAdmin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product removed' })
  } catch (error) {
    console.error('Delete product error:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination and search
// @access  Private (Admin only)
router.get('/orders', [auth, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const status = req.query.status || ''

    // Build query
    let query = {}

    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.status = status
    }

    // Get orders with pagination
    const skip = (page - 1) * limit
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalOrders = await Order.countDocuments(query)
    const totalPages = Math.ceil(totalOrders / limit)

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/vendor-approvals
// @desc    Get pending vendor approval requests
// @access  Private (Admin only)
router.get('/vendor-approvals', [auth, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || 'pending'

    // Build query
    let query = { role: 'vendor' }

    if (status === 'pending') {
      query.vendorApprovalStatus = 'pending'
    } else if (status === 'approved') {
      query.vendorApprovalStatus = 'approved'
    } else if (status === 'rejected') {
      query.vendorApprovalStatus = 'rejected'
    }

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ vendorApprovalRequestDate: -1 })
      .skip(skip)
      .limit(limit)

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Get vendor approvals error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/vendor-approvals/:id/approve
// @desc    Approve vendor application
// @access  Private (Admin only)
router.put('/vendor-approvals/:id/approve', [auth, isAdmin], async (req, res) => {
  try {
    const { notes } = req.body
    const userId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' })
    }

    if (user.vendorApprovalStatus !== 'pending') {
      return res.status(400).json({ message: 'Vendor application is not pending' })
    }

    // Update user approval status
    user.vendorApprovalStatus = 'approved'
    user.vendorApprovalDate = new Date()
    user.vendorApprovalNotes = notes || ''
    await user.save()

    // Send approval email (non-blocking)
    sendVendorApprovalNotification(user.email, user.name, true)
      .then(result => {
        if (result.success) {
          console.log(`Vendor approval email sent to ${user.email}`);
        } else {
          console.error(`Failed to send vendor approval email to ${user.email}:`, result.error);
        }
      })
      .catch(error => {
        console.error(`Error sending vendor approval email to ${user.email}:`, error);
      });

    res.json({
      message: 'Vendor application approved successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Approve vendor error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/vendor-approvals/:id/reject
// @desc    Reject vendor application
// @access  Private (Admin only)
router.put('/vendor-approvals/:id/reject', [auth, isAdmin], async (req, res) => {
  try {
    const { rejectionReason } = req.body
    const userId = req.params.id

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' })
    }

    if (user.vendorApprovalStatus !== 'pending') {
      return res.status(400).json({ message: 'Vendor application is not pending' })
    }

    // Update user approval status
    user.vendorApprovalStatus = 'rejected'
    user.vendorApprovalDate = new Date()
    user.vendorRejectionReason = rejectionReason.trim()
    await user.save()

    // Send rejection email (non-blocking)
    sendVendorApprovalNotification(user.email, user.name, false, rejectionReason)
      .then(result => {
        if (result.success) {
          console.log(`Vendor rejection email sent to ${user.email}`);
        } else {
          console.error(`Failed to send vendor rejection email to ${user.email}:`, result.error);
        }
      })
      .catch(error => {
        console.error(`Error sending vendor rejection email to ${user.email}:`, error);
      });

    res.json({
      message: 'Vendor application rejected successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Reject vendor error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/vendor-approvals/:id
// @desc    Get single vendor approval details
// @access  Private (Admin only)
router.get('/vendor-approvals/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get vendor approval error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/vendor-approvals/:id
// @desc    Update vendor details (including documents)
// @access  Private (Admin only)
router.put('/vendor-approvals/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' })
    }

    // Update vendor details
    if (req.body.vendorDetails) {
      user.vendorDetails = { ...user.vendorDetails, ...req.body.vendorDetails }
    }

    await user.save()

    res.json({
      message: 'Vendor details updated successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Update vendor error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
