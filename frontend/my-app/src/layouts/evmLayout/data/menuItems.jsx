import {
  FiHome,
  FiUsers,
  FiSettings,
  FiPackage,
  FiList,
  FiCreditCard,
  FiTag,
  FiTruck,
  FiArchive,
  FiNavigation,
  FiBriefcase,
  FiFileText,
  FiUserPlus,
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  FiCpu,
  FiMap,
  FiShield,
  FiDatabase,
  FiActivity,
  FiHome as FiHomeAlt,
  FiCreditCard as FiCreditCardAlt,
  FiShoppingCart,
  FiClipboard,
  FiCalendar,
  FiMessageCircle,
  FiSliders,
  FiGift,
  FiRefreshCw,
  FiBell,
  FiDollarSign,
} from "react-icons/fi";

export const adminMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/evm/admin/dashboard" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Sản Phẩm",
    path: "/evm/admin/products",
    submenu: [
      {
        icon: FiList,
        label: "Danh Mục",
        path: "/evm/admin/products/catalog",
      },
      {
        icon: FiTag,
        label: "Phiên Bản",
        path: "/evm/admin/products/variants",
      },
      {
        icon: FiSliders,
        label: "Tính Năng",
        path: "/evm/admin/products/features",
      },
      {
        icon: FiCreditCard,
        label: "Khuyến Mãi",
        path: "/evm/admin/products/promotions",
      },
    ],
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối",
    path: "/evm/admin/distribution",
    submenu: [
      {
        icon: FiArchive,
        label: "Kho Trung Tâm",
        path: "/evm/admin/distribution/inventory/central",
      },
      {
        icon: FiNavigation,
        label: "Điều Phối Xe",
        path: "/evm/admin/distribution/allocation",
      },
      {
        icon: FiTruck,
        label: "Lịch Sử Lệnh",
        path: "/evm/admin/distribution/history",
      },
    ],
  },

  {
    icon: FiDollarSign,
    label: "Đơn Hàng",
    path: "/evm/admin/sales-finance",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Đơn Đặt Mua",
        path: "/evm/admin/orders",
      },
      {
        icon: FiFileText,
        label: "Hóa Đơn",
        path: "/evm/admin/payments/invoices",
      },
      {
        icon: FiCreditCard,
        label: "Công Nợ",
        path: "/evm/admin/debt",
      },
      {
        icon: FiDollarSign,
        label: "Lịch SửGD",
        path: "/evm/admin/payments/cash-history",
      },
    ],
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Đại Lý",
    path: "/evm/admin/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "Danh Sách",
        path: "/evm/admin/dealers/list",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng",
        path: "/evm/admin/dealers/contracts",
      },
      {
        icon: FiCreditCardAlt,
        label: "Thanh Toán",
        path: "/evm/admin/dealers/debts",
      },
      {
        icon: FiUserPlus,
        label: "Tài Khoản",
        path: "/evm/admin/dealers/accounts",
      },
      {
        icon: FiBell,
        label: "Thông Báo",
        path: "/evm/notifications",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo",
    path: "/evm/admin/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Thông Báo",
        path: "/evm/admin/reports/notifications",
      },
      {
        icon: FiTrendingUp,
        label: "Doanh Số",
        path: "/evm/admin/reports/sales",
      },
      {
        icon: FiPieChart,
        label: "Tồn Kho",
        path: "/evm/admin/reports/inventory",
      },
      {
        icon: FiCpu,
        label: "Dự Báo AI",
        path: "/evm/admin/reports/forecast",
      },
    ],
  },

  // Quản trị hệ thống (chỉ dành cho evm/Admin)
  {
    icon: FiSettings,
    label: "Hệ Thống",
    path: "/evm/admin/system",
    submenu: [
      {
        icon: FiUsers,
        label: "Người Dùng",
        path: "/evm/admin/system/users",
      },
      {
        icon: FiShield,
        label: "Phân Quyền",
        path: "/evm/admin/system/permissions",
      },
      {
        icon: FiDatabase,
        label: "Cấu Hình",
        path: "/evm/admin/system/config",
      },
      {
        icon: FiRefreshCw,
        label: "Đồng Bộ",
        path: "/evm/admin/system/data-backfill",
      },
      {
        icon: FiActivity,
        label: "Nhật Ký",
        path: "/evm/admin/system/audit",
      },
      {
        icon: FiDollarSign,
        label: "Cổng T.Toán",
        path: "/evm/admin/payments/methods",
      },
    ],
  },

  // Cá Nhân (Admin)
  {
    icon: FiUserPlus,
    label: "Cá Nhân",
    path: "/evm/profile-settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Hồ Sơ",
        path: "/evm/profile",
      },
      {
        icon: FiSettings,
        label: "Cài Đặt",
        path: "/evm/settings",
      },
    ],
  },
];

export const evmStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Dashboard", path: "/evm/staff/dashboard" },

  // Quản lý sản phẩm
  {
    icon: FiPackage,
    label: "Sản Phẩm",
    path: "/evm/staff/products",
    submenu: [
      {
        icon: FiList,
        label: "Danh Mục",
        path: "/evm/staff/products/catalog",
      },
      {
        icon: FiTag,
        label: "Phiên Bản",
        path: "/evm/staff/products/variants",
      },
      {
        icon: FiCreditCard,
        label: "Khuyến Mãi",
        path: "/evm/staff/products/promotions",
      },
    ],
  },

  // Quản lý phân phối & kho
  {
    icon: FiTruck,
    label: "Phân Phối",
    path: "/evm/staff/distribution",
    submenu: [
      {
        icon: FiArchive,
        label: "Kho Trung Tâm",
        path: "/evm/staff/distribution/inventory/central",
      },
      {
        icon: FiNavigation,
        label: "Điều Phối Xe",
        path: "/evm/staff/distribution/allocation",
      },
    ],
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Đại Lý",
    path: "/evm/staff/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "Tài Khoản",
        path: "/evm/staff/dealers/dealer-accounts",
      },
      {
        icon: FiHomeAlt,
        label: "Danh Sách",
        path: "/evm/staff/dealers/list",
      },
      {
        icon: FiFileText,
        label: "Hóa Đơn",
        path: "/evm/staff/payments/dealer-invoices",
      },
      {
        icon: FiBell,
        label: "Thông Báo",
        path: "/evm/notifications",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Đơn Hàng",
    path: "/evm/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Đơn Đặt Mua",
        path: "/evm/staff/orders",
      },
      {
        icon: FiCreditCard,
        label: "Công Nợ",
        path: "/evm/staff/debt",
      },
      {
        icon: FiDollarSign,
        label: "Lịch Sử GD",
        path: "/evm/staff/payments/cash-payments",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo",
    path: "/evm/staff/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Doanh Số",
        path: "/evm/staff/reports/sales",
      },
      {
        icon: FiPieChart,
        label: "Tồn Kho",
        path: "/evm/staff/reports/inventory",
      },
      {
        icon: FiCpu,
        label: "Dự Báo AI",
        path: "/evm/staff/reports/forecast",
      },
    ],
  },

  // Cá Nhân (Staff)
  {
    icon: FiUserPlus,
    label: "Cá Nhân",
    path: "/evm/profile-settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Hồ Sơ",
        path: "/evm/profile",
      },
      {
        icon: FiSettings,
        label: "Cài Đặt",
        path: "/evm/settings",
      },
    ],
  },
];
