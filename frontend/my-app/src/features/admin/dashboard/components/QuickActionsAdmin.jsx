import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiArchive,
  FiTruck,
  FiFileText,
} from "react-icons/fi";

/**
 * Quick Actions Component cho ADMIN
 * Các nút hành động nhanh để chuyển đến các trang quan trọng
 */
const QuickActionsAdmin = () => {
  const navigate = useNavigate();

  const actions = [
    // Nhóm: Quản lý hệ thống
    {
      icon: FiUsers,
      label: "Quản Lý Đại Lý",
      path: "/evm/admin/dealers/list",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      description: "Quản lý danh sách đại lý",
    },
    {
      icon: FiUsers,
      label: "Quản Lý Người Dùng",
      path: "/evm/admin/system/users",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      description: "Quản lý người dùng hệ thống",
    },
    
    // Nhóm: Sản phẩm & Kho
    {
      icon: FiPackage,
      label: "Danh Mục Xe",
      path: "/evm/admin/products/catalog",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      description: "Quản lý danh mục xe",
    },
    {
      icon: FiArchive,
      label: "Kho Trung Tâm",
      path: "/evm/admin/distribution/inventory/central",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      description: "Quản lý kho trung tâm",
    },
    {
      icon: FiTruck,
      label: "Điều Phối Xe",
      path: "/evm/admin/distribution/allocation",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      description: "Điều phối xe cho đại lý",
    },
    
    // Nhóm: Báo cáo & Cài đặt
    {
      icon: FiBarChart2,
      label: "Báo Cáo Doanh Số",
      path: "/evm/admin/reports/sales",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      description: "Xem báo cáo doanh số",
    },
    {
      icon: FiFileText,
      label: "Báo Cáo Kho",
      path: "/evm/admin/reports/inventory",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      description: "Xem báo cáo kho",
    },
    {
      icon: FiSettings,
      label: "Phương Thức Thanh Toán",
      path: "/evm/admin/payments/methods",
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-50",
      description: "Quản lý phương thức thanh toán",
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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

export default QuickActionsAdmin;

