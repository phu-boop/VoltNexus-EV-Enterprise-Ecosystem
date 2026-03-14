import React, { useMemo } from "react";
import { FiTrendingUp } from "react-icons/fi";

/**
 * Top Dealers Chart Component
 * Biểu đồ cột ngang hiển thị top đại lý theo doanh thu
 */
const TopDealersChart = ({ orders = [], dealers = [] }) => {
  // Tính doanh thu theo đại lý
  const dealerRevenue = useMemo(() => {
    const revenueMap = {};
    
    orders.forEach(order => {
      const dealerId = order.dealerId;
      if (!dealerId) return;
      
      const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
      const statusStr = typeof status === 'object' ? status?.name : status;
      const upperStatus = String(statusStr || '').toUpperCase();
      
      if (['CONFIRMED', 'DELIVERED', 'APPROVED'].includes(upperStatus)) {
        if (!revenueMap[dealerId]) {
          revenueMap[dealerId] = {
            dealerId,
            revenue: 0,
            orderCount: 0
          };
        }
        revenueMap[dealerId].revenue += parseFloat(order.totalAmount) || 0;
        revenueMap[dealerId].orderCount += 1;
      }
    });
    
    // Lấy tên đại lý
    const result = Object.values(revenueMap).map(item => {
      const dealer = dealers.find(d => (d.dealerId || d.id) === item.dealerId);
      return {
        ...item,
        dealerName: dealer?.dealerName || dealer?.name || `Đại lý ${item.dealerId.substring(0, 8)}`
      };
    });
    
    // Sắp xếp theo doanh thu giảm dần và lấy top 5
    return result.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders, dealers]);

  const maxRevenue = dealerRevenue.length > 0 
    ? Math.max(...dealerRevenue.map(d => d.revenue), 1) 
    : 1;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (dealerRevenue.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Top 5 Đại Lý Theo Doanh Thu</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu doanh thu theo đại lý</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiTrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Top 5 Đại Lý Theo Doanh Thu</h3>
      </div>
      
      <div className="space-y-4">
        {dealerRevenue.map((item, index) => {
          const percentage = (item.revenue / maxRevenue) * 100;
          
          return (
            <div key={item.dealerId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.dealerName}</p>
                    <p className="text-xs text-gray-600">{item.orderCount} đơn hàng</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopDealersChart;

