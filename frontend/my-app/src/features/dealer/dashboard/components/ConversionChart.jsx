import React, { useMemo } from "react";
import { FiTrendingUp, FiCalendar } from "react-icons/fi";
import { calculateDailyOrders } from "../../../admin/dashboard/utils/orderChartData";

/**
 * Conversion Chart Component
 * Biểu đồ hiển thị tỷ lệ chuyển đổi báo giá → đơn hàng theo thời gian
 */
const ConversionChart = ({ orders = [], quotations = [] }) => {
  // Tính toán conversion rate theo ngày
  const chartData = useMemo(() => {
    // Tính quotations theo ngày thủ công
    const quotationMap = {};
    quotations.forEach(quotation => {
      if (!quotation.createdDate && !quotation.createdAt) return;
      const date = new Date(quotation.createdDate || quotation.createdAt);
      if (isNaN(date.getTime())) return;
      const dateKey = date.toISOString().split('T')[0];
      quotationMap[dateKey] = (quotationMap[dateKey] || 0) + 1;
    });
    
    const dailyOrders = calculateDailyOrders(orders, 'day');
    
    // Tính conversion rate cho mỗi ngày
    return dailyOrders.map(item => {
      const quotationCount = quotationMap[item.date] || 0;
      const conversionRate = quotationCount > 0 
        ? (item.count / quotationCount) * 100 
        : 0;
      
      return {
        ...item,
        quotationCount,
        conversionRate: Math.min(conversionRate, 100) // Cap at 100%
      };
    }).filter(item => item.quotationCount > 0); // Chỉ hiển thị ngày có báo giá
  }, [orders, quotations]);

  // Kích thước biểu đồ
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Tính toán giá trị min, max
  const hasData = chartData.length > 0;
  const maxRate = hasData ? Math.max(...chartData.map(d => d.conversionRate), 1) : 100;
  const minRate = 0;
  const range = maxRate - minRate || 1;

  // Tính toán điểm cho line chart
  const points = hasData ? chartData.map((data, index) => {
    const x = padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - ((data.conversionRate - minRate) / range) * graphHeight;
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

  // Tính trung bình conversion rate
  const avgConversionRate = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + d.conversionRate, 0) / chartData.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <FiTrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">Tỷ Lệ Chuyển Đổi Báo Giá → Đơn Hàng</h3>
      </div>

      {hasData ? (
        <>
          {/* Summary Stat */}
          <div className="mb-6">
            <div className="bg-green-50 p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600 mb-1">Tỷ Lệ Chuyển Đổi Trung Bình</p>
              <p className="text-2xl font-bold text-green-600">{avgConversionRate}%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} className="w-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding.top + (i / 4) * graphHeight;
                const value = maxRate - (i / 4) * range;
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
                      {value.toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#areaGradientConversion)"
                  opacity="0.3"
                />
              )}

              {/* Line */}
              {pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Tooltip value */}
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700"
                  >
                    {point.conversionRate.toFixed(1)}%
                  </text>
                </g>
              ))}

              {/* Date labels */}
              {points.map((point, index) => (
                index % Math.ceil(points.length / 8) === 0 && (
                  <text
                    key={index}
                    x={point.x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                    transform={`rotate(-45 ${point.x} ${chartHeight - padding.bottom + 20})`}
                  >
                    {new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </text>
                )
              ))}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="areaGradientConversion" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có dữ liệu chuyển đổi</p>
        </div>
      )}
    </div>
  );
};

export default ConversionChart;

