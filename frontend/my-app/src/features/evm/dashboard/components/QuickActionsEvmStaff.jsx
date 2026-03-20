import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiArchive,
  FiNavigation,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiPackage,
  FiTag,
  FiBell,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";

/**
 * Quick Actions Component for EVM Staff
 * Các nút hành động nhanh để chuyển đến các trang quan trọng
 */
const QuickActionsEvmStaff = () => {
  const navigate = useNavigate();

  const actions = [
    // Nhóm: Đơn hàng & Thanh toán
    {
      icon: FiShoppingCart,
      label: "Quản Lý Đơn Hàng B2B",
      path: "/evm/staff/orders",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      description: "Xử lý và duyệt đơn hàng B2B",
    },
    {
      icon: FiDollarSign,
      label: "Công Nợ Đại Lý",
      path: "/evm/staff/debt",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      description: "Theo dõi công nợ đại lý",
    },
    {
      icon: FiCreditCard,
      label: "Thanh Toán Tiền Mặt",
      path: "/evm/staff/payments/cash-payments",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      description: "Xử lý thanh toán tiền mặt",
    },
    {
      icon: FiFileText,
      label: "Hóa Đơn Đại Lý",
      path: "/evm/staff/payments/dealer-invoices",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      description: "Quản lý hóa đơn đại lý",
    },

    // Nhóm: Kho & Phân phối
    {
      icon: FiArchive,
      label: "Kho Trung Tâm",
      path: "/evm/staff/distribution/inventory/central",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      description: "Quản lý tồn kho trung tâm",
    },
    {
      icon: FiNavigation,
      label: "Điều Phối Xe",
      path: "/evm/staff/distribution/allocation",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      description: "Điều phối xe đến đại lý",
    },
    {
      icon: FiTruck,
      label: "Vận Chuyển",
      path: "/evm/staff/distribution/allocation",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      description: "Theo dõi vận chuyển",
    },

    // Nhóm: Quản lý đại lý
    {
      icon: FiUsers,
      label: "Danh Sách Đại Lý",
      path: "/evm/staff/dealers/list",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      description: "Xem danh sách đại lý",
    },
    {
      icon: FiUsers,
      label: "Tài Khoản Đại Lý",
      path: "/evm/staff/dealers/dealer-accounts",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      description: "Quản lý tài khoản đại lý",
    },

    // Nhóm: Sản phẩm
    {
      icon: FiPackage,
      label: "Danh Mục Xe",
      path: "/evm/staff/products/catalog",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      description: "Quản lý danh mục xe",
    },
    {
      icon: FiTag,
      label: "Phiên Bản & Màu Sắc",
      path: "/evm/staff/products/variants",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      description: "Quản lý phiên bản xe",
    },

    // Nhóm: Khác
    {
      icon: FiBell,
      label: "Thông Báo",
      path: "/evm/notifications",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      description: "Xem thông báo hệ thống",
    },
    {
      icon: FiTrendingUp,
      label: "Báo Cáo Doanh Số",
      path: "/evm/staff/reports/sales",
      color: "from-slate-500 to-gray-500",
      bgColor: "bg-slate-50",
      description: "Xem báo cáo doanh số",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hành Động Nhanh</h2>
        <p className="text-gray-600">Truy cập nhanh các chức năng quan trọng</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`${action.bgColor} rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon với gradient */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="w-7 h-7" />
              </div>

              {/* Label */}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700">
                  {action.label}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsEvmStaff;

