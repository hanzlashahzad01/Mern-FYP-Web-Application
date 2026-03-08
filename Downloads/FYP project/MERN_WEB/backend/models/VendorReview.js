const mongoose = require('mongoose');

const vendorReviewSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  overallRating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  // Detailed ratings for different aspects
  ratings: {
    behavior: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    productQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    shipping: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  // Optional fields
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one review per customer per vendor
vendorReviewSchema.index({ vendor: 1, customer: 1 }, { unique: true });

// Create indexes for better query performance
vendorReviewSchema.index({ vendor: 1, createdAt: -1 });
vendorReviewSchema.index({ overallRating: -1 });
vendorReviewSchema.index({ status: 1 });

// Update the updatedAt field on save
vendorReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for average detailed rating
vendorReviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.ratings;
  const sum = ratings.behavior + ratings.productQuality + ratings.communication + ratings.shipping + ratings.valueForMoney;
  return Math.round((sum / 5) * 10) / 10;
});

// Ensure virtual fields are serialized
vendorReviewSchema.set('toJSON', { virtuals: true });
vendorReviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VendorReview', vendorReviewSchema);
