import React from "react";
import { FiTrendingUp, FiUsers } from "react-icons/fi";
import { dealerService } from "../../../admin/manageDealer/dealers/services/dealerService";
import { useState, useEffect } from "react";

/**
 * Top Dealers Supported Chart Component
 * Hiển thị top đại lý đã hỗ trợ (số đơn hàng đã xử lý cho từng đại lý)
 */
const TopDealersSupportedChart = ({ topDealers = [] }) => {
  const [dealersMap, setDealersMap] = useState({});

  useEffect(() => {
    // Fetch dealer names
    const fetchDealers = async () => {
      try {
        const response = await dealerService.getAll({ page: 0, size: 1000 });
        const dealers = response.data?.data?.content || response.data?.data || [];
        const map = {};
        dealers.forEach(dealer => {
          const id = dealer.dealerId || dealer.id;
          if (id) {
            map[id] = dealer.dealerName || dealer.name || `Đại lý ${id.substring(0, 8)}`;
          }
        });
        setDealersMap(map);
      } catch (error) {
        console.error("Error fetching dealers:", error);
      }
    };

    if (topDealers.length > 0) {
      fetchDealers();
    }
  }, [topDealers]);

  const maxOrderCount = topDealers.length > 0 
    ? Math.max(...topDealers.map(d => d.orderCount), 1) 
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

  if (topDealers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FiUsers className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Top Đại Lý Đã Hỗ Trợ</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu đại lý đã hỗ trợ</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiTrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Top Đại Lý Đã Hỗ Trợ</h3>
      </div>
      
      <div className="space-y-4">
        {topDealers.map((item, index) => {
          const percentage = (item.orderCount / maxOrderCount) * 100;
          const dealerName = dealersMap[item.dealerId] || `Đại lý ${item.dealerId?.substring(0, 8) || 'N/A'}`;
          
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
                    <p className="font-semibold text-gray-900 truncate">{dealerName}</p>
                    <p className="text-xs text-gray-600">{item.orderCount} đơn hàng</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(item.totalRevenue)}</p>
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

export default TopDealersSupportedChart;

