import React from "react";
import StatCard from "../../../dashboard/components/StatCard";
import {
  formatCurrency,
  calculateTotalRevenue,
  countOrdersByStatus,
  countQuotationsByStatus,
  calculatePercentageChange,
} from "../../../dashboard/utils/calculations";
import {
  FiDollarSign,
  FiShoppingCart,
  FiFileText,
} from "react-icons/fi";

/**
 * Personal Statistics Component
 * Hiển thị thống kê cá nhân của staff
 */
const PersonalStatistics = ({ 
  orders = [], 
  quotations = [], 
  prevOrders = [], 
  prevQuotations = [] 
}) => {
  // Tính toán doanh số cá nhân
  const currentRevenue = calculateTotalRevenue(orders);
  const prevRevenue = calculateTotalRevenue(prevOrders);
  const revenueChange = calculatePercentageChange(currentRevenue, prevRevenue);

  // Đếm orders theo trạng thái
  const orderStatusCounts = countOrdersByStatus(orders);
  const totalOrders = orders.length;
  const prevTotalOrders = prevOrders.length;
  const ordersChange = calculatePercentageChange(totalOrders, prevTotalOrders);

  // Đếm quotations theo trạng thái
  const quotationStatusCounts = countQuotationsByStatus(quotations);
  const totalQuotations = quotations.length;
  const prevTotalQuotations = prevQuotations.length;
  const quotationsChange = calculatePercentageChange(totalQuotations, prevTotalQuotations);

  const statCards = [
    {
      title: "Doanh Số Cá Nhân",
      value: formatCurrency(currentRevenue),
      subtitle: "Tháng này",
      trend: "so với tháng trước",
      trendValue: revenueChange,
      icon: FiDollarSign,
      color: "green",
    },
    {
      title: "Số Đơn Hàng Của Tôi",
      value: totalOrders,
      subtitle: `${orderStatusCounts.CONFIRMED} đã xác nhận, ${orderStatusCounts.DELIVERED} đã giao`,
      trend: "so với tháng trước",
      trendValue: ordersChange,
      icon: FiShoppingCart,
      color: "blue",
    },
    {
      title: "Số Báo Giá Đã Tạo",
      value: totalQuotations,
      subtitle: `${quotationStatusCounts.SENT} đã gửi, ${quotationStatusCounts.ACCEPTED} đã chấp nhận`,
      trend: "so với tháng trước",
      trendValue: quotationsChange,
      icon: FiFileText,
      color: "purple",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thống Kê Cá Nhân</h2>
        <p className="text-gray-600">Thống kê về doanh số và hoạt động của bạn</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Chi tiết Orders theo trạng thái */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn Hàng Của Tôi Theo Trạng Thái</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{orderStatusCounts.PENDING}</p>
            <p className="text-sm text-gray-600 mt-1">Chờ xử lý</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{orderStatusCounts.CONFIRMED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã xác nhận</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{orderStatusCounts.DELIVERED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã giao</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{orderStatusCounts.APPROVED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã duyệt</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{orderStatusCounts.CANCELLED}</p>
            <p className="text-sm text-gray-600 mt-1">Đã hủy</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PersonalStatistics;

