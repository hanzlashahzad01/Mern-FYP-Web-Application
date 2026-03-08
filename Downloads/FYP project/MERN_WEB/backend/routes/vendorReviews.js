const express = require('express');
const router = express.Router();
const VendorReview = require('../models/VendorReview');
const VendorProfile = require('../models/VendorProfile');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   POST /api/vendor-reviews
// @desc    Create a new vendor review
// @access  Private (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    const { vendorId, overallRating, ratings, comment } = req.body;
    const customerId = req.user.id;
    
    console.log('Creating vendor review - customerId:', customerId, 'vendorId:', vendorId);
    console.log('User object:', req.user);

    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can leave vendor reviews'
      });
    }

    // Validate required fields
    if (!vendorId || !overallRating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, overall rating, and comment are required'
      });
    }

    if (overallRating < 1 || overallRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Overall rating must be between 1 and 5'
      });
    }

    // Check if vendor exists
    console.log('Creating vendor review for vendorId:', vendorId);
    console.log('VendorId type:', typeof vendorId);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(vendorId));
    
    // Try to find vendor profile with different ID formats
    let vendorProfile = await VendorProfile.findOne({ userId: vendorId });
    if (!vendorProfile && mongoose.Types.ObjectId.isValid(vendorId)) {
      // Try with ObjectId
      vendorProfile = await VendorProfile.findOne({ userId: new mongoose.Types.ObjectId(vendorId) });
    }
    
    if (!vendorProfile) {
      console.log('Vendor profile not found for userId:', vendorId);
      console.log('Tried both string and ObjectId formats');
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    console.log('Found vendor profile:', vendorProfile._id);

    // Convert vendorId to ObjectId if it's a valid string
    let reviewVendorId = vendorId;
    if (typeof vendorId === 'string' && mongoose.Types.ObjectId.isValid(vendorId)) {
      reviewVendorId = new mongoose.Types.ObjectId(vendorId);
    }
    console.log('Review vendor ID (converted):', reviewVendorId);

    // Check if customer has already reviewed this vendor
    const existingReview = await VendorReview.findOne({ 
      vendor: reviewVendorId, 
      customer: customerId 
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this vendor'
      });
    }

    // Create new vendor review
    const vendorReview = new VendorReview({
      vendor: reviewVendorId,
      customer: customerId,
      customerName: req.user.name,
      overallRating,
      ratings: ratings || {},
      comment: comment.trim()
    });

    console.log('Saving vendor review:', vendorReview);
    await vendorReview.save();
    console.log('Vendor review saved successfully:', vendorReview._id);

    // Update vendor profile stats
    await updateVendorReviewStats(vendorId);
    console.log('Vendor profile stats updated');

    res.status(201).json({
      success: true,
      message: 'Vendor review created successfully',
      review: vendorReview
    });

  } catch (error) {
    console.error('Error creating vendor review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-reviews/vendor/:vendorId
// @desc    Get all reviews for a vendor
// @access  Public
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    console.log('Fetching vendor reviews for vendorId:', vendorId);
    console.log('VendorId type:', typeof vendorId);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(vendorId));

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Convert to ObjectId if it's a valid string
    let queryVendorId = vendorId;
    if (typeof vendorId === 'string' && mongoose.Types.ObjectId.isValid(vendorId)) {
      queryVendorId = new mongoose.Types.ObjectId(vendorId);
    }
    console.log('Query vendor ID:', queryVendorId);

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest':
        sortObj = { overallRating: -1 };
        break;
      case 'lowest':
        sortObj = { overallRating: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    console.log('Searching for reviews with vendor ID:', queryVendorId);
    const reviews = await VendorReview.find({ 
      vendor: queryVendorId, 
      status: 'active' 
    })
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customer', 'name');

    console.log('Found reviews:', reviews.length);
    console.log('Review details:', reviews.map(r => ({ 
      id: r._id, 
      customer: r.customer, 
      customerName: r.customerName,
      overallRating: r.overallRating 
    })));
    
    const total = await VendorReview.countDocuments({ 
      vendor: queryVendorId, 
      status: 'active' 
    });
    console.log('Total reviews for vendor:', total);

    // Calculate review statistics
    const stats = await VendorReview.aggregate([
      { $match: { vendor: queryVendorId, status: 'active' } },
      {
        $group: {
          _id: null,
          avgOverallRating: { $avg: '$overallRating' },
          avgBehavior: { $avg: '$ratings.behavior' },
          avgProductQuality: { $avg: '$ratings.productQuality' },
          avgCommunication: { $avg: '$ratings.communication' },
          avgShipping: { $avg: '$ratings.shipping' },
          avgValueForMoney: { $avg: '$ratings.valueForMoney' },
          totalReviews: { $sum: 1 },
          ratingDistribution: { $push: '$overallRating' }
        }
      }
    ]);

    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        averageOverallRating: stats.length > 0 ? Math.round(stats[0].avgOverallRating * 10) / 10 : 0,
        averageBehavior: stats.length > 0 ? Math.round(stats[0].avgBehavior * 10) / 10 : 0,
        averageProductQuality: stats.length > 0 ? Math.round(stats[0].avgProductQuality * 10) / 10 : 0,
        averageCommunication: stats.length > 0 ? Math.round(stats[0].avgCommunication * 10) / 10 : 0,
        averageShipping: stats.length > 0 ? Math.round(stats[0].avgShipping * 10) / 10 : 0,
        averageValueForMoney: stats.length > 0 ? Math.round(stats[0].avgValueForMoney * 10) / 10 : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/vendor-reviews/:reviewId
// @desc    Update a vendor review
// @access  Private (Review owner only)
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { overallRating, ratings, comment } = req.body;
    const customerId = req.user.id;

    const review = await VendorReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    if (overallRating !== undefined) review.overallRating = overallRating;
    if (ratings !== undefined) review.ratings = { ...review.ratings, ...ratings };
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await updateVendorReviewStats(review.vendor);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Error updating vendor review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/vendor-reviews/:reviewId
// @desc    Delete a vendor review
// @access  Private (Review owner only)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user.id;

    const review = await VendorReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const vendorId = review.vendor;
    await VendorReview.findByIdAndDelete(reviewId);
    await updateVendorReviewStats(vendorId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vendor review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to update vendor review stats
async function updateVendorReviewStats(vendorId) {
  try {
    const stats = await VendorReview.aggregate([
      { $match: { vendor: vendorId, status: 'active' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const newRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const newReviewCount = stats.length > 0 ? stats[0].totalReviews : 0;

    await VendorProfile.findOneAndUpdate(
      { userId: vendorId },
      {
        'stats.averageRating': newRating,
        'stats.reviewCount': newReviewCount
      }
    );

  } catch (error) {
    console.error('Error updating vendor review stats:', error);
  }
}

module.exports = router;
