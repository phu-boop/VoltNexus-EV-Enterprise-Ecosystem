import React from 'react';

const StatsOverview = ({ quotations, onStatusFilter }) => {
  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'DRAFT').length,
    pending: quotations.filter(q => q.status === 'PENDING').length,
    sent: quotations.filter(q => q.status === 'SENT').length,
    accepted: quotations.filter(q => q.status === 'ACCEPTED').length,
    complete: quotations.filter(q => q.status === 'COMPLETE').length,
    rejected: quotations.filter(q => q.status === 'REJECTED').length,
    expired: quotations.filter(q => q.status === 'EXPIRED').length,
  };

  // Tính tổng giá trị các báo giá đã chấp nhận và hoàn thành
  const totalValue = quotations
    .filter(q => ['ACCEPTED', 'COMPLETE'].includes(q.status))
    .reduce((sum, q) => sum + (q.finalPrice || 0), 0);

  const statCards = [
    {
      label: 'Tổng số BG',
      value: stats.total,
      percentage: '100%',
      color: 'from-gray-500 to-gray-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Tất cả báo giá',
      status: '',
      trend: 'total'
    },
    {
      label: 'Đang xử lý',
      value: stats.pending + stats.sent,
      percentage: quotations.length ? `${((stats.pending + stats.sent) / quotations.length * 100).toFixed(1)}%` : '0%',
      color: 'from-amber-500 to-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Chờ duyệt & đã gửi',
      status: ['PENDING', 'SENT'],
      trend: 'pending'
    },
    {
      label: 'Thành công',
      value: stats.accepted + stats.complete,
      percentage: quotations.length ? `${((stats.accepted + stats.complete) / quotations.length * 100).toFixed(1)}%` : '0%',
      color: 'from-green-500 to-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Đã hoàn thành',
      status: ['ACCEPTED', 'COMPLETE'],
      trend: 'success'
    },
    {
      label: 'Từ chối',
      value: stats.rejected,
      percentage: quotations.length ? `${(stats.rejected / quotations.length * 100).toFixed(1)}%` : '0%',
      color: 'from-rose-500 to-rose-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Báo giá bị từ chối',
      status: 'REJECTED',
      trend: 'rejected'
    },
    {
      label: 'Tổng giá trị',
      value: totalValue,
      percentage: 'Doanh thu',
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Các BG đã thành công',
      status: ['ACCEPTED', 'COMPLETE'],
      trend: 'revenue',
      isCurrency: true
    }
  ];

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCardClick = (status) => {
    if (onStatusFilter && status) {
      onStatusFilter(status);
    }
  };

  const getTrendColor = (trend) => {
    const colors = {
      total: 'text-gray-600',
      pending: 'text-amber-600',
      success: 'text-green-600',
      rejected: 'text-rose-600',
      revenue: 'text-blue-600'
    };
    return colors[trend] || 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          onClick={() => handleCardClick(stat.status)}
          className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${
            stat.status ? 'hover:scale-105' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {stat.label}
              </p>
              <div className="flex items-baseline space-x-2 mb-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                </p>
                <span className={`text-xs font-semibold ${getTrendColor(stat.trend)}`}>
                  {stat.percentage}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {stat.description}
              </p>
            </div>
            
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm group-hover:shadow-md transition-all duration-300`}>
              {stat.icon}
            </div>
          </div>

          {/* Progress bar for status cards */}
          {stat.trend !== 'revenue' && stat.trend !== 'total' && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div 
                className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                style={{ 
                  width: stat.percentage 
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;