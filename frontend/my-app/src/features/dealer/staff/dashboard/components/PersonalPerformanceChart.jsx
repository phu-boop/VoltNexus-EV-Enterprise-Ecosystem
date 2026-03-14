import React, { useMemo } from "react";
import { FiActivity, FiCalendar } from "react-icons/fi";
import { calculateDailyOrders } from "../../../../admin/dashboard/utils/orderChartData";

/**
 * Personal Performance Chart Component
 * Biểu đồ hiệu suất làm việc cá nhân (số đơn xử lý/ngày)
 */
const PersonalPerformanceChart = ({ orders = [] }) => {
  // Tính số đơn hàng đã xử lý theo ngày (30 ngày gần nhất)
  const chartData = useMemo(() => {
    const dailyData = calculateDailyOrders(orders, 'day');
    
    // Lấy 30 ngày gần nhất
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Tạo map cho tất cả 30 ngày
    const dateMap = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dateMap[dateKey] = {
        date: dateKey,
        count: 0
      };
    }
    
    // Fill data từ orders
    dailyData.forEach(item => {
      if (dateMap[item.date]) {
        dateMap[item.date].count = item.count;
      }
    });
    
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  // Kích thước biểu đồ
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Tính toán giá trị min, max
  const hasData = chartData.length > 0;
  const maxCount = hasData ? Math.max(...chartData.map(d => d.count), 1) : 1;
  const minCount = 0;
  const range = maxCount - minCount || 1;

  // Tính toán điểm cho line chart
  const points = hasData ? chartData.map((data, index) => {
    const x = padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - ((data.count - minCount) / range) * graphHeight;
    return { x, y, ...data };
  }) : [];

  // Tạo path cho line
  const pathData = hasData && points.length > 0
    ? points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";

  // Tạo area path
  const areaPath = hasData && points.length > 0
    ? `${pathData} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : "";

  // Tính trung bình đơn hàng/ngày
  const avgOrdersPerDay = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length).toFixed(1)
    : 0;

  // Tính tổng đơn hàng trong 30 ngày
  const totalOrders = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiActivity className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Hiệu Suất Làm Việc Cá Nhân</h3>
      </div>

      {hasData ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Trung Bình/Ngày</p>
              <p className="text-2xl font-bold text-purple-600">{avgOrdersPerDay}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng 30 Ngày</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} className="w-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding.top + (i / 4) * graphHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 5}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {Math.round(maxCount - (i / 4) * range)}
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#areaGradientPersonalPerformance)"
                  opacity="0.3"
                />
              )}

              {/* Line */}
              {pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="areaGradientPersonalPerformance" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có dữ liệu hiệu suất</p>
        </div>
      )}
    </div>
  );
};

export default PersonalPerformanceChart;

