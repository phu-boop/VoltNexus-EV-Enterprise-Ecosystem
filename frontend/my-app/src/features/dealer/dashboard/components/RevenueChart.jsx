import React, { useState, useMemo } from "react";
import { FiTrendingUp, FiCalendar } from "react-icons/fi";
import { getChartData } from "../utils/chartData";
import { formatCurrency } from "../utils/calculations";

/**
 * Revenue Chart Component
 * Hiển thị biểu đồ doanh thu theo ngày/tuần/tháng
 */
const RevenueChart = ({ orders = [] }) => {
  const [periodType, setPeriodType] = useState("day"); // 'day', 'week', 'month'

  const chartData = useMemo(() => {
    return getChartData(orders, periodType);
  }, [orders, periodType]);

  // Kích thước biểu đồ
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Tính toán giá trị min, max để scale biểu đồ (chỉ khi có dữ liệu)
  const hasData = chartData.length > 0;
  const maxRevenue = hasData ? Math.max(...chartData.map(d => d.revenue), 1) : 1;
  const minRevenue = hasData ? Math.min(...chartData.map(d => d.revenue), 0) : 0;
  const range = maxRevenue - minRevenue || 1;

  // Tính toán điểm cho line chart (chỉ khi có dữ liệu)
  const points = hasData ? chartData.map((data, index) => {
    const x = padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - ((data.revenue - minRevenue) / range) * graphHeight;
    return { x, y, ...data };
  }) : [];

  // Tạo path cho line (chỉ khi có dữ liệu)
  const pathData = hasData && points.length > 0
    ? points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";

  // Tạo area path (để fill gradient) (chỉ khi có dữ liệu)
  const areaPath = hasData && points.length > 0
    ? `${pathData} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : "";

  const periodLabels = {
    day: "Ngày",
    week: "Tuần",
    month: "Tháng",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
            <FiTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Doanh Thu Theo Thời Gian</h3>
            <p className="text-sm text-gray-500">Biểu đồ doanh thu {periodLabels[periodType].toLowerCase()}</p>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {["day", "week", "month"].map((type) => (
            <button
              key={type}
              onClick={() => setPeriodType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                periodType === type
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {periodLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <div className="text-center">
            <FiCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu doanh thu</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="min-w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding.top + (i / 4) * graphHeight;
              const value = maxRevenue - (i / 4) * range;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + graphWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#areaGradient)"
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

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-7 transition-all cursor-pointer"
                />
                {/* Tooltip on hover */}
                <title>
                  {point.label}: {formatCurrency(point.revenue)}
                </title>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => {
              // Chỉ hiển thị một số label để tránh quá dày
              const showLabel = chartData.length <= 10 || index % Math.ceil(chartData.length / 8) === 0 || index === chartData.length - 1;
              if (!showLabel) return null;
              
              return (
                <text
                  key={index}
                  x={point.x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {point.label}
                </text>
              );
            })}

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={padding.left + graphWidth}
              y2={padding.top + graphHeight}
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + graphHeight}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Tổng Doanh Thu</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Trung Bình</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(
                chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Cao Nhất</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(maxRevenue)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;

