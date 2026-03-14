import React, { useState, useEffect } from "react";
import PersonalWorkOverview from "../components/PersonalWorkOverview";
import InventoryManagement from "../components/InventoryManagement";
import OrdersProcessedChart from "../components/OrdersProcessedChart";
import PerformanceChart from "../components/PerformanceChart";
import TopDealersSupportedChart from "../components/TopDealersSupportedChart";
import QuickActionsEvmStaff from "../components/QuickActionsEvmStaff";
import CongratulationsCard from "../../../dealer/dashboard/components/CongratulationsCard";
import { fetchEvmStaffDashboardData } from "../services/evmDashboardService";
import { useAuthContext } from "../../../auth/AuthProvider";
import { FiRefreshCw, FiSearch } from "react-icons/fi";

/**
 * EVM Staff Dashboard Page
 */
const EvmStaffDashboardPage = () => {
  const { fullName, name } = useAuthContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userName = fullName || name || "Nhân viên";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy staffId từ sessionStorage nếu có
      const staffId = sessionStorage.getItem("userId") || null;
      
      const data = await fetchEvmStaffDashboardData(staffId);
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan công việc và hiệu suất</p>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Congratulations Card */}
        <CongratulationsCard userName={userName} />

        {/* Quick Actions */}
        <QuickActionsEvmStaff />

        {/* Personal Work Overview */}
        <PersonalWorkOverview
          pendingOrders={dashboardData.pendingOrders || []}
          completedOrdersThisMonth={dashboardData.completedOrdersThisMonth || []}
          completedOrdersPrevMonth={dashboardData.completedOrdersPrevMonth || []}
          totalRevenueThisMonth={dashboardData.totalRevenueThisMonth || 0}
          totalRevenuePrevMonth={dashboardData.totalRevenuePrevMonth || 0}
          revenueChangePercent={dashboardData.revenueChangePercent || 0}
        />

        {/* Inventory Management */}
        <InventoryManagement
          totalVehiclesInWarehouse={dashboardData.totalVehiclesInWarehouse || 0}
          vehiclesInTransit={dashboardData.vehiclesInTransit || 0}
          vehiclesShippedToday={dashboardData.vehiclesShippedToday || 0}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Processed Chart */}
          <OrdersProcessedChart orders={dashboardData.processedOrders || []} />
          
          {/* Performance Chart */}
          <PerformanceChart orders={dashboardData.processedOrders || []} />
        </div>

        {/* Top Dealers Supported Chart */}
        <TopDealersSupportedChart topDealers={dashboardData.topDealers || []} />
      </div>
    </div>
  );
};

export default EvmStaffDashboardPage;

