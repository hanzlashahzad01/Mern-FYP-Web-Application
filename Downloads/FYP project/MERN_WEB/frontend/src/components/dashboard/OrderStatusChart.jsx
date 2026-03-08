import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const data = [
    { name: 'Completed', value: 400 },
    { name: 'Processing', value: 300 },
    { name: 'Pending', value: 300 },
    { name: 'Cancelled', value: 100 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const OrderStatusChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            color: isDark ? '#ffffff' : '#000000'
                        }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderStatusChart;
