import React, { useState, useEffect } from 'react';
import {
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiEye, FiTrendingUp,
  FiShoppingBag, FiDollarSign, FiStar, FiUsers, FiSettings, FiUser,
  FiImage, FiTag, FiMapPin, FiClock, FiAward, FiShare2, FiBarChart,
  FiMessageCircle, FiRefreshCw, FiCheck, FiMail, FiPhone, FiGlobe, FiX, FiCamera
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import api from '../../utils/api';
import ChatInbox from '../../components/dashboard/ChatInbox';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    tags: '',
    materials: '',
    careInstructions: '',
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'g' }
  });

  const [profileForm, setProfileForm] = useState({
    shopName: '',
    bio: '',
    tagline: '',
    specialties: '',
    location: { address: '', city: '', state: '', country: '', zipCode: '' },
    experience: { years: '', description: '' },
    contactInfo: { phone: '', email: '', website: '' }
  });

  const categories = [
    'Jewelry', 'Home Decor', 'Art & Prints', 'Clothing', 'Pottery',
    'Textiles', 'Bath & Body', 'Leather', 'Glass', 'Metalwork',
    'Kitchen', 'Garden', 'Beauty', 'Accessories'
  ];

  // Dummy analytics data for charts
  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 600 },
    { name: 'Thu', sales: 800 },
    { name: 'Fri', sales: 500 },
    { name: 'Sat', sales: 900 },
    { name: 'Sun', sales: 1100 },
  ];

  const categoryDistribution = [
    { name: 'Jewelry', value: 400 },
    { name: 'Pottery', value: 300 },
    { name: 'Art', value: 300 },
    { name: 'Decor', value: 200 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Calculate real category distribution
  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    const existing = acc.find(item => item.name === cat);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: cat, value: 1 });
    }
    return acc;
  }, []);

  // Calculate weekly sales from orders
  const getWeeklySales = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesMap = {};
    days.forEach(d => salesMap[d] = 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= oneWeekAgo) {
        const dayName = days[orderDate.getDay()];
        salesMap[dayName] += (order.vendorOrders?.[0]?.vendorAmount || 0);
      }
    });

    return days.map(d => ({ name: d, sales: Math.round(salesMap[d]) }));
  };

  const dynamicSalesData = getWeeklySales();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchVendorProfile();
    fetchUnreadCount();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/vendor/me');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/vendor');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderId}/vendor-status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const response = await api.get('/vendors/profile/me');
      if (response.data.profile) {
        setVendorProfile(response.data.profile);
        const p = response.data.profile;
        setProfileForm({
          shopName: p.shopName || '',
          bio: p.bio || '',
          tagline: p.tagline || '',
          specialties: p.specialties?.join(', ') || '',
          location: p.location || { address: '', city: '', state: '', country: '', zipCode: '' },
          experience: p.experience || { years: '', description: '' },
          contactInfo: p.contactInfo || { phone: '', email: '', website: '' }
        });
      }
    } catch (error) {
      if (error.response?.status === 404) setVendorProfile(null);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (typeof productForm[key] === 'object') {
          formData.append(key, JSON.stringify(productForm[key]));
        } else {
          formData.append(key, productForm[key]);
        }
      });

      const images = document.getElementById('product-images').files;
      if (images.length === 0) return toast.error('Upload at least one image');
      Array.from(images).forEach(file => formData.append('images', file));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Product added successfully!');
      setShowAddProduct(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding product');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      materials: product.materials?.join(', ') || '',
      careInstructions: product.careInstructions || '',
      dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
      weight: product.weight || { value: '', unit: 'g' }
    });
    setShowEditProduct(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (typeof productForm[key] === 'object') {
          formData.append(key, JSON.stringify(productForm[key]));
        } else {
          formData.append(key, productForm[key]);
        }
      });

      const images = document.getElementById('edit-images').files;
      if (images.length > 0) {
        Array.from(images).forEach(file => formData.append('images', file));
        formData.append('replaceImages', 'true');
      }

      await api.put(`/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Product updated!');
      setShowEditProduct(false);
      fetchProducts();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();

      // Append basic fields
      formData.append('shopName', profileForm.shopName);
      formData.append('tagline', profileForm.tagline);
      formData.append('bio', profileForm.bio);
      formData.append('specialties', profileForm.specialties);

      // Append nested objects
      formData.append('location', JSON.stringify(profileForm.location));
      formData.append('experience', JSON.stringify(profileForm.experience));
      formData.append('contactInfo', JSON.stringify(profileForm.contactInfo));

      const pImg = document.getElementById('profile-image').files[0];
      const bImg = document.getElementById('banner-image').files[0];

      if (pImg) formData.append('profileImage', pImg);
      if (bImg) formData.append('bannerImage', bImg);

      if (!vendorProfile && !pImg) {
        toast.error('Profile image is required for new accounts');
        return;
      }

      if (vendorProfile) {
        await api.put('/vendors/profile/me', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/vendors/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Profile saved!');
      setShowProfileModal(false);
      fetchVendorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setActionLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'messages', label: 'Messages', icon: FiMessageCircle },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const totalSales = orders.reduce((sum, order) => sum + (order.vendorOrders?.[0]?.vendorAmount || 0), 0).toFixed(2);
  const pendingOrders = orders.filter(order => order.vendorOrders?.[0]?.status === 'pending').length;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Vendor Portal" navItems={navItems}>
      <div className="space-y-8">

        {/* Profile Alert */}
        {!vendorProfile && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0"><FiAward className="h-5 w-5 text-amber-400" /></div>
              <div className="ml-3">
                <p className="text-sm text-amber-700 font-medium">Complete your vendor profile to start selling and be visible in the marketplace!</p>
                <button onClick={() => setShowProfileModal(true)} className="mt-2 text-sm font-bold text-amber-800 underline">Set Up Profile →</button>
              </div>
            </div>
          </div>
        )}

        {/* Action Header */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500 bg-gray-100">
              {vendorProfile?.profileImage ? (
                <img src={vendorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><FiUser size={30} /></div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{vendorProfile?.shopName || 'Merchant Shop'}</h1>
              <p className="text-gray-500 dark:text-gray-400">{vendorProfile?.tagline || 'Manage your artisan business'}</p>
            </div>
          </div>
          <button onClick={() => setShowAddProduct(true)} className="btn-primary flex items-center space-x-2 px-5 py-3 rounded-xl">
            <FiPlus /> <span>New Product</span>
          </button>
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Products" value={products.length} icon={FiPackage} color="blue" />
              <StatCard title="Revenue" value={`$${totalSales}`} icon={FiDollarSign} color="green" />
              <StatCard title="Orders" value={orders.length} icon={FiShoppingBag} color="purple" />
              <StatCard title="Pending" value={pendingOrders} icon={FiClock} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Analysis Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center"><FiBarChart className="mr-2" /> Weekly Sales Analysis</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicSalesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold dark:text-white mb-6">Product Distribution</h3>
                <div className="h-[300px] w-full flex items-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col space-y-2 ml-4">
                    {categoryData.map((item, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold dark:text-white mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><FiShoppingBag /></div>
                      <div>
                        <p className="font-semibold dark:text-white">Order #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.vendorOrders?.[0]?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {order.vendorOrders?.[0]?.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <FiPackage size={100} className="mx-auto text-gray-200 mb-6" />
                <h2 className="text-2xl font-bold dark:text-white">No products yet</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Get started by creating your first product showcase for customers.</p>
                <button onClick={() => setShowAddProduct(true)} className="btn-primary px-8 py-3 rounded-xl font-bold">Add Your First Product</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative h-56 bg-gray-100 dark:bg-gray-700">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><FiImage size={40} /></div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditProduct(product)} className="p-2 bg-white/90 rounded-full shadow-md text-primary-600 hover:bg-white"><FiEdit2 /></button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate flex-1 mr-2">{product.name}</h4>
                        <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <FiTag /> <span>{product.category}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <FiPackage /> <span>{product.stock} in stock</span>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => openEditProduct(product)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold flex items-center justify-center">
                          <FiEdit2 className="mr-2" /> Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold flex items-center justify-center">
                          <FiTrash2 className="mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Similar updates for Orders and Messages templates... */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <FiShoppingBag size={80} className="mx-auto text-gray-100 mb-6" />
                <h2 className="text-2xl font-bold dark:text-white">Waiting for orders...</h2>
                <p className="text-gray-500">Your customer orders will appear here once they start buying.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center border-b dark:border-gray-700">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Order ID</span>
                      <h4 className="text-lg font-bold dark:text-white">#{order._id.slice(-8).toUpperCase()}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">${order.vendorOrders?.[0]?.vendorAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Net Earnings</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.vendorOrders?.[0]?.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                        <button
                          key={status}
                          disabled={actionLoading}
                          onClick={() => updateOrderStatus(order._id, status)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${order.vendorOrders?.[0]?.status === status
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-500'
                            }`}
                        >
                          {status.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ChatInbox />
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: General Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
                  <div className="relative pt-8 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-3xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800 mb-4 transform -rotate-3 hover:rotate-0 transition-transform bg-gray-100">
                      {vendorProfile?.profileImage ? (
                        <img src={vendorProfile.profileImage} alt="Shop" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><FiCamera size={40} /></div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white">{vendorProfile?.shopName || 'Shop Name'}</h2>
                    <p className="text-sm text-primary-600 font-bold uppercase tracking-widest mt-1">VERIFIED ARTISAN</p>
                    <button onClick={() => setShowProfileModal(true)} className="mt-6 w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 dark:text-white transition-colors border border-gray-100 dark:border-gray-600">Edit Public Profile</button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold dark:text-white mb-6">Contact & Social</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FiMail /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Public Email</p>
                        <p className="text-sm dark:text-white font-medium">{vendorProfile?.contactInfo?.email || 'Not shared'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><FiPhone /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                        <p className="text-sm dark:text-white font-medium">{vendorProfile?.contactInfo?.phone || 'Not shared'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FiGlobe /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Website</p>
                        <p className="text-sm dark:text-white font-medium truncate max-w-[150px]">{vendorProfile?.contactInfo?.website || 'artisanmart.com/shop'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Settings */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold dark:text-white mb-8 border-b dark:border-gray-700 pb-4">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Shop Bio</label>
                      <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">{vendorProfile?.bio || 'Introduce your craft to the world...'}</p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center"><FiMapPin className="mr-2" /> Location</label>
                        <p className="mt-2 text-gray-900 dark:text-white font-bold">
                          {vendorProfile?.location?.address ? `${vendorProfile.location.address}, ${vendorProfile.location.city}` : 'No address specified'}
                        </p>
                        <p className="text-sm text-gray-500">{vendorProfile?.location?.country || 'Earth'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center"><FiStar className="mr-2" /> Specialties</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {vendorProfile?.specialties?.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">{s}</span>
                          )) || <span className="text-gray-400 text-sm italic">None added</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {(showAddProduct || showEditProduct) && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ y: 50 }} animate={{ y: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden mt-20 mb-20"
              >
                <div className="flex justify-between items-center p-8 bg-gray-50 dark:bg-gray-700/50">
                  <h2 className="text-2xl font-bold dark:text-white">{showEditProduct ? 'Modify Product' : 'Add New Craft'}</h2>
                  <button onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"><FiX size={24} /></button>
                </div>

                <form onSubmit={showEditProduct ? handleEditProduct : handleAddProduct} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Name & Desc */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <label className="block text-sm font-bold dark:text-gray-300 mb-2">Product Name</label>
                        <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-primary-100 transition-all dark:text-white" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold dark:text-gray-300 mb-2">Full Description</label>
                        <textarea rows={4} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-primary-100 transition-all dark:text-white" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
                      </div>
                    </div>

                    {/* Numeric Data */}
                    <div>
                      <label className="block text-sm font-bold dark:text-gray-300 mb-2">Price ($)</label>
                      <input type="number" step="0.01" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold text-indigo-600 text-xl" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold dark:text-gray-300 mb-2">Initial Stock</label>
                      <input type="number" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none dark:text-white" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required />
                    </div>

                    {/* Selectors */}
                    <div className="md:col-span-2 flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold dark:text-gray-300 mb-2">Category</label>
                        <select className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none dark:text-white" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required>
                          <option value="">Choose category...</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold dark:text-gray-300 mb-2">Upload High-Res Images</label>
                        <div className="relative group">
                          <input id={showEditProduct ? 'edit-images' : 'product-images'} type="file" multiple className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                          <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                            <FiImage className="mr-2" /> {showEditProduct ? 'Replace existing images?' : 'Tap to select photos'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-8 border-t dark:border-gray-700">
                    <button type="button" onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }} className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={actionLoading} className="px-10 py-4 bg-primary-600 text-white rounded-[1.5rem] font-bold shadow-xl hover:bg-primary-700 transform hover:-translate-y-1 transition-all">
                      {actionLoading ? 'Saving...' : showEditProduct ? 'Save Changes' : 'Confirm Launch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {showProfileModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative p-8">
                <h2 className="text-2xl font-bold dark:text-white mb-8">Establish Your Marketplace Identity</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Shop Name</label>
                      <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-primary-100" value={profileForm.shopName} onChange={e => setProfileForm({ ...profileForm, shopName: e.target.value })} required placeholder="e.g. Vintage Vessels" />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Profile Image</label>
                      <input type="file" id="profile-image" className="w-full text-xs" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Banner Image</label>
                      <input type="file" id="banner-image" className="w-full text-xs" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Location Address</label>
                      <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none" value={profileForm.location.address} onChange={e => setProfileForm({ ...profileForm, location: { ...profileForm.location, address: e.target.value } })} required />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                      <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none" value={profileForm.contactInfo.phone} onChange={e => setProfileForm({ ...profileForm, contactInfo: { ...profileForm.contactInfo, phone: e.target.value } })} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                      <input type="email" className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none" value={profileForm.contactInfo.email} onChange={e => setProfileForm({ ...profileForm, contactInfo: { ...profileForm.contactInfo, email: e.target.value } })} />
                    </div>
                  </div>

                  <div className="pt-8 flex space-x-4">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-4 text-gray-400 font-bold">Close</button>
                    <button type="submit" disabled={actionLoading} className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl hover:bg-primary-700 transition-colors">
                      {actionLoading ? 'Please Wait...' : 'Save Workshop Profile'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
