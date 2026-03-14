// features/notification/NotificationManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAllNotification, 
  putNotificationReaded, 
  markAllNotificationsAsRead, 
  deleteNotification,
  deleteAllNotifications 
} from '../../../services/firebase/notificationService';
import { FiBell, FiTrash2, FiCheck, FiEye, FiEyeOff, FiFilter, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Swal from 'sweetalert2';
const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'read', // Mặc định sort theo trạng thái đọc
    direction: 'asc' // asc: chưa đọc lên đầu, desc: đã đọc lên đầu
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotification();
      // Giả sử response có cấu trúc { code, message, data }
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Swal.fire('Lỗi!', 'Không thể tải danh sách thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sort notifications
  const sortedNotifications = useMemo(() => {
    if (!notifications.length) return [];

    const sortableItems = [...notifications];
    
    return sortableItems.sort((a, b) => {
      // Ưu tiên sort theo trạng thái đọc/chưa đọc
      if (sortConfig.key === 'read') {
        // Chưa đọc (read: false) sẽ có giá trị cao hơn đã đọc (read: true)
        const aValue = a.read ? 0 : 1;
        const bValue = b.read ? 0 : 1;
        
        if (aValue > bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      }
      
      // Nếu cùng trạng thái đọc, sort theo ngày tạo (mới nhất lên đầu)
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (sortConfig.direction === 'asc') {
        return dateB - dateA; // Mới nhất lên đầu
      } else {
        return dateA - dateB; // Cũ nhất lên đầu
      }
    });
  }, [notifications, sortConfig]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter(notification => {
      const matchesFilter = filter === 'all' || 
        (filter === 'read' && notification.read) || 
        (filter === 'unread' && !notification.read);
      
      const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [sortedNotifications, filter, searchTerm]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await putNotificationReaded(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      Swal.fire('Thành công!', 'Đã đánh dấu đã đọc', 'success');
    } catch (error) {
      console.error('Error marking as read:', error);
      Swal.fire('Lỗi!', 'Không thể đánh dấu đã đọc', 'error');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      Swal.fire('Thành công!', 'Đã đánh dấu tất cả là đã đọc', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Swal.fire('Lỗi!', 'Không thể đánh dấu tất cả là đã đọc', 'error');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa thông báo này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#EF4444'
    });

    if (result.isConfirmed) {
      try {
        await deleteNotification(notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        Swal.fire('Đã xóa!', 'Thông báo đã được xóa', 'success');
      } catch (error) {
        console.error('Error deleting notification:', error);
        Swal.fire('Lỗi!', 'Không thể xóa thông báo', 'error');
      }
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa tất cả?',
      text: 'Bạn có chắc muốn xóa tất cả thông báo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa tất cả',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#EF4444'
    });

    if (result.isConfirmed) {
      try {
        await deleteAllNotifications();
        setNotifications([]);
        Swal.fire('Đã xóa!', 'Tất cả thông báo đã được xóa', 'success');
      } catch (error) {
        console.error('Error deleting all notifications:', error);
        Swal.fire('Lỗi!', 'Không thể xóa tất cả thông báo', 'error');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get notification type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      NEW_PROMOTION: { color: 'bg-blue-100 text-blue-800', label: 'Khuyến mãi' },
      SYSTEM_ALERT: { color: 'bg-red-100 text-red-800', label: 'Cảnh báo' },
      ORDER_UPDATE: { color: 'bg-green-100 text-green-800', label: 'Đơn hàng' },
      default: { color: 'bg-gray-100 text-gray-800', label: 'Khác' }
    };
    
    const config = typeConfig[type] || typeConfig.default;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FiArrowUp className="w-3 h-3 opacity-30" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <FiArrowUp className="w-3 h-3" />
      : <FiArrowDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi tất cả thông báo hệ thống
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiCheck className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </button>
          
          <button
            onClick={handleDeleteAll}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã đọc</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.read).length}
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
              <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'read' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã đọc
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
              />
            </div>

            {/* Sort Button */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
              <button
                onClick={() => handleSort('read')}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm">
                  {sortConfig.direction === 'asc' ? 'Chưa đọc trước' : 'Đã đọc trước'}
                </span>
                {getSortIcon('read')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có thông báo nào</p>
            <p className="text-gray-400 mt-1">
              {searchTerm || filter !== 'all' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Tất cả thông báo đã được xử lý'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-colors hover:bg-gray-50 ${
                  !notification.read ? 'bg-red-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      {getTypeBadge(notification.type)}
                      {!notification.read && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Mới
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {formatDate(notification.createdAt)}</span>
                      {notification.promotionId && (
                        <span>🔗 ID Khuyến mãi: {notification.promotionId}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border border-green-200"
                        title="Đánh dấu đã đọc"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border border-red-200"
                      title="Xóa thông báo"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        window.location.href = '/evm/admin/products/promotions';
                      }}
                      className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border border-blue-200 font-medium text-sm flex items-center space-x-1"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center text-blue-800">
          <FiFilter className="w-4 h-4 mr-2" />
          <span className="text-sm">
            Đang hiển thị: {filteredNotifications.length} thông báo • 
            Sắp xếp: {sortConfig.direction === 'asc' ? 'Chưa đọc trước' : 'Đã đọc trước'} • 
            Mới nhất lên đầu
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;