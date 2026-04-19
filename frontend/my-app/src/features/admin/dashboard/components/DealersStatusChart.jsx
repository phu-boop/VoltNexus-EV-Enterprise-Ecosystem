import React from "react";
import { FiUsers } from "react-icons/fi";

/**
 * Dealers Status Chart Component
 * Biểu đồ tròn hiển thị phân bố đại lý theo trạng thái
 */
const DealersStatusChart = ({ dealersByStatus = { ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 } }) => {
  const total = dealersByStatus.ACTIVE + dealersByStatus.INACTIVE + dealersByStatus.SUSPENDED;
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân Bố Đại Lý Theo Trạng Thái</h3>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu đại lý</p>
      </div>
    );
  }

  const activePercent = (dealersByStatus.ACTIVE / total) * 100;
  const inactivePercent = (dealersByStatus.INACTIVE / total) * 100;
  const suspendedPercent = (dealersByStatus.SUSPENDED / total) * 100;

  // Tính toán góc cho SVG pie chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const activeOffset = circumference - (activePercent / 100) * circumference;
  const inactiveOffset = circumference - (inactivePercent / 100) * circumference;
  const suspendedOffset = circumference - (suspendedPercent / 100) * circumference;

  const activeStartAngle = 0;
  const inactiveStartAngle = (activePercent / 100) * 360;
  const suspendedStartAngle = ((activePercent + inactivePercent) / 100) * 360;

  // Hàm chuyển đổi góc sang tọa độ
  const getCoordinates = (angle, radius) => {
    const x = 100 + radius * Math.cos((angle - 90) * (Math.PI / 180));
    const y = 100 + radius * Math.sin((angle - 90) * (Math.PI / 180));
    return { x, y };
  };

  const activeEnd = getCoordinates(activeStartAngle + (activePercent / 100) * 360, radius);
  const inactiveEnd = getCoordinates(inactiveStartAngle + (inactivePercent / 100) * 360, radius);
  const suspendedEnd = getCoordinates(suspendedStartAngle + (suspendedPercent / 100) * 360, radius);

  // Tạo path cho từng phần
  const createPath = (startAngle, percent, color) => {
    if (percent === 0) return null;
    const endAngle = startAngle + (percent / 100) * 360;
    const start = getCoordinates(startAngle, radius);
    const end = getCoordinates(endAngle, radius);
    const largeArc = percent > 50 ? 1 : 0;
    return `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  const activePath = createPath(activeStartAngle, activePercent, '#10b981');
  const inactivePath = createPath(inactiveStartAngle, inactivePercent, '#f59e0b');
  const suspendedPath = createPath(suspendedStartAngle, suspendedPercent, '#ef4444');

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiUsers className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phân Bố Đại Lý Theo Trạng Thái</h3>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Active */}
            {activePath && (
              <path
                d={activePath}
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
            )}
            {/* Inactive */}
            {inactivePath && (
              <path
                d={inactivePath}
                fill="#f59e0b"
                stroke="white"
                strokeWidth="2"
              />
            )}
            {/* Suspended */}
            {suspendedPath && (
              <path
                d={suspendedPath}
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
            )}
            {/* Center circle */}
            <circle cx="100" cy="100" r="50" fill="white" />
            <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
              {total}
            </text>
            <text x="100" y="110" textAnchor="middle" className="text-sm fill-gray-600">
              Đại Lý
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium text-gray-900">Active</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{dealersByStatus.ACTIVE}</span>
              <span className="text-sm text-gray-600 ml-2">({activePercent.toFixed(1)}%)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="font-medium text-gray-900">Inactive</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{dealersByStatus.INACTIVE}</span>
              <span className="text-sm text-gray-600 ml-2">({inactivePercent.toFixed(1)}%)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="font-medium text-gray-900">Suspended</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{dealersByStatus.SUSPENDED}</span>
              <span className="text-sm text-gray-600 ml-2">({suspendedPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealersStatusChart;

