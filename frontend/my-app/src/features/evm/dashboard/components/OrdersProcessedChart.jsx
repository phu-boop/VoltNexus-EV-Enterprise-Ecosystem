import React, { useState, useMemo } from "react";
import { FiShoppingCart, FiCalendar } from "react-icons/fi";
import { calculateDailyOrders, calculateWeeklyOrders, calculateMonthlyOrders } from "../../../admin/dashboard/utils/orderChartData";

/**
 * Orders Processed Chart Component
 * Biểu đồ hiển thị số lượng đơn hàng đã xử lý theo thời gian
 */
const OrdersProcessedChart = ({ orders = [] }) => {
  const [periodType, setPeriodType] = useState("day"); // 'day', 'week', 'month'

  const chartData = useMemo(() => {
    if (periodType === 'day') {
      return calculateDailyOrders(orders, 'day');
    } else if (periodType === 'week') {
      return calculateWeeklyOrders(orders);
    } else {
      return calculateMonthlyOrders(orders);
    }
  }, [orders, periodType]);

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

  // Tính toán điểm cho bar chart
  const points = hasData ? chartData.map((data, index) => {
    const x = padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - ((data.count - minCount) / range) * graphHeight;
    return { x, y, ...data };
  }) : [];

  const periodLabels = {
    day: "Ngày",
    week: "Tuần",
    month: "Tháng",
  };

  // Tính tổng số đơn hàng
  const totalOrders = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiShoppingCart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Biểu Đồ Đơn Hàng Đã Xử Lý</h3>
        </div>
        
        {/* Period Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {['day', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setPeriodType(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                periodType === period
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <>
          {/* Summary Stat */}
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600 mb-1">Tổng Đơn Đã Xử Lý</p>
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

              {/* Bars */}
              {points.map((point, index) => {
                const barWidth = graphWidth / points.length * 0.6;
                const barX = point.x - barWidth / 2;
                const barHeight = graphHeight - (point.y - padding.top);
                
                return (
                  <g key={index}>
                    {/* Bar */}
                    <rect
                      x={barX}
                      y={point.y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#barGradientProcessed)"
                      rx="4"
                    />
                    {/* Value label */}
                    <text
                      x={point.x}
                      y={point.y - 5}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-700"
                    >
                      {point.count}
                    </text>
                    {/* Date label */}
                    <text
                      x={point.x}
                      y={chartHeight - padding.bottom + 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      transform={`rotate(-45 ${point.x} ${chartHeight - padding.bottom + 20})`}
                    >
                      {periodType === 'day' 
                        ? new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                        : point.date.split(' ')[1] || point.date
                      }
                    </text>
                  </g>
                );
              })}

              {/* Gradient definition */}
              <defs>
                <linearGradient id="barGradientProcessed" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có dữ liệu đơn hàng đã xử lý</p>
        </div>
      )}
    </div>
  );
};

export default OrdersProcessedChart;

