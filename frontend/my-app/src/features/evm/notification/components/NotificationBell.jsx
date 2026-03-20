// src/components/notifications/NotificationBell.jsx
import React, { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline"; // Dùng thư viện icon tùy ý
import NotificationPopover from "./NotificationPopover";
import { useUnreadCount } from "../hooks/useStaffNotifications";
import { useNotificationSocket } from "../hooks/useNotificationSocket";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Kết nối WebSocket để lắng nghe
  useNotificationSocket();

  // 2. Lấy số lượng chưa đọc
  const { data: unreadCount, isLoading } = useUnreadCount();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
      >
        <BellIcon className="h-6 w-6" />
        {!isLoading && unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs leading-5 text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 3. Hiện Popover khi click */}
      {isOpen && <NotificationPopover onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
