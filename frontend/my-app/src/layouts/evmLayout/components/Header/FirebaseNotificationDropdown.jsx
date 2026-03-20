import React, { useRef } from "react";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import { useClickOutside } from "../../hooks/useClickOutside";

// Component này chỉ nhận props, không có logic fetch
export const FirebaseNotificationDropdown = ({
  notifications,
  unreadCount,
  isOpen,
  setIsOpen,
  markAsRead,
  markAllAsRead,
  navigate, // Thêm navigate
}) => {
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Hàm xử lý khi click vào 1 thông báo
  const handleClick = (notification) => {
    // markAsRead (từ useNotifications) sẽ tự gọi API và hiển thị SweetAlert
    markAsRead(notification.id, notification.data);
  };

  // Hàm xử lý "Xem tất cả"
  const handleViewAll = () => {
    // Link đến trang Firebase
    navigate("/evm/admin/reports/notifications");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group hover:shadow-md"
      >
        {/* Chuông màu tím để phân biệt */}
        <FiBell className="w-5 h-5 text-purple-600" />

        {/* Tag (Admin) để phân biệt */}
        <span
          className="absolute top-0 left-0 text-xs text-white bg-purple-600 px-1 rounded-full"
          style={{ fontSize: "0.6rem", padding: "1px 3px" }}
        >
          ADM
        </span>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* --- Dropdown Content --- */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 z-40 animate-scaleIn">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100/80 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Thông báo (Admin)
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105"
              >
                <FiCheckCircle className="w-4 h-4 mr-1" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có thông báo Firebase</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`px-5 py-4 border-b border-gray-100/60 last:border-b-0 transition-all duration-200 cursor-pointer group animate-fadeIn ${
                      !notification.read
                        ? "bg-purple-50/50 hover:bg-purple-100/50"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          !notification.read
                            ? "bg-purple-500"
                            : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm mb-1 ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.data?.title || "Thông báo mới"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (Link đến trang Firebase) */}
          <div className="px-5 py-3 border-t border-gray-100/60">
            <button
              onClick={handleViewAll}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105"
            >
              Xem tất cả thông báo (Admin)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
