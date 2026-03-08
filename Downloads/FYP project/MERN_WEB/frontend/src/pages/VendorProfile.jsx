import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt, FaHeart, FaEye, FaInstagram, FaFacebook, FaGlobe, FaArrowLeft, FaShoppingBag, FaUsers, FaAward } from 'react-icons/fa'
import { FiMessageCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import CustomerMessaging from '../components/messaging/CustomerMessaging'
import FollowButton from '../components/common/FollowButton'
import VendorReviewForm from '../components/VendorReviewForm'

const VendorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMessaging, setShowMessaging] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [realtimeStats, setRealtimeStats] = useState(null)
  const [vendorReviews, setVendorReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({})
  const [userVendorReview, setUserVendorReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (id) {
      fetchVendorProfile()
      fetchVendorProducts()
      fetchRealtimeStats()
    }
  }, [id, user])

  // Separate useEffect to fetch reviews after vendor data is loaded
  useEffect(() => {
    if (vendor && vendor.userId) {
      fetchVendorReviews()
      checkUserVendorReview()
    }
  }, [vendor, user])

  const fetchVendorProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching vendor profile for ID:', id)
      const response = await fetch(`/api/vendors/profile/${id}`)
      console.log('Vendor profile response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Vendor profile data:', data)
        if (data.profile) {
          // Transform the data to match component expectations
          const transformedVendor = {
            ...data.profile,
            userId: data.profile.userId,
            user: data.profile.userId, // The populated user data
            rating: data.profile.stats?.averageRating || 0,
            stats: {
              totalProducts: data.profile.stats?.totalProducts || 0,
              totalFollowers: data.profile.stats?.followerCount || 0,
              totalSales: data.profile.stats?.totalSales || 0,
              totalReviews: data.profile.stats?.reviewCount || 0
            }
          }
          console.log('Transformed vendor data:', transformedVendor)
          setVendor(transformedVendor)
        } else {
          console.error('No profile data in response')
          setVendor(null)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch vendor profile:', response.status, errorData)
        // Don't navigate away immediately, show error state instead
        setVendor(null)
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorProducts = async () => {
    try {
      console.log('Fetching vendor products for ID:', id)
      const response = await fetch(`/api/products/vendor/${id}?limit=12`)
      console.log('Vendor products response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Vendor products data:', data)
        setProducts(data.products || [])
      } else {
        console.error('Failed to fetch vendor products:', response.status)
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error)
    }
  }

  const fetchRealtimeStats = async () => {
    try {
      console.log('Fetching real-time stats for vendor ID:', id)
      const response = await fetch(`/api/vendors/${id}/stats/public`)
      console.log('Real-time stats response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Real-time stats data:', data)

        // Set initial stats (will be updated with review data when vendor data loads)
        setRealtimeStats(data.stats)
      } else {
        console.error('Failed to fetch real-time stats:', response.status)
      }
    } catch (error) {
      console.error('Error fetching real-time stats:', error)
    }
  }

  const fetchVendorReviews = async () => {
    try {
      const vendorId = vendor?.userId
        ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || vendor.userId.id || id))
        : id;

      console.log('Fetching vendor reviews for ID:', vendorId)
      const response = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)

      if (response.ok) {
        const data = await response.json()
        setVendorReviews(data.reviews || [])
        setReviewStats(data.stats || {})

        // Update real-time stats with vendor review data
        setRealtimeStats(prev => ({
          ...prev,
          averageRating: data.stats.averageOverallRating || 0,
          reviewCount: data.stats.totalReviews || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching vendor reviews:', error)
    }
  }

  const checkUserVendorReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return

      const vendorId = vendor?.userId
        ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || vendor.userId.id || id))
        : id;

      // Check if current user has reviewed this vendor
      const response = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)
      if (response.ok) {
        const data = await response.json()
        const currentUserId = user.id || user._id || user.userId

        const currentUserReview = data.reviews.find(review => {
          // Handle both string and object customer fields in review
          const reviewCustomerId = typeof review.customer === 'object'
            ? review.customer._id || review.customer.id
            : review.customer

          return reviewCustomerId === currentUserId
        })

        if (currentUserReview) {
          setUserVendorReview(currentUserReview)
        } else {
          setUserVendorReview(null)
        }
      }
    } catch (error) {
      console.error('Error checking user vendor review:', error)
    }
  }

  const handleReviewSubmitted = async () => {
    console.log('Review submitted, refreshing data...');
    // Refresh reviews and user review
    await fetchVendorReviews()
    await checkUserVendorReview()

    // Also update real-time stats with new review data
    if (vendor?.userId) {
      try {
        const vendorId = vendor?.userId
          ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || vendor.userId.id || id))
          : id;

        const reviewResponse = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json()
          setRealtimeStats(prev => ({
            ...prev,
            averageRating: reviewData.stats.averageOverallRating || 0,
            reviewCount: reviewData.stats.totalReviews || 0
          }))
        }
      } catch (error) {
        console.error('Error updating real-time stats:', error)
      }
    }

    setShowReviewForm(false)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating)
          ? 'text-yellow-400'
          : i < rating
            ? 'text-yellow-400 opacity-60'
            : 'text-gray-300'
          }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/artisans')}
              className="group flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-blue-50 hover:from-blue-100 hover:to-indigo-50 text-gray-700 hover:text-blue-700 transition-all duration-300 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-x-1"
            >
              <FaArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-medium">Back to Artisans</span>
            </button>
          </div>

          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Vendor Profile Not Available</h3>
            <p className="text-gray-600 mb-6">
              This vendor hasn't created their profile yet or the profile is not available.
            </p>
            <div className="space-y-4">
              <Link
                to="/artisans"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Back to Artisans
              </Link>
              <div className="text-sm text-gray-500">
                <p>This could happen if:</p>
                <ul className="mt-2 space-y-1">
                  <li>• The vendor hasn't completed their profile setup</li>
                  <li>• The profile is still being reviewed</li>
                  <li>• There's a temporary issue with the profile data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate('/artisans')}
          className="group flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-blue-50 hover:from-blue-100 hover:to-indigo-50 text-gray-700 hover:text-blue-700 transition-all duration-300 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-x-1"
        >
          <FaArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-medium">Back to Artisans</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            {vendor.bannerImage && (
              <img
                src={vendor.bannerImage}
                alt={vendor.shopName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Profile Image */}
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={vendor.profileImage}
                  alt={vendor.shopName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-8 flex space-x-3">
              <FollowButton
                vendorId={vendor?.userId ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || id)) : id}
                initialFollowersCount={vendor.stats?.totalFollowers || 0}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              />
              <button
                onClick={() => setShowMessaging(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8 pt-16">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.shopName}</h1>
                <p className="text-blue-600 font-semibold text-lg mb-4">by {vendor.user?.name || 'Unknown'}</p>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {(reviewStats?.averageOverallRating > 0) ? renderStars(reviewStats.averageOverallRating) : (
                      <div className="flex text-gray-300">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="w-4 h-4" />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-600">
                    {reviewStats?.averageOverallRating > 0
                      ? `${reviewStats.averageOverallRating} (${reviewStats.totalReviews || 0} reviews)`
                      : 'No reviews yet'}
                  </span>
                </div>

                {/* Location */}
                {vendor.location?.address && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    <span>{vendor.location.address}</span>
                  </div>
                )}

                {/* Bio */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  {vendor.bio || 'Passionate artisan creating unique handmade treasures.'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {realtimeStats?.totalProducts || vendor.stats?.totalProducts || 0}
                    </div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {realtimeStats?.totalFollowers || vendor.stats?.totalFollowers || 0}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      ${realtimeStats?.totalSales || vendor.stats?.totalSales || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {reviewStats?.totalReviews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="lg:ml-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-pink-600 hover:text-pink-700 transition-colors duration-200"
                  >
                    <FaInstagram className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <FaFacebook className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-700 transition-colors duration-200"
                  >
                    <FaGlobe className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'about', label: 'About', icon: FaUsers },
                { id: 'products', label: 'Products', icon: FaShoppingBag },
                { id: 'reviews', label: 'Reviews', icon: FaStar }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">About {vendor.shopName}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {vendor.bio || 'This artisan is passionate about creating unique handmade treasures. Their dedication to quality and craftsmanship shines through in every piece they create.'}
                </p>

                {/* Specialties */}
                {vendor.specialties && vendor.specialties.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {vendor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Products by {vendor.shopName}</h3>
                {products.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">${product.price}</span>
                            <div className="flex items-center">
                              <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">{product.rating || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h4>
                    <p className="text-gray-600">This vendor hasn't added any products yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Vendor Reviews</h3>
                  {user && user.role === 'customer' && !userVendorReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Write Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <VendorReviewForm
                    vendorId={vendor?.userId ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || id)) : id}
                    onReviewSubmitted={handleReviewSubmitted}
                    userReview={userVendorReview}
                  />
                )}
                {showReviewForm && console.log('VendorReviewForm vendorId:', vendor?.userId)}

                {/* User's Existing Review */}
                {userVendorReview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Your Review</h4>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showReviewForm ? 'Cancel Edit' : 'Edit Review'}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(userVendorReview.overallRating)}
                      <span className="text-sm text-blue-700">{userVendorReview.overallRating}/5</span>
                    </div>
                    <p className="text-blue-800 text-sm">{userVendorReview.comment}</p>
                  </div>
                )}

                {vendorReviews.length > 0 ? (
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-blue-800 mb-4">Review Summary</h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Overall Rating */}
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {reviewStats.averageOverallRating || 0}
                          </div>
                          <div className="flex justify-center mb-2">
                            {renderStars(reviewStats.averageOverallRating || 0)}
                          </div>
                          <div className="text-sm text-blue-600">
                            {reviewStats.totalReviews || 0} reviews
                          </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-blue-800 mb-2">Average Ratings:</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Behavior:</span>
                              <span>{reviewStats.averageBehavior || 0}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Product Quality:</span>
                              <span>{reviewStats.averageProductQuality || 0}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Communication:</span>
                              <span>{reviewStats.averageCommunication || 0}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping:</span>
                              <span>{reviewStats.averageShipping || 0}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Value for Money:</span>
                              <span>{reviewStats.averageValueForMoney || 0}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {vendorReviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {review.customerName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{review.customerName || 'Anonymous'}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              {renderStars(review.overallRating)}
                              <span className="text-sm text-gray-600 ml-2">{review.overallRating}/5</span>
                            </div>
                          </div>

                          <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                          {/* Detailed Ratings */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Behavior:</span>
                              <span className="font-medium">{review.ratings?.behavior || 0}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quality:</span>
                              <span className="font-medium">{review.ratings?.productQuality || 0}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Communication:</span>
                              <span className="font-medium">{review.ratings?.communication || 0}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="font-medium">{review.ratings?.shipping || 0}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-medium">{review.ratings?.valueForMoney || 0}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                    <p className="text-gray-600">Be the first to review this vendor!</p>
                    {user && user.role === 'customer' && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Write First Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Messaging Modal */}
      {showMessaging && (
        <CustomerMessaging
          vendor={{
            id: vendor.userId,
            name: vendor.user?.name || 'Unknown',
            shopName: vendor.shopName,
            image: vendor.profileImage
          }}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  )
}

export default VendorProfile
