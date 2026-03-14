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
    label: "Quản Lý Sản Phẩm",
    path: "/evm/admin/products",
    submenu: [
      {
        icon: FiList,
        label: "Danh Mục Xe",
        path: "/evm/admin/products/catalog",
      },
      // {
      //   icon: FiCreditCard,
      //   label: "Giá & Khuyến Mãi",
      //   path: "/evm/admin/products/pricing",
      // },
      {
        icon: FiTag,
        label: "Phiên Bản & Màu Sắc",
        path: "/evm/admin/products/variants",
      },
      {
        icon: FiSliders,
        label: "Quản Lý Tính Năng",
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
    label: "Phân Phối & Kho",
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
        label: "Lịch Sử Phân Phối",
        path: "/evm/admin/distribution/history",
      },
    ],
  },

  {
    icon: FiDollarSign,
    label: "Đơn Hàng & Thanh Toán",
    path: "/evm/admin/sales-finance",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Đơn Hàng Đại Lý (B2B)",
        path: "/evm/admin/orders",
      },
      {
        icon: FiFileText,
        label: "Quản Lý Hóa Đơn",
        path: "/evm/admin/payments/invoices",
      },
      {
        icon: FiCreditCard,
        label: "Công Nợ Đại Lý",
        path: "/evm/admin/debt",
      },
      {
        icon: FiDollarSign,
        label: "Lịch Sử Thanh Toán",
        path: "/evm/admin/payments/cash-history",
      },
    ],
  },

  // Quản lý đại lý
  {
    icon: FiBriefcase,
    label: "Quản Lý Đại Lý",
    path: "/evm/admin/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "Danh Sách Đại Lý",
        path: "/evm/admin/dealers/list",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng & Chỉ Tiêu",
        path: "/evm/admin/dealers/contracts",
      },
      {
        icon: FiCreditCardAlt,
        label: "Công Nợ & Thanh Toán",
        path: "/evm/admin/dealers/debts",
      },
      {
        icon: FiUserPlus,
        label: "Tài Khoản Đại Lý",
        path: "/evm/admin/dealers/accounts",
      },
      {
        icon: FiBell,
        label: "Thông báo từ đại lí",
        path: "/evm/notifications",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/evm/admin/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Thông báo FireBase",
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
    label: "Quản Trị Hệ Thống",
    path: "/evm/admin/system",
    submenu: [
      {
        icon: FiUsers,
        label: "Quản Lý Người Dùng",
        path: "/evm/admin/system/users",
      },
      {
        icon: FiShield,
        label: "Phân Quyền Truy Cập",
        path: "/evm/admin/system/permissions",
      },
      {
        icon: FiDatabase,
        label: "Cấu Hình Hệ Thống",
        path: "/evm/admin/system/config",
      },
      {
        icon: FiRefreshCw,
        label: "Đồng bộ Dữ liệu (Backfill)",
        path: "/evm/admin/system/data-backfill",
      },
      {
        icon: FiActivity,
        label: "Nhật Ký Hoạt Động",
        path: "/evm/admin/system/audit",
      },
      {
        icon: FiDollarSign,
        label: "Quản Lý Phương Thức Thanh Toán",
        path: "/evm/admin/payments/methods",
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
    label: "Quản Lý Sản Phẩm",
    path: "/evm/staff/products",
    submenu: [
      {
        icon: FiList,
        label: "Danh Mục Xe",
        path: "/evm/staff/products/catalog",
      },
      {
        icon: FiTag,
        label: "Phiên Bản & Màu Sắc",
        path: "/evm/staff/products/variants",
      },
      // {
      //   icon: FiCreditCard,
      //   label: "Giá Sỉ & Chiết Khấu",
      //   path: "/evm/staff/products/pricing",
      // },
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
    label: "Phân Phối & Kho",
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
    label: "Quản Lý Đại Lý",
    path: "/evm/staff/dealers",
    submenu: [
      {
        icon: FiHomeAlt,
        label: "Tài Khoản Đại Lý",
        path: "/evm/staff/dealers/dealer-accounts",
      },
      {
        icon: FiHomeAlt,
        label: "Danh Sách Đại Lý",
        path: "/evm/staff/dealers/list",
      },
      // {
      //   icon: FiFileText,
      //   label: "Hợp Đồng & Chỉ Tiêu",
      //   path: "/evm/staff/dealers/contracts",
      // },
      // {
      //   icon: FiCreditCardAlt,
      //   label: "Công Nợ & Thanh Toán",
      //   path: "/evm/staff/dealers/debts",
      // },
      {
        icon: FiFileText,
        label: "Hóa Đơn Đại Lý",
        path: "/evm/staff/payments/dealer-invoices",
      },
      {
        icon: FiBell,
        label: "Thông báo từ đại lí",
        path: "/evm/notifications",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/evm/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Quản Lý Đơn Hàng (B2B)",
        path: "/evm/staff/orders",
      },
      {
        icon: FiCreditCard,
        label: "Công Nợ Đại Lý (B2B)",
        path: "/evm/staff/debt",
      },
      {
        icon: FiDollarSign,
        label: "Đại Lý Thanh Toán Hóa Đơn (B2B)",
        path: "/evm/staff/payments/cash-payments",
      },
    ],
  },

  // Báo cáo & phân tích
  {
    icon: FiBarChart2,
    label: "Báo Cáo & Phân Tích",
    path: "/evm/staff/reports",
    submenu: [
      {
        icon: FiTrendingUp,
        label: "Doanh Số Theo Đại Lý",
        path: "/evm/staff/reports/sales",
      },
      {
        icon: FiPieChart,
        label: "Tồn Kho & Tốc Độ Tiêu Thụ",
        path: "/evm/staff/reports/inventory",
      },
      {
        icon: FiCpu,
        label: "Dự Báo Nhu Cầu (AI)",
        path: "/evm/staff/reports/forecast",
      },
    ],
  },
];
