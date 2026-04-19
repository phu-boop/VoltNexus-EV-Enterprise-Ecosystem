// src/components/notifications/NotificationPopover.jsx
import React from "react";
import { useStaffNotifications } from "../hooks/useStaffNotifications";
import NotificationItem from "./NotificationItem";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const NotificationPopover = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStaffNotifications(true);

  const allNotifications =
    data?.pages.flatMap((page) => page.data.data.content) ?? [];

  const handleViewAll = () => {
    navigate("/evm/notifications"); // Đi đến trang B2B
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border z-50">
      <div className="p-3 font-semibold border-b">Thông báo</div>

      {isLoading && <div className="p-4 text-center">Đang tải...</div>}
      {isError && (
        <div className="p-4 text-center text-red-500">Lỗi tải thông báo</div>
      )}

      {!isLoading && allNotifications.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          Không có thông báo mới
        </div>
      )}

      <div>
        {allNotifications.map((noti) => (
          <NotificationItem
            key={noti.id}
            notification={noti}
            onClosePopover={onClose}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="p-2 text-center border-t">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
      <div className="px-5 py-3 border-t border-gray-100/60">
        <button
          onClick={handleViewAll}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
};

export default NotificationPopover;
