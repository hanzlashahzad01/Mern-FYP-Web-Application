import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const data = [
    { name: 'Jan', vendors: 4, customers: 24 },
    { name: 'Feb', vendors: 3, customers: 13 },
    { name: 'Mar', vendors: 2, customers: 38 },
    { name: 'Apr', vendors: 6, customers: 39 },
    { name: 'May', vendors: 8, customers: 48 },
    { name: 'Jun', vendors: 5, customers: 38 },
    { name: 'Jul', vendors: 7, customers: 43 },
];

const UserGrowthChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                    <XAxis
                        dataKey="name"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                    <YAxis
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            color: isDark ? '#ffffff' : '#000000'
                        }}
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Bar dataKey="customers" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="vendors" stackId="a" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;
