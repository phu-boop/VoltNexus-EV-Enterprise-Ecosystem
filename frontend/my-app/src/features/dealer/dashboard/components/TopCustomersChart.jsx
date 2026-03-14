import React, { useMemo } from "react";
import { FiUsers, FiTrendingUp } from "react-icons/fi";
import { formatCurrency } from "../utils/calculations";

/**
 * Top Customers Chart Component
 * Hiển thị top khách hàng theo doanh thu hoặc số đơn hàng
 */
const TopCustomersChart = ({ orders = [] }) => {
  // Tính toán top khách hàng
  const topCustomers = useMemo(() => {
    const customerMap = {};
    
    orders.forEach(order => {
      // Xử lý customerId - có thể là string, object, hoặc null
      let customerId = order.customerId;
      if (!customerId) return;
      
      // Nếu customerId là object, lấy id từ object
      if (typeof customerId === 'object') {
        customerId = customerId.id || customerId.customerId || customerId.toString();
      }
      
      // Chuyển sang string để làm key
      const customerIdStr = String(customerId);
      if (!customerIdStr || customerIdStr === 'undefined' || customerIdStr === 'null') return;
      
      const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
      const statusStr = typeof status === 'object' ? status?.name : status;
      const upperStatus = String(statusStr || '').toUpperCase();
      
      if (['CONFIRMED', 'DELIVERED', 'APPROVED'].includes(upperStatus)) {
        if (!customerMap[customerIdStr]) {
          // Tạo tên khách hàng - lấy từ nhiều nguồn
          let customerName = order.customerName || order.customer?.name;
          if (!customerName && order.customer) {
            customerName = order.customer.fullName || order.customer.firstName || order.customer.name;
          }
          if (!customerName) {
            // customerId là Long (number), hiển thị toàn bộ hoặc rút gọn nếu quá dài
            const idStr = customerIdStr.length > 10 ? customerIdStr.substring(0, 10) : customerIdStr;
            customerName = `Khách hàng ${idStr}`;
          }
          
          customerMap[customerIdStr] = {
            customerId: customerIdStr,
            revenue: 0,
            orderCount: 0,
            customerName
          };
        }
        customerMap[customerIdStr].revenue += parseFloat(order.totalAmount) || 0;
        customerMap[customerIdStr].orderCount += 1;
      }
    });
    
    // Sắp xếp theo doanh thu giảm dần và lấy top 5
    return Object.values(customerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const maxRevenue = topCustomers.length > 0 
    ? Math.max(...topCustomers.map(d => d.revenue), 1) 
    : 1;

  if (topCustomers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FiUsers className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Top Khách Hàng</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu khách hàng</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiTrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Top 5 Khách Hàng</h3>
      </div>
      
      <div className="space-y-4">
        {topCustomers.map((item, index) => {
          const percentage = (item.revenue / maxRevenue) * 100;
          
          return (
            <div key={item.customerId} className="space-y-2">
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
                    <p className="font-semibold text-gray-900 truncate">{item.customerName}</p>
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

export default TopCustomersChart;

