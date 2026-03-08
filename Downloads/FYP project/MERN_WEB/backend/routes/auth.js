const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { sendLoginGreeting, sendWelcomeEmail, sendVendorApprovalRequestEmail } = require('../utils/emailService')

const router = express.Router()

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ 
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['customer', 'vendor']).withMessage('Role must be either customer or vendor')
], async (req, res) => {
  try {
    // Debug logging
    console.log('Registration request body:', req.body)
    
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    })

    // Handle vendor approval request
    if (role === 'vendor') {
      user.vendorApprovalStatus = 'pending'
      user.vendorApprovalRequestDate = new Date()
      
      // Add vendor details if provided
      if (req.body.vendorDetails) {
        user.vendorDetails = req.body.vendorDetails
        
        // Validate CNIC format for Pakistan
        if (user.vendorDetails.identityType === 'cnic' && user.vendorDetails.identityNumber) {
          const cnicRegex = /^\d{5}-\d{6}-\d{1}$/
          if (!cnicRegex.test(user.vendorDetails.identityNumber)) {
            return res.status(400).json({ 
              message: 'Invalid CNIC format. Please use format: 12345-123456-1' 
            })
          }
        }
      }
    }

    await user.save()

    // Send appropriate email based on role
    if (role === 'vendor') {
      // Send vendor approval request email
      sendVendorApprovalRequestEmail(user.email, user.name)
        .then(result => {
          if (result.success) {
            console.log(`Vendor approval request email sent to ${user.email}`);
          } else {
            console.error(`Failed to send vendor approval request email to ${user.email}:`, result.error);
          }
        })
        .catch(error => {
          console.error(`Error sending vendor approval request email to ${user.email}:`, error);
        });

      // For vendors, don't generate token - they need approval first
      res.status(201).json({
        message: 'Vendor registration request submitted successfully. Please wait for admin approval.',
        requiresApproval: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          vendorApprovalStatus: user.vendorApprovalStatus
        }
      })
    } else {
      // Generate token for customers (they can login immediately)
      const token = generateToken(user)

      // Send regular welcome email for customers
      sendWelcomeEmail(user.email, user.name)
        .then(result => {
          if (result.success) {
            console.log(`Welcome email sent to ${user.email}`);
          } else {
            console.error(`Failed to send welcome email to ${user.email}:`, result.error);
          }
        })
        .catch(error => {
          console.error(`Error sending welcome email to ${user.email}:`, error);
        });

      // Return user data (excluding password)
      const userData = user.getPublicProfile()

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userData,
        requiresApproval: false
      })
    }
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { email, password } = req.body

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check vendor approval status
    if (user.role === 'vendor') {
      if (user.vendorApprovalStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your vendor application is still pending approval. Please wait for admin approval.',
          requiresApproval: true,
          vendorApprovalStatus: user.vendorApprovalStatus
        })
      } else if (user.vendorApprovalStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Your vendor application was rejected. Please contact support for more information.',
          requiresApproval: false,
          vendorApprovalStatus: user.vendorApprovalStatus,
          rejectionReason: user.vendorRejectionReason
        })
      }
    }

    // Enforce specific admin credentials
    if (user.role === 'admin' && user.email !== 'hanzla@gmail.com') {
      return res.status(403).json({ 
        message: 'Unauthorized admin access. Please use the official admin credentials.' 
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user)

    // Send login greeting email (non-blocking)
    sendLoginGreeting(user.email, user.name)
      .then(result => {
        if (result.success) {
          console.log(`Login greeting email sent to ${user.email}`);
        } else {
          console.error(`Failed to send login greeting email to ${user.email}:`, result.error);
        }
      })
      .catch(error => {
        console.error(`Error sending login greeting email to ${user.email}:`, error);
      });

    // Return user data (excluding password)
    const userData = user.getPublicProfile()

    res.json({
      message: 'Login successful',
      token,
      user: userData
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().trim(),
  body('address').optional().isObject().withMessage('Address must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { name, phone, address, avatar } = req.body
    const updateFields = {}

    if (name) updateFields.name = name
    if (phone) updateFields.phone = phone
    if (address) updateFields.address = address
    if (avatar) updateFields.avatar = avatar

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error updating profile' })
  }
})

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user._id).select('+password')

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error changing password' })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    
    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = Date.now() + 3600000 // 1 hour
    await user.save()

    // In production, send email here
    res.json({ 
      message: 'Password reset email sent',
      resetToken // Remove this in production
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    const { token, newPassword } = req.body

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Update password and clear reset token
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token expired' })
    }
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/check-email
// @desc    Check if email already exists
// @access  Public
router.post('/check-email', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    const { email } = req.body
    const user = await User.findOne({ email })

    res.json({ exists: !!user })
  } catch (error) {
    console.error('Check email error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
