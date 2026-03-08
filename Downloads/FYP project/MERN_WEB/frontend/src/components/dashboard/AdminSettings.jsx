import React, { useState } from 'react';
import { FiUser, FiLock, FiSettings, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        toast.success('Profile updated successfully!');
        // Implement actual API call here
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }
        toast.success('Password updated successfully!');
        // Implement actual API call here
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <FiUser className="text-blue-500" />
                    Profile Settings
                </h2>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        <FiSave />
                        <span>Save Changes</span>
                    </button>
                </form>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <FiLock className="text-red-500" />
                    Security
                </h2>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-colors"
                        />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        <FiLock />
                        <span>Update Password</span>
                    </button>
                </form>
            </div>

            {/* Platform Settings (Mock) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <FiSettings className="text-purple-500" />
                    Platform Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
                        <input type="text" defaultValue="ArtisanMart" disabled className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                        <input type="email" defaultValue="support@artisanmart.com" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Disable platform access for users</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer">
                            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-0"></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">New Vendor Registration</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow new vendors to sign up</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-500 cursor-pointer">
                            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-6"></span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSettings;
