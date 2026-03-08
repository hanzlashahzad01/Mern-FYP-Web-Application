import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiUser, FiShoppingBag, FiHeart, FiSettings, FiMessageCircle, FiRefreshCw,
  FiPackage, FiDollarSign, FiStar, FiClock, FiMapPin, FiTruck, FiCheck,
  FiTrendingUp, FiAward, FiCalendar, FiMail, FiPhone, FiEdit3, FiX
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import ChatInbox from '../../components/dashboard/ChatInbox'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import api from '../../utils/api'

const UserDashboard = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [backgroundRefresh, setBackgroundRefresh] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    fetchOrders()

    // Auto-refresh orders every 2 minutes
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      })
    }
  }, [user])

  const fetchOrders = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true)
      } else {
        setBackgroundRefresh(true)
      }

      const response = await api.get('/orders')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (!isBackgroundRefresh) {
        // Only clear orders on initial load error if not background
        // Logic kept from original
        const token = localStorage.getItem('token')
        if (!token || error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
          setOrders([])
        }
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false)
      } else {
        setBackgroundRefresh(false)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      const response = await api.put('/auth/profile', formData)
      updateProfile(response.data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return FiCheck
      case 'processing': return FiPackage
      case 'shipped': return FiTruck
      case 'delivered': return FiAward
      case 'cancelled': return FiUser
      default: return FiClock
    }
  }

  const getOrderStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Order placed, waiting for vendor confirmation'
      case 'confirmed': return 'Order confirmed by vendor, preparing for processing'
      case 'processing': return 'Vendor is processing your order'
      case 'shipped': return 'Your order has been shipped and is on its way'
      case 'delivered': return 'Your order has been delivered successfully!'
      case 'cancelled': return 'This order has been cancelled'
      default: return 'Order status unknown'
    }
  }

  const getOrderProgress = (status) => {
    switch (status) {
      case 'pending': return { step: 1, total: 5, percentage: 20 }
      case 'confirmed': return { step: 2, total: 5, percentage: 40 }
      case 'processing': return { step: 3, total: 5, percentage: 60 }
      case 'shipped': return { step: 4, total: 5, percentage: 80 }
      case 'delivered': return { step: 5, total: 5, percentage: 100 }
      case 'cancelled': return { step: 0, total: 5, percentage: 0 }
      default: return { step: 1, total: 5, percentage: 20 }
    }
  }

  const getOrderTimeline = (order) => {
    return [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        date: order.createdAt,
        completed: true,
        icon: FiShoppingBag
      },
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'Vendor has confirmed your order',
        date: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? order.updatedAt : null,
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
        icon: FiCheck
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Vendor is preparing your order',
        date: ['processing', 'shipped', 'delivered'].includes(order.status) ? order.updatedAt : null,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        icon: FiPackage
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order is on its way',
        date: ['shipped', 'delivered'].includes(order.status) ? order.updatedAt : null,
        completed: ['shipped', 'delivered'].includes(order.status),
        icon: FiTruck
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        date: order.status === 'delivered' ? order.updatedAt : null,
        completed: order.status === 'delivered',
        icon: FiAward
      }
    ]
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'messages', label: 'Messages', icon: FiMessageCircle },
    { id: 'profile', label: 'Profile', icon: FiSettings }
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Customer Dashboard" navItems={navItems}>
      {/* Header Info */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your orders and account</p>
        </div>
        {backgroundRefresh && (
          <div className="flex items-center text-sm text-gray-500">
            <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
            <span>Syncing...</span>
          </div>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders"
              value={orders.length}
              icon={FiShoppingBag}
              color="blue"
            />
            <StatCard
              title="Total Spent"
              value={`$${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`}
              icon={FiDollarSign}
              color="green"
            />
            <StatCard
              title="Completed"
              value={orders.filter(order => order.status === 'delivered').length}
              icon={FiAward}
              color="purple"
            />
            <StatCard
              title="In Progress"
              value={orders.filter(order => ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)).length}
              icon={FiClock}
              color="yellow"
            />
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiShoppingBag className="w-5 h-5 mr-2 text-primary-600" />
                Recent Orders
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium" onClick={() => setActiveTab('orders')}>
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => {
                  const StatusIcon = getOrderStatusIcon(order.status)
                  return (
                    <div key={order._id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <FiPackage className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h4>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">${order.total.toFixed(2)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)} mt-1`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Account Check */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <FiMail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <FiUser className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <FiAward className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Orders</h3>
            <button onClick={() => fetchOrders()} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
              <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Orders Found</h3>
              <p className="text-gray-500 mt-2">Check back after your first purchase!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const StatusIcon = getOrderStatusIcon(order.status)
                const timeline = getOrderTimeline(order)
                const progress = getOrderProgress(order.status)

                return (
                  <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Order Header */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <FiCalendar />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">${order.total.toFixed(2)}</p>
                        <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          <StatusIcon className="mr-1" />
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Progress for active orders */}
                      {['pending', 'confirmed', 'processing', 'shipped'].includes(order.status) && (
                        <div className="mb-8">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Order Progress</span>
                            <span className="text-gray-500">{progress.step} of {progress.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }}></div>
                          </div>
                          <div className="mt-6 flex justify-between relative">
                            {/* Simplified Timeline Visual */}
                            {timeline.map((step, idx) => (
                              <div key={step.id} className="flex flex-col items-center z-10 w-20">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                  <step.icon />
                                </div>
                                <p className="text-[10px] mt-2 text-center text-gray-500 hidden md:block">{step.title}</p>
                              </div>
                            ))}
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                        <h5 className="font-semibold text-gray-900 dark:text-white">Items</h5>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <FiPackage />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Summary Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="font-medium text-gray-900 dark:text-white">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                              <span className="font-medium text-gray-900 dark:text-white">${order.shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                              <span className="font-bold text-gray-900 dark:text-white">Total</span>
                              <span className="font-bold text-primary-600">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="h-[600px] flex flex-col">
          <ChatInbox />
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FiSettings className="mr-2" /> Profile Settings
            </h3>
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                // Reset form data if cancelling
                if (isEditing && user) {
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    address: {
                      street: user.address?.street || '',
                      city: user.address?.city || '',
                      state: user.address?.state || '',
                      zipCode: user.address?.zipCode || '',
                      country: user.address?.country || ''
                    }
                  })
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center"
            >
              {isEditing ? <FiX className="mr-2" /> : <FiEdit3 className="mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 flex items-center">
                    <FiMail className="mr-2 text-gray-400" />
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 flex items-center">
                    <FiPhone className="mr-2 text-gray-400" />
                    {user?.phone || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 uppercase text-xs font-bold tracking-wider inline-block">
                    {user?.role}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 flex items-start">
                  <FiMapPin className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                  <div>
                    {user?.address?.street ? (
                      <>
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                        <p>{user.address.country}</p>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">No address set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State/Province</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center"
                >
                  {saveLoading && <FiRefreshCw className="animate-spin mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">Need to update your password? Contact support for assistance.</p>
          </div>
        </div>
      )}


    </DashboardLayout>
  )
}

export default UserDashboard
