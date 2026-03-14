import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, Activity } from 'lucide-react';

const UserStatistics = ({ statistics }) => {
    if (!statistics) return null;

    const stats = [
        {
            label: 'Tổng số người dùng',
            value: statistics.totalUsers,
            icon: Users,
            color: 'blue',
            change: statistics.userGrowth
        },
        {
            label: 'Đang hoạt động',
            value: statistics.activeUsers,
            icon: UserCheck,
            color: 'green',
            percentage: Math.round((statistics.activeUsers / statistics.totalUsers) * 100)
        },
        {
            label: 'Ngừng hoạt động',
            value: statistics.inactiveUsers,
            icon: UserX,
            color: 'red',
            percentage: Math.round((statistics.inactiveUsers / statistics.totalUsers) * 100)
        },
        {
            label: 'Tăng trưởng',
            value: `${statistics.userGrowth}%`,
            icon: TrendingUp,
            color: 'purple',
            description: 'So với tháng trước'
        }
    ];

    const roleDistribution = statistics.roleDistribution || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Statistics Cards */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tổng quan người dùng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-600" />
                    Phân bổ vai trò
                </h3>
                <div className="space-y-3">
                    {Object.entries(roleDistribution).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                                {role.toLowerCase().replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ 
                                            width: `${(count / statistics.totalUsers) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                    {count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.percentage && (
                        <p className="text-xs text-gray-500 mt-1">
                            {stat.percentage}% tổng số
                        </p>
                    )}
                    {stat.change && (
                        <p className="text-xs text-green-600 mt-1">
                            ↑ {stat.change}% so với tháng trước
                        </p>
                    )}
                    {stat.description && (
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default UserStatistics;