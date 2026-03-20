import React from "react";
import StatCard from "../../../dealer/dashboard/components/StatCard";
import {
  FiDollarSign,
  FiUsers,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";

/**
 * System Overview Component
 * Hiển thị tổng quan hệ thống cho ADMIN
 */
const SystemOverview = ({ 
  totalRevenue = 0,
  dealersByStatus = { ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 },
  totalOrdersB2B = 0,
  totalCustomers = 0
}) => {
  const totalDealers = dealersByStatus.ACTIVE + dealersByStatus.INACTIVE + dealersByStatus.SUSPENDED;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statCards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(totalRevenue),
      subtitle: "Toàn hệ thống",
      icon: FiDollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng Số Đại Lý",
      value: totalDealers.toString(),
      subtitle: `Active: ${dealersByStatus.ACTIVE} | Inactive: ${dealersByStatus.INACTIVE} | Suspended: ${dealersByStatus.SUSPENDED}`,
      icon: FiUsers,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng Số Đơn Hàng B2B",
      value: totalOrdersB2B.toString(),
      subtitle: "Đơn hàng B2B trong hệ thống",
      icon: FiShoppingCart,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tổng Số Khách Hàng",
      value: totalCustomers.toString(),
      subtitle: "Khách hàng trong hệ thống",
      icon: FiUser,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tổng Quan Hệ Thống</h2>
        <p className="text-gray-600">Thống kê tổng quan toàn hệ thống</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default SystemOverview;

