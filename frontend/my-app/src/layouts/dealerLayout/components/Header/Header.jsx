import React from 'react';
import { FiMenu, FiChevronRight, FiHome } from 'react-icons/fi';
import { Breadcrumb } from './Breadcrumb';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';

export const Header = ({ 
  setIsSidebarOpen, 
  menuItems, 
  activePath, 
  role, 
  user,
  avatarUrl,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  handleLogout,
  navigate,
  isSidebarCollapsed
}) => {
  return (
    <header className="h-20 mx-6 my-4 rounded-2xl bg-white/90 backdrop-blur-xl shadow-sm border border-gray-200/80 px-7 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {/* Nút toggle sidebar trên mobile - luôn hiển thị FiMenu */}
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md lg:hidden mr-4"
        >
          <FiMenu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Nút toggle sidebar trên desktop - thay đổi icon dựa trên trạng thái */}
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="hidden lg:flex p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md mr-4"
          title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        >
          {isSidebarCollapsed ? (
            <FiMenu className="w-5 h-5 text-gray-600" />
          ) : (
            <FiChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <Breadcrumb menuItems={menuItems} activePath={activePath} />
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          {role === 'DEALER_MANAGER' ? 'Quản Lý Đại Lý' : 'Nhân Viên Bán Hàng'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationDropdown />

        <ProfileDropdown
          user={user}
          role={role}
          isOpen={isProfileDropdownOpen}
          setIsOpen={setIsProfileDropdownOpen}
          handleLogout={handleLogout}
          navigate={navigate}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  );
};