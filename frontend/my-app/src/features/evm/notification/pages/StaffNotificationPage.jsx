// src/features/evm/notification/pages/StaffNotificationPage.jsx
import React, { useState, useMemo } from "react";
import {
  FiBell,
  FiTrash2,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiLoader,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  useStaffNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllStaffNotifications,
} from "../hooks/useStaffNotifications";
import { useAuthContext } from "../../../auth/AuthProvider";

const StaffNotificationPage = () => {
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { roles } = useAuthContext();
  // Dùng React Query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStaffNotifications(true);

  const { data: unreadCount } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllStaffNotifications();

  // Xử lý data
  const allNotifications = useMemo(
    () => data?.pages.flatMap((page) => page.data.data.content) ?? [],
    [data]
  );

  const readCount = useMemo(
    () => allNotifications.filter((n) => !n.unread).length,
    [allNotifications]
  );

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((notification) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "read" && !notification.unread) ||
        (filter === "unread" && notification.unread);
      const matchesSearch = notification.message
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allNotifications, filter, searchTerm]);

  // Xử lý Actions
  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa thông báo này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(notificationId);
      }
    });
  };

  const handleDeleteAll = () => {
    Swal.fire({
      title: "Xác nhận xóa tất cả?",
      text: "Bạn có chắc muốn xóa TẤT CẢ thông báo của Staff?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa tất cả",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllMutation.mutate();
      }
    });
  };

  const handleNotificationClick = (notification) => {
    if (!notification) return;

    const isAdmin = roles?.some((role) => role.toUpperCase() === "ADMIN"); // kiểm tra nếu là role ADMIN

    if (notification.type === "ORDER_PLACED") {
      if (isAdmin) {
        // Nếu là Admin, điều hướng đến trang allocation của Admin
        navigate("/evm/admin/distribution/allocation");
      } else {
        // Nếu là Staff, điều hướng đến trang allocation của Staff
        navigate("/evm/staff/distribution/allocation");
      }
    } else if (notification.link) {
      // Các loại thông báo khác sẽ dùng link có sẵn
      navigate(notification.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thông báo (Staff)
          </h1>
          <p className="text-gray-600 mt-1">
            Các khiếu nại và đơn hàng mới từ Đại lý (Luồng Socket)
          </p>
        </div>
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isLoading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiBell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng số (đã tải)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {allNotifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiEyeOff className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chưa đọc (Tổng)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {unreadCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đã đọc (đã tải)
              </p>
              <p className="text-2xl font-bold text-gray-900">{readCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <FiFilter className="w-5 h-5 text-gray-500" />
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                filter === "unread"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                filter === "read"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã đọc
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading && (
          <div className="p-12 text-center">
            <FiLoader className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          </div>
        )}
        {isError && (
          <div className="p-12 text-center text-red-500">Lỗi tải dữ liệu.</div>
        )}

        {!isLoading && !isError && filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có thông báo nào</p>
          </div>
        )}

        {!isLoading && !isError && filteredNotifications.length > 0 && (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-colors hover:bg-gray-50 ${
                  notification.unread
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* ... (UI cho message, type, time) ... */}
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {notification.time}</span>
                      {notification.link && <span>🔗 {notification.link}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.unread && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isLoading}
                        title="Đánh dấu đã đọc"
                      >
                        <FiCheck className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deleteMutation.isLoading}
                      title="Xóa thông báo"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                    {(notification.link ||
                      notification.type === "ORDER_PLACED") && (
                      <button
                        onClick={() => handleNotificationClick(notification)} // <-- Dùng hàm mới
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nút tải thêm */}
        {hasNextPage && (
          <div className="p-4 text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffNotificationPage;
