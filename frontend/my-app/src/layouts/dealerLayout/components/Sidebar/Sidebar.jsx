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
          isSidebarOpen ? "bg-black/40 backdrop-blur-sm" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-30 transition-all duration-500 ease-in-out ${
          isSidebarOpen
            ? "w-80 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header với nút toggle */}
          <div className="h-20 mt-4 flex items-center justify-between px-4 border border-slate-700/60 bg-slate-900/50 backdrop-blur-lg">
            <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl border border-blue-400/30">
                <span className="text-white font-bold text-xl">EV</span>
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="text-2xl font-bold text-white whitespace-nowrap bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    EV Dealer
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Management System</p>
                </div>
              )}
            </div>
            
            {/* Nút đóng/mở sidebar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg lg:hidden"
              >
                <FiX className="w-5 h-5 text-slate-300"/>
              </button>
              
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title={isSidebarOpen ? "Thu gọn" : "Mở rộng"}
              >
                {isSidebarOpen ? (
                  <FiChevronLeft className="w-5 h-5 text-slate-300" />
                ) : (
                  <></>
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
            <ul className="space-y-2.5">
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
          <div className={`p-5 border-t border-slate-700/50 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
          }`}>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3.5 text-red-300 hover:bg-red-500/20 hover:text-white rounded-2xl transition-all duration-300 group border border-red-400/30 hover:border-red-400/50 bg-slate-800/30 backdrop-blur-sm hover:shadow-lg"
            >
              <FiLogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform duration-300"/>
              {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};