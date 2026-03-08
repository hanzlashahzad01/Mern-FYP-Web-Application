import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month</span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-full bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                    <Icon className="w-8 h-8" />
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
