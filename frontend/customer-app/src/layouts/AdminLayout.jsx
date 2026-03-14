import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Users,
  Calendar,
  CreditCard,
  Tag,
  Star,
  BarChart3,
  Menu,
  X,
  LogOut,
  FolderTree,
  DollarSign,
  Settings
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, name, roles, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin using hasRole from useAuth
  const isAdmin = hasRole(['ADMIN', 'EVM_STAFF', 'DEALER_MANAGER']);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Car, label: 'Quản lý xe', path: '/admin/vehicles' },
    { icon: FolderTree, label: 'Danh mục', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: DollarSign, label: 'Booking Deposits', path: '/admin/booking-deposits' },
    { icon: Users, label: 'Khách hàng', path: '/admin/customers' },
    { icon: Calendar, label: 'Lịch lái thử', path: '/admin/test-drives' },
    { icon: CreditCard, label: 'Thanh toán', path: '/admin/payments' },
    { icon: Tag, label: 'Khuyến mãi', path: '/admin/promotions' },
    { icon: Star, label: 'Đánh giá', path: '/admin/reviews' },
    { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-blue-600">
              VinPhust Admin
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, <span className="font-medium">{name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
