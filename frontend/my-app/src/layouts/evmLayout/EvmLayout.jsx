import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../features/auth/AuthProvider.jsx";
import { Sidebar } from "./components/Sidebar/Sidebar.jsx";
import { Header } from "./components/Header/Header.jsx";
import { Footer } from "./components/Footer/Footer.jsx";
import { MainContent } from "./components/MainContent/MainContent.jsx";
import { adminMenuItems, evmStaffMenuItems } from "./data/menuItems.jsx";
import Swal from "sweetalert2";

// Hooks
import { useSidebar } from "./hooks/useSidebar";
import { useNotifications } from "./hooks/useNotifications"; // Hook Firebase
import { useSocketToggle } from "./hooks/useSocketToggle.js"; // Hook Tắt/Bật
import { useNotificationSocket } from "../../features/evm/notification/hooks/useNotificationSocket"; // Hook Socket B2B

const EvmLayout = () => {
  const { logout, email, name, fullName, roles, avatarUrl } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Custom hooks
  const sidebar = useSidebar();
  const notifications = useNotifications(roles, navigate); // Hook Firebase
  const socketToggle = useSocketToggle();

  // Hook Socket B2B (sẽ chỉ kết nối nếu socketToggle.showSocketBell = true)
  useNotificationSocket(socketToggle.showSocketBell);

  // Local state
  const [menuItems, setMenuItems] = useState([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // User data
  const user = { email, name, fullName, roles };
  const role = roles.includes("ADMIN") ? "ADMIN" : "EVM_STAFF";

  // Set menu items based on role
  useEffect(() => {
    if (!roles || roles.length === 0) return;

    if (roles.includes("ADMIN")) {
      setMenuItems(adminMenuItems);
    } else {
      setMenuItems(evmStaffMenuItems);
    }
  }, [roles]);

  // Update active path when location changes
  useEffect(() => {
    sidebar.setActivePath(location.pathname);

    // Auto open submenus for active path
    const newOpenSubmenus = new Set();
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isActiveSubmenu = item.submenu.some(
          (sub) => sub.path === location.pathname
        );
        if (isActiveSubmenu) {
          newOpenSubmenus.add(item.path);
        }
      }
    });
    sidebar.setOpenSubmenus(newOpenSubmenus);
  }, [location, menuItems, sidebar.setActivePath, sidebar.setOpenSubmenus]);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      sidebar.setIsSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans overflow-hidden">
      <Sidebar
        isSidebarOpen={sidebar.isSidebarOpen}
        setIsSidebarOpen={sidebar.setIsSidebarOpen}
        menuItems={menuItems}
        activePath={sidebar.activePath}
        openSubmenus={sidebar.openSubmenus}
        toggleSubmenu={sidebar.toggleSubmenu}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
        user={user}
        avatarUrl={avatarUrl}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        <Header
          setIsSidebarOpen={sidebar.setIsSidebarOpen}
          menuItems={menuItems}
          activePath={sidebar.activePath}
          role={role}
          user={user}
          avatarUrl={avatarUrl}
          // 1. Props cho chuông Firebase (Admin)
          firebaseNotifications={notifications}
          // 2. Props cho Tắt/Bật Socket (Admin)
          socketToggle={socketToggle}
          // 3. Props cho Profile Dropdown
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          profileDropdownRef={profileDropdownRef} // Truyền ref
          handleLogout={handleLogout}
          navigate={navigate}
        />

        <MainContent>
          <Outlet />
        </MainContent>

        <Footer />
      </div>
    </div>
  );
};

export default EvmLayout;
