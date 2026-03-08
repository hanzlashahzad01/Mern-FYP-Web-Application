import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiSettings, FiCheckCircle, FiTrash2, FiUserCheck, FiUserX, FiEye, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import UserGrowthChart from '../../components/dashboard/UserGrowthChart'
import OrderStatusChart from '../../components/dashboard/OrderStatusChart'
import { motion } from 'framer-motion'
import ProductManagement from '../../components/dashboard/ProductManagement'
import OrderManagement from '../../components/dashboard/OrderManagement'
import AdminSettings from '../../components/dashboard/AdminSettings'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  })

  // Data States
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [vendorApprovals, setVendorApprovals] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Filters & Search
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('')
  const [vendorApprovalStatus, setVendorApprovalStatus] = useState('pending')

  // Pagination States
  const [userPagination, setUserPagination] = useState({
    currentPage: 1, totalPages: 1, totalUsers: 0, hasNextPage: false, hasPrevPage: false
  })
  const [vendorApprovalPagination, setVendorApprovalPagination] = useState({
    currentPage: 1, totalPages: 1, totalUsers: 0, hasNextPage: false, hasPrevPage: false
  })

  // Action States
  const [actionLoading, setActionLoading] = useState({})

  // Modals (Keeping the state but simplifying the render for now to keep code clean)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // API Calls
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status })
      })
      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setUserPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchVendorApprovals = async (page = 1, status = 'pending') => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10', status: status })
      const response = await api.get(`/admin/vendor-approvals?${params}`)
      setVendorApprovals(response.data.users)
      setVendorApprovalPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching approvals:', error)
    }
  }

  // Effect Hooks
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchUsers(), fetchProducts(), fetchOrders(), fetchVendorApprovals()])
      setLoading(false)
    }
    initializeDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1, userSearch, userRoleFilter, userStatusFilter)
    if (activeTab === 'approvals') fetchVendorApprovals(1, vendorApprovalStatus)
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter, vendorApprovalStatus])

  // Actions
  const updateUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await api.put(`/admin/users/${userId}/status`, { isActive })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u))
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const approveVendor = async (vendorId) => {
    try {
      setActionLoading(prev => ({ ...prev, [vendorId]: true }))
      await api.put(`/admin/vendor-approvals/${vendorId}/approve`, {})
      setVendorApprovals(prev => prev.filter(v => v._id !== vendorId))
      toast.success('Vendor approved successfully')
    } catch (error) {
      toast.error('Failed to approve vendor')
    } finally {
      setActionLoading(prev => ({ ...prev, [vendorId]: false }))
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await api.delete(`/admin/products/${productId}`)
      setProducts(products.filter(p => p._id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'approvals', label: 'Approvals', icon: FiCheckCircle },
    { id: 'products', label: 'Products', icon: FiShoppingBag },
    { id: 'orders', label: 'Orders', icon: FiDollarSign },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Admin Panel" navItems={navItems}>
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.totalUsers} icon={FiUsers} color="blue" trend={12} />
              <StatCard title="Total Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} icon={FiDollarSign} color="green" trend={8} />
              <StatCard title="Total Products" value={stats.totalProducts} icon={FiShoppingBag} color="purple" trend={-2} />
              <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={FiCheckCircle} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <OrderStatusChart />
              </div>
            </div>

            <UserGrowthChart />
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {user.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          user.role === 'vendor' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => updateUserStatus(user._id, !user.isActive)}
                                className={`p-2 rounded-lg transition-colors ${user.isActive
                                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  }`}
                                title={user.isActive ? "Deactivate" : "Activate"}
                              >
                                {user.isActive ? <FiUserX /> : <FiUserCheck />}
                              </button>
                            </>
                          )}
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls could go here */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {users.length} users</span>
              <div className="flex space-x-2">
                <button
                  disabled={!userPagination.hasPrevPage}
                  onClick={() => fetchUsers(userPagination.currentPage - 1)}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!userPagination.hasNextPage}
                  onClick={() => fetchUsers(userPagination.currentPage + 1)}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Approvals</h2>
            </div>
            <div className="overflow-x-auto">
              {vendorApprovals.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No pending vendor approvals found.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Business</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {vendorApprovals.map(vendor => (
                      <tr key={vendor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{vendor.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {vendor.vendorDetails?.businessName || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveVendor(vendor._id)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor)
                                setShowRejectModal(true)
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <FiUserX className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}


        {/* Products Tab */}
        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            loading={loading}
            onDelete={deleteProduct}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            loading={loading}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
