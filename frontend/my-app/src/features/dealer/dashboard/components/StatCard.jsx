import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

/**
 * Reusable Stat Card Component
 * Modern design với gradient icons và trend indicators
 */
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "blue",
  className = "" 
}) => {
  const colorConfig = {
    blue: {
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    green: {
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    purple: {
      gradient: "from-purple-500 to-indigo-500",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    orange: {
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    red: {
      gradient: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    indigo: {
      gradient: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
  };

  const config = colorConfig[color] || colorConfig.blue;
  const trendNum = parseFloat(trendValue) || 0;
  const isPositive = trendNum > 0;
  const isNegative = trendNum < 0;

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
          )}
          {trend && trendValue !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <FiTrendingUp className="w-4 h-4 text-green-600" />
              ) : isNegative ? (
                <FiTrendingDown className="w-4 h-4 text-red-600" />
              ) : null}
              <span
                className={`text-sm font-semibold ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {isPositive ? "+" : ""}{Math.abs(trendNum).toFixed(1)}%
              </span>
              {trend && (
                <span className="text-xs text-gray-500 ml-1">{trend}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`ml-4 p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

