import React from "react";
import { FiMenu } from "react-icons/fi";
import { Breadcrumb } from "./Breadcrumb";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import NotificationBell from "../../../../features/evm/notification/components/NotificationBell";
import { FirebaseNotificationDropdown } from "./FirebaseNotificationDropdown";
export const Header = ({
  setIsSidebarOpen,
  menuItems,
  activePath,
  role,
  user,
  avatarUrl,
  firebaseNotifications,
  socketToggle,
  // Props cho Profile Dropdown
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  profileDropdownRef,
  handleLogout,
  navigate,
}) => {
  return (
    <header className="h-20 mx-6 my-3 rounded-3xl bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md lg:hidden"
        >
          <FiMenu className="w-5 h-5 text-gray-600" />
        </button>

        <Breadcrumb menuItems={menuItems} activePath={activePath} />
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg shadow-inner border border-gray-200">
          {role}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {role === "EVM_STAFF" ? (
          // Nếu là STAFF: Hiển thị chuông B2B (Socket)
          // (Component này tự fetch data B2B qua React Query)
          <NotificationBell />
        ) : (
          // Nếu là ADMIN: Hiển thị chuông Firebase
          // (Component này nhận props từ hook 'useNotifications')
          <FirebaseNotificationDropdown
            notifications={firebaseNotifications.notifications}
            unreadCount={firebaseNotifications.unreadCount}
            isOpen={firebaseNotifications.isNotificationDropdownOpen}
            setIsOpen={firebaseNotifications.setIsNotificationDropdownOpen}
            markAsRead={firebaseNotifications.markAsRead}
            markAllAsRead={firebaseNotifications.markAllAsRead}
            navigate={navigate}
          />
        )}

        {/* Profile Dropdown */}
        <ProfileDropdown
          user={user}
          role={role}
          isOpen={isProfileDropdownOpen}
          setIsOpen={setIsProfileDropdownOpen}
          handleLogout={handleLogout}
          navigate={navigate}
          profileDropdownRef={profileDropdownRef}
          isAdmin={socketToggle.isAdmin}
          isSocketEnabled={socketToggle.isSocketEnabled}
          toggleSocket={socketToggle.toggleSocket}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  );
};
