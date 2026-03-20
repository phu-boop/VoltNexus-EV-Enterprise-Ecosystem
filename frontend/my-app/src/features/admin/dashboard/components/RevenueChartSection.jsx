import React from "react";
import RevenueChart from "../../../dealer/dashboard/components/RevenueChart";

/**
 * Revenue Chart Section Component
 * Chỉ hiển thị biểu đồ doanh thu
 */
const RevenueChartSection = ({ orders = [] }) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Báo Cáo Tài Chính</h2>
        <p className="text-gray-600">Xu hướng doanh thu theo thời gian</p>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <RevenueChart orders={orders} />
      </div>
    </div>
  );
};

export default RevenueChartSection;

