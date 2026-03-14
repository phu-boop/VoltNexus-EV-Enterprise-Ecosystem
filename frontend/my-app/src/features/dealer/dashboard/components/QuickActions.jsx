import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiShoppingCart,
  FiUserPlus,
  FiUsers,
  FiArchive,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiList,
  FiNavigation,
  FiClipboard,
  FiTruck,
  FiCalendar,
  FiTrendingDown,
  FiCreditCard,
} from "react-icons/fi";

/**
 * Quick Actions Component
 * Các nút hành động nhanh để chuyển đến các trang quan trọng
 */
const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    // Nhóm: Báo giá & Đơn hàng
    {
      icon: FiFileText,
      label: "Tạo Báo Giá",
      path: "/dealer/manager/quotes/create",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      description: "Tạo báo giá mới cho khách hàng",
    },
    {
      icon: FiList,
      label: "Quản Lý Báo Giá",
      path: "/dealer/manager/quotations",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      description: "Xem và quản lý tất cả báo giá",
    },
    {
      icon: FiClipboard,
      label: "Đơn Hàng Mới",
      path: "/dealer/manager/list/quotations",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      description: "Xem đơn hàng mới cần xử lý",
    },
    {
      icon: FiShoppingCart,
      label: "Danh Sách Đơn Hàng",
      path: "/dealer/orders",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      description: "Xem tất cả đơn hàng",
    },
    {
      icon: FiFileText,
      label: "Hợp Đồng Mua Bán",
      path: "/dealer/contracts",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      description: "Quản lý hợp đồng mua bán",
    },
    {
      icon: FiTruck,
      label: "Theo Dõi Giao Xe",
      path: "/dealer/delivery",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      description: "Theo dõi tình trạng giao xe",
    },
    
    // Nhóm: Khách hàng
    {
      icon: FiUserPlus,
      label: "Thêm Khách Hàng",
      path: "/dealer/manager/customers/create",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      description: "Thêm khách hàng mới",
    },
    {
      icon: FiUsers,
      label: "Hồ Sơ Khách Hàng",
      path: "/dealer/manager/customers/list",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      description: "Quản lý hồ sơ khách hàng",
    },
    {
      icon: FiCalendar,
      label: "Lịch Hẹn Lái Thử",
      path: "/dealer/manager/testdrives",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
      description: "Quản lý lịch hẹn lái thử",
    },
    
    // Nhóm: Kho & Sản phẩm
    {
      icon: FiArchive,
      label: "Xe Trong Kho",
      path: "/dealer/manager/inventory/stock",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      description: "Xem xe có sẵn trong kho",
    },
    {
      icon: FiNavigation,
      label: "Đặt Xe Từ Hãng",
      path: "/dealer/manager/inventory/order",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      description: "Đặt hàng xe từ hãng",
    },
    
    // Nhóm: Thanh toán & Tài chính
    {
      icon: FiDollarSign,
      label: "Hóa Đơn",
      path: "/dealer/manager/payments/invoices",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      description: "Xem hóa đơn thanh toán",
    },
    {
      icon: FiCreditCard,
      label: "Thanh Toán B2C",
      path: "/dealer/manager/payments/b2c-cash-payments",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-50",
      description: "Yêu cầu thanh toán tiền mặt B2C",
    },
    {
      icon: FiTrendingDown,
      label: "Công Nợ B2C",
      path: "/dealer/manager/payments/b2c-debt",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      description: "Xem công nợ B2C",
    },
    
    // Nhóm: Báo cáo & Quản lý
    {
      icon: FiPieChart,
      label: "Báo Cáo",
      path: "/dealer/manager/reports",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      description: "Xem báo cáo doanh số",
    },
    {
      icon: FiSettings,
      label: "Quản Lý Nhân Viên",
      path: "/dealer/manager/settings/staff",
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-50",
      description: "Quản lý nhân viên đại lý",
    },
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hành Động Nhanh</h2>
        <p className="text-gray-600">Truy cập nhanh các chức năng quan trọng</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.path)}
              className="group relative bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
              {/* Icon với gradient background */}
              <div className={`mb-4 w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Label */}
              <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {action.label}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {action.description}
              </p>
              
              {/* Hover effect - arrow */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;

