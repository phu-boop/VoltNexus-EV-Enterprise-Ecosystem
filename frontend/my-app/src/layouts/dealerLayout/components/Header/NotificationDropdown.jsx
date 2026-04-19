import React, { useState, useRef } from "react";
import { FiBell, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { useClickOutside } from "../../hooks/useClickOutside";

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Mock data - thay thế bằng API thực tế
  const notifications = [
    {
      id: 1,
      type: "order",
      message: "Đơn hàng mới #ORD-001",
      time: "5 phút trước",
      unread: true,
    },
    {
      id: 2,
      type: "customer",
      message: "Khách hàng đặt lịch lái thử",
      time: "1 giờ trước",
      unread: true,
    },
    {
      id: 3,
      type: "inventory",
      message: "Xe mới đã về kho",
      time: "2 giờ trước",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 hover:bg-gray-100 rounded-xl relative transition-all duration-300 group hover:shadow-md"
      >
        <FiBell className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 z-40 animate-scaleIn">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100/80 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105">
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
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`px-5 py-4 border-b border-gray-100/60 last:border-b-0 transition-all duration-200 cursor-pointer group animate-fadeIn ${
                      notification.unread
                        ? "bg-blue-50/50 hover:bg-blue-100/50"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          notification.unread ? "bg-blue-500" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm mb-1 ${
                            notification.unread
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100/60">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:scale-105">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
