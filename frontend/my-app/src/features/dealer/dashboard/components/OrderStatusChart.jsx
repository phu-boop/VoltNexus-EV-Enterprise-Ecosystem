import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { countOrdersByStatus } from "../utils/calculations";

/**
 * Order Status Chart Component
 * Biểu đồ tròn hiển thị phân bố đơn hàng theo trạng thái
 */
const OrderStatusChart = ({ orders = [] }) => {
  const statusCounts = countOrdersByStatus(orders);
  
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FiShoppingCart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Phân Bố Đơn Hàng Theo Trạng Thái</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu đơn hàng</p>
      </div>
    );
  }

  // Chỉ hiển thị các trạng thái có dữ liệu
  const statusData = [
    { label: "Chờ xử lý", count: statusCounts.PENDING || 0, color: "#3b82f6", bgColor: "bg-blue-50" },
    { label: "Đã xác nhận", count: statusCounts.CONFIRMED || 0, color: "#10b981", bgColor: "bg-green-50" },
    { label: "Đã giao", count: statusCounts.DELIVERED || 0, color: "#8b5cf6", bgColor: "bg-purple-50" },
    { label: "Đã duyệt", count: statusCounts.APPROVED || 0, color: "#f59e0b", bgColor: "bg-yellow-50" },
    { label: "Đã hủy", count: statusCounts.CANCELLED || 0, color: "#ef4444", bgColor: "bg-red-50" },
  ].filter(item => item.count > 0);

  // Tính phần trăm
  const statusWithPercent = statusData.map(item => ({
    ...item,
    percent: (item.count / total) * 100
  }));

  // Tính toán góc cho SVG pie chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  let currentAngle = 0;
  const paths = statusWithPercent.map((item, index) => {
    const percent = item.percent;
    const offset = circumference - (percent / 100) * circumference;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percent / 100) * 360;
    currentAngle = endAngle;
    
    // Hàm chuyển đổi góc sang tọa độ
    const getCoordinates = (angle) => {
      const x = 100 + radius * Math.cos((angle - 90) * (Math.PI / 180));
      const y = 100 + radius * Math.sin((angle - 90) * (Math.PI / 180));
      return { x, y };
    };

    const start = getCoordinates(startAngle);
    const end = getCoordinates(endAngle);
    const largeArc = percent > 50 ? 1 : 0;
    const path = `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    
    return { ...item, path, startAngle, endAngle };
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiShoppingCart className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phân Bố Đơn Hàng Theo Trạng Thái</h3>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {paths.map((item, index) => (
              <path
                key={index}
                d={item.path}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            ))}
            {/* Center circle */}
            <circle cx="100" cy="100" r="50" fill="white" />
            <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
              {total}
            </text>
            <text x="100" y="110" textAnchor="middle" className="text-sm fill-gray-600">
              Đơn Hàng
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {statusWithPercent.map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-3 ${item.bgColor} rounded-lg`}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{item.count}</span>
                <span className="text-sm text-gray-600 ml-2">({item.percent.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusChart;

