import { useState, useEffect } from 'react';
import { getAllNotification, markAllNotificationsAsRead, putNotificationReaded } from "../../../services/firebase/notificationService";
import Swal from 'sweetalert2';

export const useNotifications = (roles, navigate) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    if (roles.includes("ADMIN")) {
      try {
        const respond = await getAllNotification();
        const data = respond.data || [];
        
        const sortedData = data.sort((a, b) => {
          if (!a.read && b.read) return -1;
          if (a.read && !b.read) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setNotifications(sortedData);
        const unread = data.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    } else {
      setNotifications([]);
    }
  };

  const markAsRead = async (notificationId, notificationData) => {
    try {
      const result = await Swal.fire({
        title: 'Thông báo mới',
        html: `
          <div class="text-left">
            <p class="font-semibold text-gray-800">${notificationData?.title || 'Khuyến mãi mới'}</p>
            <p class="text-sm text-gray-600 mt-2">${notificationData?.message || 'Có khuyến mãi mới được cập nhật'}</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Đi đến khuyến mãi',
        cancelButtonText: 'Chỉ đánh dấu đã đọc',
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        reverseButtons: true,
      });

      await putNotificationReaded(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (result.isConfirmed) {
        setIsNotificationDropdownOpen(false);
        navigate('/evm/admin/products/promotions');
      } else {
        Swal.fire({
          title: 'Đã đánh dấu đã đọc',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể đánh dấu thông báo là đã đọc',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    isNotificationDropdownOpen,
    setIsNotificationDropdownOpen,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
};