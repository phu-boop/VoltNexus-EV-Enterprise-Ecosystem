import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  LogOut,
  Car,
  GitCompare,
  Zap,
  Shield,
  MoreHorizontal,
  MessageSquare,
  Calculator,
  Wrench,
  Calendar,
} from "lucide-react";

import { useComparison } from "../utils/useComparison";

export default function Header() {
  const { isAuthenticated, logout, name, hasRole, memberId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { count: compareCount } = useComparison();

useEffect(() => {
    setHoveredPath(location.pathname);
  }, [location.pathname]);

  const isAdmin = hasRole(['ADMIN', 'EVM_STAFF', 'DEALER_MANAGER']);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Danh sách các tabs điều hướng chính
  const navTabs = [
    { path: "/", label: "Trang chủ" },
    { path: "/vehicles", label: "Xe điện" },
    { path: "/test-drive", label: "Đặt lái thử" },
    { path: "/charging-stations", label: "Trạm sạc" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">VinPhust</span>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden lg:flex items-center gap-2"
            onMouseLeave={() => setHoveredPath(location.pathname)} // Khi chuột rời menu, quay về tab active
          >
            {navTabs.map((tab) => {
              const isActiveTab = isActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onMouseEnter={() => setHoveredPath(tab.path)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActiveTab ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {/* Chỉ hiển thị Background nếu tab này đang Active (đúng URL hiện tại) */}
                  {isActiveTab && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 bg-blue-50 rounded-md"
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                      }}
                      style={{ zIndex: -1 }} // Đặt zIndex âm để nằm dưới chữ
                    />
                  )}
                  
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Action Icons */}
            {isAuthenticated() && (
              <>
                {/* Compare Icon */}
                <Link
                  to="/compare"
                  className="relative p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  title="So sánh xe"
                >
                  <GitCompare className="w-5 h-5" />
                  {compareCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                </Link>

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                    title="Quản trị"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {/* User Menu or Login/Register */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{name || "Tài khoản"}</span>
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Tài khoản
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Đơn hàng
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* More Menu (Extended Features) */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isMoreMenuOpen
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMoreMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <Link
                      to="/configure"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      Cấu hình xe
                    </Link>

                    <Link
                      to="/financing"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Tính trả góp
                    </Link>
                    <Link
                      to="/tco-calculator"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Tính chi phí
                    </Link>
                    <Link
                      to="/my-test-drives"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Lịch lái thử
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/vehicles"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/vehicles")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Xe điện
              </Link>
              <Link
                to="/test-drive"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/test-drive")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Đặt lái thử
              </Link>
              <Link
                to="/charging-stations"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/charging-stations")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Trạm sạc
              </Link>

              <div className="border-t border-gray-200 my-2"></div>
              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                Thêm tính năng
              </div>

              <Link
                to="/compare"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                So sánh xe
                {compareCount > 0 && (
                  <span className="ml-auto bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link
                to="/configure"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                Cấu hình xe
              </Link>

              <Link
                to="/financing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Tính trả góp
              </Link>
              <Link
                to="/tco-calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Tính chi phí
              </Link>
              <Link
                to="/my-test-drives"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Lịch lái thử
              </Link>

              {isAuthenticated() ? (
                <>
                  <div className="border-t border-gray-200 my-2"></div>

                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Đơn hàng
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Tài khoản
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium text-center hover:bg-blue-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium text-center hover:bg-blue-700"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
