import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiHome, FiUsers, FiShoppingBag, FiDollarSign, FiSettings, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, id, active, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </motion.button>
);

const DashboardLayout = ({ children, activeTab, setActiveTab, title = "Dashboard", navItems = [] }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 dark:text-white">
                    {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {title}
                </h1>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400"
                >
                    {theme === 'dark' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    {(isSidebarOpen || window.innerWidth >= 768) && (
                        <motion.aside
                            initial={{ x: -250 }}
                            animate={{ x: 0 }}
                            exit={{ x: -250 }}
                            className={`fixed md:sticky top-20 left-0 z-40 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300 ${isSidebarOpen ? 'block' : 'hidden md:block'
                                }`}
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                                        {title.charAt(0)}
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{title}</span>
                                </div>

                                <nav className="space-y-2">
                                    {navItems.map((item) => (
                                        <SidebarItem
                                            key={item.id}
                                            {...item}
                                            active={activeTab === item.id}
                                            onClick={setActiveTab}
                                        />
                                    ))}
                                </nav>
                            </div>

                            <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || 'User') + "&background=random"}
                                            alt={user?.name}
                                            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{user?.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'User'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-yellow-400 transition-colors"
                                    >
                                        {theme === 'dark' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-5rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
