// src/components/notifications/NotificationItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMarkAsRead } from "../hooks/useStaffNotifications";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

// Hàm helper để chọn icon
const getIcon = (type) => {
  switch (type) {
    case "ORDER_DISPUTED":
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
    case "ORDER_PLACED":
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    default:
      return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
  }
};

const NotificationItem = ({ notification, onClosePopover }) => {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkAsRead();

  const handleClick = () => {
    if (notification.unread) {
      markAsReadMutation.mutate(notification.id);
    }

    onClosePopover();

    if (notification.type === "ORDER_PLACED") {
      // Đơn hàng mới -> Đi đến trang Điều phối xe
      navigate("/evm/staff/distribution/allocation");
    } else if (notification.link) {
      // Đơn hàng khiếu nại (hoặc loại khác) -> Dùng link có sẵn
      navigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start p-3 gap-3 border-b hover:bg-gray-100 cursor-pointer ${
        notification.unread ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="shrink-0 mt-1">{getIcon(notification.type)}</div>
      <div className="grow">
        <p className="text-sm text-gray-700">{notification.message}</p>
        <p className="text-xs text-blue-600">{notification.time}</p>
      </div>
      {notification.unread && (
        <div className="shrink-0 mt-1">
          <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
