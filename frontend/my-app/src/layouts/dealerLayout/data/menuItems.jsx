import {
  FiHome,
  FiPackage,
  FiTag,
  FiList,
  FiFileText,
  FiShoppingCart,
  FiClipboard,
  FiTruck,
  FiUsers,
  FiCalendar,
  FiMessageCircle,
  FiArchive,
  FiNavigation,
  FiCreditCard,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiSettings,
  FiUserPlus,
  FiSliders,
  FiGift,
  FiChevronDown,
  FiLogOut,
  FiX,
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiHelpCircle,
  FiChevronRight,
  FiUser,
  FiShield,
  FiDollarSign,
} from "react-icons/fi";

export const dealerManagerMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/dealer/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe",
    path: "/dealer/manager/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/manager/inventory/available",
      },
      {
        icon: FiTag,
        label: "Phiên Bản",
        path: "/dealer/manager/vehicles/all",
      },
      {
        icon: FiCreditCard,
        label: "Khuyến Mãi",
        path: "/dealer/manager/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Bán Hàng",
    path: "/dealer/manager/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "DS Báo Giá",
        path: "/dealer/manager/quotations",
      },
      {
        icon: FiClipboard,
        label: "Đơn Mới",
        path: "/dealer/manager/list/quotations",
      },
      {
        icon: FiList,
        label: "Đơn Khách (B2C)",
        path: "/dealer/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng",
        path: "/dealer/contracts",
      },
      {
        icon: FiTruck,
        label: "Giao Xe",
        path: "/dealer/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Khách Hàng",
    path: "/dealer/manager/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Mới",
        path: "/dealer/manager/customers/create",
      },
      {
        icon: FiList,
        label: "Danh Sách",
        path: "/dealer/manager/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lái Thử",
        path: "/dealer/manager/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Phản Hồi",
        path: "/dealer/manager/feedback",
      },
    ],
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho & Nhập Xe",
    path: "/dealer/manager/inventory",
    submenu: [
      {
        icon: FiList,
        label: "Xe Trong Kho",
        path: "/dealer/manager/inventory/stock",
      },
      {
        icon: FiNavigation,
        label: "Đặt Xe (B2B)",
        path: "/dealer/manager/inventory/order",
      },
      {
        icon: FiFileText,
        label: "Thông Tin Đơn",
        path: "/dealer/manager/inventory/info",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Thanh Toán",
    path: "/dealer/manager/payments",
    submenu: [
      {
        icon: FiFileText,
        label: "Hóa Đơn (B2B)",
        path: "/dealer/manager/payments/invoices",
      },
      {
        icon: FiDollarSign,
        label: "Thanh Toán (B2C)",
        path: "/dealer/manager/payments/b2c-cash-payments",
      },
      {
        icon: FiTrendingDown,
        label: "Công Nợ B2C",
        path: "/dealer/manager/payments/b2c-debt",
      },
    ],
  },

  // Báo cáo đại lý
  {
    icon: FiPieChart,
    label: "Báo Cáo",
    path: "/dealer/manager/reports",
    submenu: [
      {
        icon: FiBarChart2,
        label: "Tài Chính",
        path: "/dealer/manager/reports/model",
      },
    ],
  },

  // Cài đặt đại lý
  {
    icon: FiSettings,
    label: "Hệ Thống",
    path: "/dealer/manager/settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Nhân Viên",
        path: "/dealer/manager/settings/staff",
      },
      {
        icon: FiSliders,
        label: "Cấu Hình",
        path: "/dealer/manager/settings/config",
      },
    ],
  },

  // Cá Nhân (Dealer Manager)
  {
    icon: FiUserPlus,
    label: "Cá Nhân",
    path: "/dealer/profile-settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Hồ Sơ",
        path: "/dealer/profile",
      },
      {
        icon: FiSettings,
        label: "Cài Đặt",
        path: "/dealer/settings",
      },
    ],
  },
];

export const dealerStaffMenuItems = [
  // Dashboard
  { icon: FiHome, label: "Bảng Điều Khiển", path: "/dealer/staff/dashboard" },

  // Danh mục xe & báo giá
  {
    icon: FiPackage,
    label: "Danh Mục Xe",
    path: "/dealer/staff/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/staff/inventory/available",
      },
      {
        icon: FiTag,
        label: "Phiên Bản",
        path: "/dealer/staff/vehicles/all",
      },
      {
        icon: FiFileText,
        label: "Khuyến Mãi",
        path: "/dealer/staff/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Bán Hàng",
    path: "/dealer/staff/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "Tạo Báo Giá",
        path: "/dealer/staff/quotations",
      },
      {
        icon: FiClipboard,
        label: "DS Báo Giá",
        path: "/dealer/staff/list/quotations",
      },
      {
        icon: FiList,
        label: "Đơn Khách (B2C)",
        path: "/dealer/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng",
        path: "/dealer/contracts",
      },
      {
        icon: FiTruck,
        label: "Giao Xe",
        path: "/dealer/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Khách Hàng",
    path: "/dealer/staff/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Mới",
        path: "/dealer/staff/customers/create",
      },
      {
        icon: FiList,
        label: "Danh Sách",
        path: "/dealer/staff/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lái Thử",
        path: "/dealer/staff/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Phản Hồi",
        path: "/dealer/staff/feedback",
      },
    ],
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/dealer/staff/inventory",
    submenu: [
      {
        icon: FiList,
        label: "Xe Trong Kho",
        path: "/dealer/staff/inventory/stock",
      },
      {
        icon: FiNavigation,
        label: "Đặt Xe (B2B)",
        path: "/dealer/staff/inventory/order",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Thanh Toán",
    path: "/dealer/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Đơn Hàng (B2C)",
        path: "/dealer/staff/payments/b2c-orders",
      },
    ],
  },

  // Tài chính & báo cáo
  {
    icon: FiCreditCard,
    label: "Báo Cáo",
    path: "/dealer/staff/finance",
    submenu: [
      {
        icon: FiBarChart2,
        label: "Doanh Số",
        path: "/dealer/staff/reports/personal",
      },
    ],
  },

  // Cá Nhân (Dealer Staff)
  {
    icon: FiUserPlus,
    label: "Cá Nhân",
    path: "/dealer/profile-settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Hồ Sơ",
        path: "/dealer/profile",
      },
      {
        icon: FiSettings,
        label: "Cài Đặt",
        path: "/dealer/settings",
      },
    ],
  },
];
