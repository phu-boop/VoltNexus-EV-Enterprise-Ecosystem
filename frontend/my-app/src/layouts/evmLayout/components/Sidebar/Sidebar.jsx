import React from 'react';
import { FiX, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MenuItem } from './MenuItem';
import { UserProfile } from './UserProfile';

export const Sidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  menuItems, 
  activePath, 
  openSubmenus, 
  toggleSubmenu, 
  handleNavigation, 
  handleLogout,
  user,
  avatarUrl,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-20 transition-all duration-300 lg:hidden ${
          isSidebarOpen ? "bg-black bg-opacity-50" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl z-30 transition-all duration-500 ease-in-out ${
          isSidebarOpen
            ? "w-72 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header với logo và nút toggle */}
          <div className="flex items-center h-20 min-w-10 justify-around mx-6 mb-9 my-3 border-y border-white rounded-xl">
            {/* Logo và tên */}
            <div className={`flex items-center transition-all duration-300 h-20 ${isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}>
             {/* Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center mr-3">
              {/* Vòng tròn lớn */}
              <div className="absolute w-10 h-10 rounded-full border-2 border-white/80"></div>
              
              {/* Vòng tròn nhỏ xoay */}
              <div className="absolute w-6 h-6 rounded-full border border-white border-t-transparent animate-spin-slow"></div>
              
              {/* Icon lá */}
              <div className="text-white text-lg">
                <i className="fas fa-leaf"></i>
              </div>
              
              {/* Icon xe ở góc */}
              <div className="absolute -bottom-1 -right-1 text-white text-xs">
                <i className="fas fa-car"></i>
              </div>
            </div>
              {/* Tên công ty - chỉ hiện khi sidebar mở */}
              {isSidebarOpen && (
                <h1 className="text-xl ml-2 font-bold bg-gradient-to-r from-emerald-300 bg-clip-text text-transparent whitespace-nowrap">
                  VinEV
                </h1>
              )}
            </div>

            {/* Nút toggle sidebar */}
            <div className="flex items-center space-x-2">
              {/* Nút đóng trên mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-blue-700/50 rounded-xl transition-all duration-300 hover:scale-110 lg:hidden"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
              
              {/* Nút toggle trên desktop */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-blue-700/50 rounded-xl transition-all duration-300 hover:scale-110"
                title={isSidebarOpen ? "Thu gọn" : "Mở rộng"}
              >
                {isSidebarOpen ? (
                  <FiChevronLeft className="w-5 h-5 text-white" />
                ) : (
                  <FiChevronRight className="w-7 h-7 text-black" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile */}
          <UserProfile 
            isSidebarOpen={isSidebarOpen} 
            user={user}
            avatarUrl={avatarUrl}
          />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-scroll no-scrollbar">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  activePath={activePath}
                  isSubmenuOpen={openSubmenus.has(item.path)}
                  onToggle={() => toggleSubmenu(item.path)}
                  onNavigate={handleNavigation}
                  isSidebarOpen={isSidebarOpen}
                />
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div
            className={`p-4 border-t border-blue-700/50 transition-all duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-0"
            }`}
          >
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-white rounded-xl transition-all duration-300 group border border-red-400/20 hover:border-red-400/40"
            >
              <FiLogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};