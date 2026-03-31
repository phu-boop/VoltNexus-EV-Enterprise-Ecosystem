import React, { useState, useEffect, useMemo } from "react";
import {
  FiPackage,
  FiAlertCircle,
  FiTruck,
  FiActivity,
  FiArrowRight,
  FiSearch,
  FiBox,
  FiClock,
  FiBarChart2
} from "react-icons/fi";
import StockAlerts from "../components/StockAlerts";
import InventoryStatusTab from "../components/InventoryStatusTab";
import TransactionHistoryTab from "../components/TransactionHistoryTab";
import InventoryReportsTab from "../components/InventoryReportsTab";
import { getAllInventory, getActiveAlerts, getInventoryStats } from "../services/inventoryService";
import { useNavigate, useLocation } from "react-router-dom";

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState("status");
  const [stats, setStats] = useState({
    totalUnits: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingAllocations: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const res = await getInventoryStats();
        const data = res.data.data;

        setStats({
          totalUnits: data.totalUnits || 0,
          lowStock: data.lowStockVariants || 0,
          outOfStock: data.outOfStockVariants || 0,
          pendingAllocations: data.pendingAllocations || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "history":
        return <TransactionHistoryTab />;
      case "reports":
        return <InventoryReportsTab />;
      case "status":
      default:
        return <InventoryStatusTab />;
    }
  };

  const statCards = [
    {
      label: "Tổng Tồn Kho",
      value: stats.totalUnits,
      icon: FiBox,
      color: "blue",
      desc: "Tổng tất cả phiên bản"
    },
    {
      label: "Tồn Kho Thấp",
      value: stats.lowStock,
      icon: FiAlertCircle,
      color: "amber",
      desc: "Cần chú ý nhập kho"
    },
    {
      label: "Hết Hàng",
      value: stats.outOfStock,
      icon: FiActivity,
      color: "red",
      desc: "Dừng kinh doanh tạm thời"
    },
    {
      label: "Đang Điều Phối",
      value: stats.pendingAllocations,
      icon: FiTruck,
      color: "indigo",
      desc: "Chờ vận chuyển tới đại lý"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in-0 duration-500 m-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div ClassName="flex felx-col">
            <span className="flex items-center gap-2">
              <img src="/icon/checklist.png" alt="Inventory" className="w-10 h-10" />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản Lý Kho Trung Tâm</h1>
            </span>
          </div>
          <p className="text-slate-500 mt-1">Giám sát tồn kho, điều phối và báo cáo tồn kho thông minh.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/products/catalog`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <FiPackage className="text-blue-500" />
            Xem Danh Mục Xe
            <FiArrowRight className="text-slate-400" />
          </button>
          <button
            onClick={() => navigate(`${basePath}/distribution/allocation`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <FiTruck className="text-indigo-400" />
            Điều Phối Kho
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoadingStats ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" /> : stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400">
              <span>{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <StockAlerts />

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Thanh điều hướng Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/30 px-4">
          <nav className="flex space-x-1">
            {[
              { id: "status", label: "Trạng Thái Kho", icon: FiBarChart2 },
              { id: "history", label: "Lịch Sử Giao Dịch", icon: FiClock },
              { id: "reports", label: "Báo Cáo & Cài Đặt", icon: FiActivity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Nội dung của Tab */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
