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
    label: "Danh Mục Xe & Báo Giá",
    path: "/dealer/manager/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/manager/inventory/available",
      },
      {
        icon: FiTag,
        label: "Tất cả Phiên bản",
        path: "/dealer/manager/vehicles/all",
      },
      // {
      //   icon: FiSliders,
      //   label: "So Sánh Mẫu Xe",
      //   path: "/dealer/manager/vehicles/compare",
      // },
      {
        icon: FiFileText,
        label: "Tạo Báo Giá",
        path: "/dealer/manager/quotes/create",
      },
      // {
      //   icon: FiCreditCard,
      //   label: "In Báo Giá",
      //   path: "/dealer/manager/quotes/print",
      // },
      {
        icon: FiCreditCard,
        label: "Giá & Khuyến Mãi",
        path: "/dealer/manager/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/dealer/manager/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "Quản Lý Báo Giá",
        path: "/dealer/manager/quotations",
      },
      {
        icon: FiClipboard,
        label: "Đơn Hàng Mới",
        path: "/dealer/manager/list/quotations",
      },
      {
        icon: FiList,
        label: "Danh Sách Đơn Hàng",
        path: "/dealer/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng Mua Bán",
        path: "/dealer/contracts",
      },
      {
        icon: FiTruck,
        label: "Theo Dõi Giao Xe",
        path: "/dealer/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/dealer/manager/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Khách Hàng",
        path: "/dealer/manager/customers/create",
      },
      {
        icon: FiList,
        label: "Hồ Sơ Khách Hàng",
        path: "/dealer/manager/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lịch Hẹn Lái Thử",
        path: "/dealer/manager/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Khiếu Nại & Phản Hồi",
        path: "/dealer/manager/feedback",
      },
    ],
  },

  // Kho đại lý
  {
    icon: FiArchive,
    label: "Kho Đại Lý",
    path: "/dealer/manager/inventory",
    submenu: [
      {
        icon: FiList,
        label: "Xe Trong Kho",
        path: "/dealer/manager/inventory/stock",
      },
      // {
      //   icon: FiClipboard,
      //   label: "Kiểm Kê",
      //   path: "/dealer/manager/inventory/audit",
      // },
      {
        icon: FiNavigation,
        label: "Đặt Xe Từ Hãng",
        path: "/dealer/manager/inventory/order",
      },
      {
        icon: FiNavigation,
        label: "Thông tin đơn hàng",
        path: "/dealer/manager/inventory/info",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/dealer/manager/payments",
    submenu: [
      {
        icon: FiFileText,
        label: "Hóa Đơn Của Tôi (B2B)",
        path: "/dealer/manager/payments/invoices",
      },
      {
        icon: FiDollarSign,
        label: "Yêu Cầu Thanh Toán (B2C)",
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
    label: "Báo Cáo Đại Lý",
    path: "/dealer/manager/reports",
    submenu: [
      {
        icon: FiBarChart2,
        label: "Công nợ khách hàng và hãng xe",
        path: "/dealer/manager/reports/model",
      },
    ],
  },

  // Cài đặt đại lý
  {
    icon: FiSettings,
    label: "Cài Đặt Đại Lý",
    path: "/dealer/manager/settings",
    submenu: [
      {
        icon: FiUsers,
        label: "Quản Lý Nhân Viên",
        path: "/dealer/manager/settings/staff",
      },
      {
        icon: FiSliders,
        label: "Cấu Hình Nội Bộ",
        path: "/dealer/manager/settings/config",
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
    label: "Danh Mục Xe & Báo Giá",
    path: "/dealer/staff/vehicles",
    submenu: [
      {
        icon: FiList,
        label: "Xe Có Sẵn",
        path: "/dealer/staff/inventory/available",
      },
      {
        icon: FiTag,
        label: "Tất cả Phiên bản",
        path: "/dealer/staff/vehicles/all",
      },
      {
        icon: FiFileText,
        label: "Tạo Báo Giá",
        path: "/dealer/staff/quotes/create",
      },
      {
        icon: FiFileText,
        label: "Xem khuyến mãi",
        path: "/dealer/staff/promotions",
      },
    ],
  },

  // Quy trình bán hàng
  {
    icon: FiShoppingCart,
    label: "Quy Trình Bán Hàng",
    path: "/dealer/staff/sales",
    submenu: [
      {
        icon: FiFileText,
        label: "Quản Lý Báo Giá",
        path: "/dealer/staff/quotations",
      },
      {
        icon: FiClipboard,
        label: "Đanh sách báo giá",
        path: "/dealer/staff/list/quotations",
      },
      {
        icon: FiList,
        label: "Danh Sách Đơn Hàng",
        path: "/dealer/orders",
      },
      {
        icon: FiFileText,
        label: "Hợp Đồng Mua Bán",
        path: "/dealer/contracts",
      },
      {
        icon: FiTruck,
        label: "Theo Dõi Giao Xe",
        path: "/dealer/delivery",
      },
    ],
  },

  // Quản lý khách hàng
  {
    icon: FiUsers,
    label: "Quản Lý Khách Hàng",
    path: "/dealer/staff/customers",
    submenu: [
      {
        icon: FiUserPlus,
        label: "Thêm Khách Hàng",
        path: "/dealer/staff/customers/create",
      },
      {
        icon: FiList,
        label: "Hồ Sơ Khách Hàng",
        path: "/dealer/staff/customers/list",
      },
      {
        icon: FiCalendar,
        label: "Lịch Hẹn Lái Thử",
        path: "/dealer/staff/testdrives",
      },
      {
        icon: FiMessageCircle,
        label: "Khiếu Nại & Phản Hồi",
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
        label: "Đặt Xe Từ Hãng",
        path: "/dealer/staff/inventory/order",
      },
    ],
  },

  // Quản lý thanh toán
  {
    icon: FiDollarSign,
    label: "Quản Lý Thanh Toán",
    path: "/dealer/staff/payments",
    submenu: [
      {
        icon: FiShoppingCart,
        label: "Danh Sách Đơn Hàng (B2C)",
        path: "/dealer/staff/payments/b2c-orders",
      },
    ],
  },

  // Tài chính & báo cáo
  {
    icon: FiCreditCard,
    label: "Tài Chính & Báo Cáo",
    path: "/dealer/staff/finance",
    submenu: [
      {
        icon: FiBarChart2,
        label: "Doanh Số Cá Nhân",
        path: "/dealer/staff/reports/personal",
      },
    ],
  },
];
