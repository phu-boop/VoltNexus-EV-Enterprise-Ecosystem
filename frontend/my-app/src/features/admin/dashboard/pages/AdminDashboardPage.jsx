import React, { useState, useEffect } from "react";
import SystemOverview from "../components/SystemOverview";
import QuickActionsAdmin from "../components/QuickActionsAdmin";
import RevenueChartSection from "../components/RevenueChartSection";
import DealersStatusChart from "../components/DealersStatusChart";
import OrdersChart from "../components/OrdersChart";
import TopDealersChart from "../components/TopDealersChart";
import CongratulationsCard from "../../../dealer/dashboard/components/CongratulationsCard";
import { fetchAdminDashboardData } from "../services/adminDashboardService";
import { useAuthContext } from "../../../auth/AuthProvider";
import { FiRefreshCw, FiSearch } from "react-icons/fi";

/**
 * Admin Dashboard Page
 */
const AdminDashboardPage = () => {
  const { fullName, name } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAdminDashboardData(dateRange);

      setDashboardData(data);
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold mb-2">Lỗi</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const userName = fullName || name || "Admin";

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header với Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bảng Điều Khiển
            </h1>
            <p className="text-gray-600">Tổng quan hệ thống và quản lý</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Congratulations Card */}
        <CongratulationsCard userName={userName} />

        {/* Quick Actions */}
        <QuickActionsAdmin />

        {/* System Overview */}
        <SystemOverview
          totalRevenue={dashboardData.totalRevenue}
          dealersByStatus={dashboardData.dealersByStatus}
          totalOrdersB2B={dashboardData.ordersB2B?.length || 0}
          totalCustomers={dashboardData.customers?.length || 0}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Dealers Status Chart */}
          <DealersStatusChart dealersByStatus={dashboardData.dealersByStatus} />

          {/* Top Dealers Chart */}
          <TopDealersChart
            orders={dashboardData.allOrders}
            dealers={dashboardData.dealers}
          />
        </div>

        {/* Orders Chart */}
        <div className="mb-6">
          <OrdersChart orders={dashboardData.allOrders} />
        </div>

        {/* Revenue Chart */}
        <RevenueChartSection orders={dashboardData.allOrders} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
