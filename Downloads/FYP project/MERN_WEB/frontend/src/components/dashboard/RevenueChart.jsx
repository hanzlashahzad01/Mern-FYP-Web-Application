import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
];

const RevenueChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
