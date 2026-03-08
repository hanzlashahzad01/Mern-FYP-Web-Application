import React, { useState } from 'react';
import { FiSearch, FiEye, FiFilter, FiShoppingBag, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const OrderManagement = ({ orders, loading }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredOrders = orders.filter(order => {
        // Check safely for nested properties
        const orderIdMatch = order._id?.toLowerCase().includes(search.toLowerCase());
        const customerMatch = order.user?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesSearch = orderIdMatch || customerMatch;

        // Status filtering logic (adjust based on your actual order model fields)
        let matchesStatus = true;
        if (statusFilter === 'paid') matchesStatus = order.isPaid;
        if (statusFilter === 'unpaid') matchesStatus = !order.isPaid;
        if (statusFilter === 'delivered') matchesStatus = order.isDelivered;
        if (statusFilter === 'pending') matchesStatus = !order.isDelivered;

        return matchesSearch && matchesStatus;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiShoppingBag className="text-purple-500" />
                    Order Management
                </h2>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ID or Customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-64"
                        />
                    </div>

                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                        >
                            <option value="">All Orders</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="delivered">Delivered</option>
                            <option value="pending">Pending Delivery</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs text-purple-600 font-bold">
                                                {order.user?.name?.[0] || 'U'}
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{order.user?.name || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        ${order.totalPrice?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isPaid
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {order.isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isDelivered
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {order.isDelivered ? 'Delivered' : 'Processing'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                                            <FiEye />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default OrderManagement;
