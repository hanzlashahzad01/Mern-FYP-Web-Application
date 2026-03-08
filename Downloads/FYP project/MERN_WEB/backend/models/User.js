const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasVendorProfile: {
    type: Boolean,
    default: false
  },
  vendorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorProfile'
  },
  // Vendor approval system
  vendorApprovalStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  vendorApprovalRequestDate: {
    type: Date
  },
  vendorApprovalDate: {
    type: Date
  },
  vendorApprovalNotes: {
    type: String,
    trim: true
  },
  vendorRejectionReason: {
    type: String,
    trim: true
  },
  // Vendor-specific fields
  vendorDetails: {
    businessName: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'small_business', 'enterprise', 'non_profit'],
      default: 'individual'
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Pakistan'
      }
    },
    businessPhone: String,
    businessEmail: String,
    businessWebsite: String,
    // Identity documents
    identityType: {
      type: String,
      enum: ['cnic', 'passport', 'other'],
      default: 'cnic'
    },
    identityNumber: {
      type: String,
      trim: true
    },
    identityCountry: {
      type: String,
      default: 'Pakistan'
    },
    // Business documents
    businessLicense: String,
    taxId: String,
    // Document uploads
    documents: [{
      type: {
        type: String,
        enum: ['identity', 'business_license', 'tax_certificate', 'shop_photos', 'other'],
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      filePath: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Additional vendor info
    categories: [{
      type: String,
      enum: [
        'jewelry', 'clothing', 'home_decor', 'art_crafts', 'beauty_wellness',
        'electronics', 'books_media', 'sports_outdoors', 'food_beverage', 'other'
      ]
    }],
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String
    }
  },
  lastLogin: {
    type: Date
  },
  googleId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.resetPasswordToken
  delete userObject.resetPasswordExpire
  return userObject
}

module.exports = mongoose.model('User', userSchema)
