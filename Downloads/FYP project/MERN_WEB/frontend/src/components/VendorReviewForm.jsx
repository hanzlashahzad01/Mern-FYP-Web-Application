import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../utils/errorHandler';

const VendorReviewForm = ({ vendorId, onReviewSubmitted, userReview }) => {
  const [overallRating, setOverallRating] = useState(userReview?.overallRating || 0);
  const [ratings, setRatings] = useState({
    behavior: userReview?.ratings?.behavior || 5,
    productQuality: userReview?.ratings?.productQuality || 5,
    communication: userReview?.ratings?.communication || 5,
    shipping: userReview?.ratings?.shipping || 5,
    valueForMoney: userReview?.ratings?.valueForMoney || 5
  });
  const [comment, setComment] = useState(userReview?.comment || '');
  const [hoveredOverallRating, setHoveredOverallRating] = useState(0);
  const [hoveredDetailedRating, setHoveredDetailedRating] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingCategories = [
    { key: 'behavior', label: 'Vendor Behavior', description: 'How professional and friendly the vendor is' },
    { key: 'productQuality', label: 'Product Quality', description: 'Quality of the products received' },
    { key: 'communication', label: 'Communication', description: 'How well the vendor communicates' },
    { key: 'shipping', label: 'Shipping & Delivery', description: 'Speed and condition of delivery' },
    { key: 'valueForMoney', label: 'Value for Money', description: 'Whether the price matches the quality' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      toast.error('Please select an overall rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = userReview ? `/api/vendor-reviews/${userReview._id}` : '/api/vendor-reviews';
      const method = userReview ? 'PUT' : 'POST';
      
      console.log('Submitting vendor review with vendorId:', vendorId);
      console.log('Review data:', {
        vendorId,
        overallRating,
        ratings,
        comment: comment.trim()
      });
      
      const result = await apiRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorId,
          overallRating,
          ratings,
          comment: comment.trim()
        })
      }, 'Failed to submit vendor review');

      if (result.success) {
        toast.success(userReview ? 'Vendor review updated successfully!' : 'Vendor review submitted successfully!');
        setComment('');
        if (!userReview) {
          setOverallRating(0);
          setRatings({
            behavior: 5,
            productQuality: 5,
            communication: 5,
            shipping: 5,
            valueForMoney: 5
          });
        }
        onReviewSubmitted();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error submitting vendor review:', error);
      toast.error('Failed to submit vendor review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;

    if (!window.confirm('Are you sure you want to delete this vendor review?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const result = await apiRequest(`/api/vendor-reviews/${userReview._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 'Failed to delete vendor review');

      if (result.success) {
        toast.success('Vendor review deleted successfully!');
        setComment('');
        setOverallRating(0);
        setRatings({
          behavior: 5,
          productQuality: 5,
          communication: 5,
          shipping: 5,
          valueForMoney: 5
        });
        onReviewSubmitted();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting vendor review:', error);
      toast.error('Failed to delete vendor review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onRatingChange, hovered, onHover) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRatingChange(i + 1)}
        onMouseEnter={() => onHover(i + 1)}
        onMouseLeave={() => onHover(0)}
        className="p-1 transition-all duration-200 transform hover:scale-110"
      >
        <FaStar
          className={`w-6 h-6 ${
            i < (hovered || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  const renderDetailedStars = (categoryKey, rating, onRatingChange) => {
    const hovered = hoveredDetailedRating[categoryKey] || 0;
    
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRatingChange(i + 1)}
        onMouseEnter={() => setHoveredDetailedRating(prev => ({ ...prev, [categoryKey]: i + 1 }))}
        onMouseLeave={() => setHoveredDetailedRating(prev => ({ ...prev, [categoryKey]: 0 }))}
        className="p-1 transition-all duration-200 transform hover:scale-110"
      >
        <FaStar
          className={`w-5 h-5 ${
            i < (hovered || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {userReview ? 'Edit Your Vendor Review' : 'Review This Vendor'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(overallRating, setOverallRating, hoveredOverallRating, setHoveredOverallRating)}
            <span className="ml-3 text-sm text-gray-600">
              {overallRating > 0 && `${overallRating} out of 5 stars`}
            </span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Detailed Ratings
          </label>
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-500">{category.description}</div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderDetailedStars(
                    category.key,
                    ratings[category.key],
                    (rating) => setRatings(prev => ({ ...prev, [category.key]: rating }))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Review Comment *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this vendor..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
            maxLength="1000"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {comment.length}/1000 characters
            </span>
            {comment.length > 900 && (
              <span className="text-xs text-orange-600">
                {1000 - comment.length} characters remaining
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0 || !comment.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>
              {isSubmitting 
                ? (userReview ? 'Updating...' : 'Submitting...') 
                : (userReview ? 'Update Review' : 'Submit Review')
              }
            </span>
          </button>

          {userReview && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Review
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorReviewForm;
