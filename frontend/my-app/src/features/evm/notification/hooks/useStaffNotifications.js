// src/features/evm/notification/hooks/useStaffNotifications.js

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  getStaffNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getOrderDetails,
  resolveOrderDispute,
  deleteNotification,
  deleteAllStaffNotifications,
} from "../services/notificationApi";

/**
 * Hook để lấy chi tiết một đơn hàng B2B
 * @param {string} orderId
 */
export const useB2BOrderDetails = (orderId) => {
  return useQuery({
    queryKey: ["b2bOrder", orderId], // Key động dựa trên orderId
    queryFn: () => getOrderDetails(orderId),
    select: (res) => res.data.data, // Lấy dữ liệu từ trong 'data'
    enabled: !!orderId, // Chỉ chạy khi orderId tồn tại
  });
};

// Hook để lấy danh sách thông báo (phân trang vô hạn)
export const useStaffNotifications = (isEnabled = false) => {
  return useInfiniteQuery({
    queryKey: ["staffNotifications"],
    queryFn: ({ pageParam = 0 }) =>
      getStaffNotifications({ page: pageParam, size: 10 }),
    enabled: isEnabled,

    getNextPageParam: (lastPage) => {
      if (lastPage.data.data.number + 1 < lastPage.data.data.totalPages) {
        return lastPage.data.data.number + 1;
      }
      return undefined;
    },
  });
};

// Hook lấy số lượng chưa đọc
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,

    select: (res) => res.data.data.unreadCount,
  });
};

// Hook để "Đánh dấu đã đọc"
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (err) => {
      Swal.fire("Lỗi!", "Không thể đánh dấu đã đọc.", "error");
    },
  });
};

// Hook để "Đánh dấu TẤT CẢ đã đọc"
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (err) => {
      Swal.fire("Lỗi!", "Không thể đánh dấu tất cả đã đọc.", "error");
    },
  });
};

// Hook để "Giải quyết khiếu nại"
export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => resolveOrderDispute(orderId, payload),
    onSuccess: (data, variables) => {
      // 'data' là response từ Axios
      Swal.fire("Thành công!", "Đã giải quyết khiếu nại.", "success");
      const orderId = data?.data?.data?.orderId;
      // Làm mới lại danh sách thông báo (trên trang /notifications)
      queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });

      // Làm mới lại số lượng thông báo (trên chuông)
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });

      // Làm mới lại trang chi tiết đơn hàng (trang /b2b-orders/:orderId)
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["b2bOrder", orderId] });
      }
    },
    onError: (err) => {
      Swal.fire("Lỗi!", "Không thể giải quyết khiếu nại.", "error");
    },
  });
};
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => deleteNotification(notificationId),
    onSuccess: () => {
      Swal.fire("Đã xóa!", "Thông báo đã được xóa", "success");
      // Refresh lại cả 2
      queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (err) => {
      console.error("Lỗi khi xóa thông báo:", err);
      Swal.fire("Lỗi!", "Không thể xóa thông báo", "error");
    },
  });
};

export const useDeleteAllStaffNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAllStaffNotifications(),
    onSuccess: () => {
      Swal.fire("Đã xóa!", "Tất cả thông báo đã được xóa", "success");
      // Refresh lại cả 2
      queryClient.invalidateQueries({ queryKey: ["staffNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (err) => {
      console.error("Lỗi khi xóa tất cả thông báo:", err);
      Swal.fire("Lỗi!", "Không thể xóa tất cả thông báo", "error");
    },
  });
};
