import React from "react";
import { FiShoppingCart, FiCheckCircle, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import StatCard from "../../../dealer/dashboard/components/StatCard";

/**
 * Personal Work Overview Component
 * Hiển thị tổng quan công việc cá nhân của EVM Staff
 */
const PersonalWorkOverview = ({
  pendingOrders = [],
  completedOrdersThisMonth = [],
  completedOrdersPrevMonth = [],
  totalRevenueThisMonth = 0,
  totalRevenuePrevMonth = 0,
  revenueChangePercent = 0
}) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tổng Quan Công Việc Cá Nhân</h2>
        <p className="text-gray-600">Thống kê công việc và hiệu suất của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Đơn hàng B2B chờ duyệt */}
        <StatCard
          title="Đơn Hàng Chờ Duyệt"
          value={pendingOrders.length.toString()}
          subtitle="Đơn hàng cần phê duyệt"
          icon={FiShoppingCart}
          color="orange"
        />

        {/* Đơn hàng đã hoàn thành tháng này */}
        <StatCard
          title="Đơn Hàng Đã Hoàn Thành"
          value={completedOrdersThisMonth.length.toString()}
          subtitle={`Tháng này (${completedOrdersPrevMonth.length} tháng trước)`}
          icon={FiCheckCircle}
          color="green"
          trend={
            completedOrdersPrevMonth.length > 0
              ? {
                  value: Math.abs(
                    ((completedOrdersThisMonth.length - completedOrdersPrevMonth.length) /
                      completedOrdersPrevMonth.length) *
                      100
                  ).toFixed(1),
                  isPositive:
                    completedOrdersThisMonth.length >= completedOrdersPrevMonth.length,
                }
              : null
          }
        />

        {/* Tổng doanh thu tháng này */}
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(totalRevenueThisMonth)}
          subtitle={`Tháng này (${formatCurrency(totalRevenuePrevMonth)} tháng trước)`}
          icon={FiTrendingUp}
          color="blue"
          trend={
            totalRevenuePrevMonth > 0
              ? {
                  value: Math.abs(revenueChangePercent).toFixed(1),
                  isPositive: revenueChangePercent >= 0,
                }
              : null
          }
        />

        {/* Tỷ lệ hoàn thành */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ Lệ Hoàn Thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingOrders.length + completedOrdersThisMonth.length > 0
                  ? (
                      (completedOrdersThisMonth.length /
                        (pendingOrders.length + completedOrdersThisMonth.length)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    pendingOrders.length + completedOrdersThisMonth.length > 0
                      ? (completedOrdersThisMonth.length /
                          (pendingOrders.length + completedOrdersThisMonth.length)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalWorkOverview;

