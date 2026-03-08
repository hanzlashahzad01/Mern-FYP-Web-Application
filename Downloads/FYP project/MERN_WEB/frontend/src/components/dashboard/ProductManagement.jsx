import React, { useState } from 'react';
import { FiSearch, FiTrash2, FiEye, FiFilter, FiBox } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProductManagement = ({ products, loading, onDelete }) => {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.vendor?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiBox className="text-blue-500" />
                    Product Management
                </h2>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>

                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <FiBox />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{product.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">ID: {product._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-md text-xs font-medium">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {product.vendor?.name || 'Unknown Vendor'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        ${product.price?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`text-sm ${product.countInStock > 10 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {product.countInStock} units
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <FiEye />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product._id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
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

export default ProductManagement;
