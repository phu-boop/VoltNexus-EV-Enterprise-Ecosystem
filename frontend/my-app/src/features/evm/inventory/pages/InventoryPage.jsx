import React, { useState } from "react";
import StockAlerts from "../components/StockAlerts";
import InventoryStatusTab from "../components/InventoryStatusTab";
import TransactionHistoryTab from "../components/TransactionHistoryTab";
import InventoryReportsTab from "../components/InventoryReportsTab";

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState("status");

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

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Quản Lý Kho</h1>

      {/* Phần cảnh báo luôn hiển thị ở trên cùng */}
      <StockAlerts />

      {/* Thanh điều hướng Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg ${
              activeTab === "status"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Trạng Thái Kho
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Lịch Sử Giao Dịch
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg ${
              activeTab === "reports"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Báo Cáo & Cài Đặt
          </button>
        </nav>
      </div>

      {/* Nội dung của Tab được chọn */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default InventoryPage;
