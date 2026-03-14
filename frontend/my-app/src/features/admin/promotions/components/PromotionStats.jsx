// features/admin/promotions/components/PromotionStats.js
import React from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  PlayIcon, 
  XCircleIcon,
  StopIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, color, icon: Icon, description }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${color.bg}`}>
        <Icon className={`h-6 w-6 ${color.text}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color.text}`}>{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export const PromotionStats = ({ promotions }) => {
  const stats = {
    total: promotions.length,
    pending: promotions.filter(p => p.status === 'UPCOMING').length,
    active: promotions.filter(p => p.status === 'ACTIVE').length,
    expired: promotions.filter(p => p.status === 'EXPIRED').length,
    inactive: promotions.filter(p => p.status === 'INACTIVE').length,
  };

  const statConfigs = [
    {
      title: 'Tổng số',
      value: stats.total,
      color: { bg: 'bg-blue-100', text: 'text-blue-600' },
      icon: ChartBarIcon,
      description: 'Tất cả khuyến mãi'
    },
    {
      title: 'Chờ xác thực',
      value: stats.pending,
      color: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      icon: ClockIcon,
      description: 'Cần phê duyệt'
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
      color: { bg: 'bg-green-100', text: 'text-green-600' },
      icon: PlayIcon,
      description: 'Đang chạy'
    },
    {
      title: 'Đã hết hạn',
      value: stats.expired,
      color: { bg: 'bg-red-100', text: 'text-red-600' },
      icon: XCircleIcon,
      description: 'Kết thúc'
    },
    {
      title: 'Không hoạt động',
      value: stats.inactive,
      color: { bg: 'bg-gray-100', text: 'text-gray-600' },
      icon: StopIcon,
      description: 'Đã tắt'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statConfigs.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default PromotionStats;