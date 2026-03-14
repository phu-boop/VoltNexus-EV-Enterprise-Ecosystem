import React from 'react';

/**
 * Component hiển thị trạng thái với màu sắc và icon
 * @param {string} status - Trạng thái từ OrderTrackingStatus
 * @param {string} className - CSS class bổ sung
 * @param {boolean} showIcon - Hiển thị icon hay không
 * @param {string} size - Kích thước (sm, md, lg)
 */
const StatusBadge = ({ status, className = '', showIcon = true, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Trạng thái mới theo API
      CREATED: { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        label: 'Đơn hàng mới',
        icon: '🆕'
      },
      DELIVERED: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        label: 'Đã giao hàng',
        icon: '📦'
      },
      EDITED: { 
        color: 'bg-purple-50 text-purple-700 border-purple-200', 
        label: 'Đã chỉnh sửa',
        icon: '✏️'
      },
      CONFIRMED: { 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        label: 'Đã xác nhận',
        icon: '✅'
      },
      REJECTED: { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        label: 'Đã từ chối',
        icon: '❌'
      },
      IN_PRODUCTION: { 
        color: 'bg-orange-50 text-orange-700 border-orange-200', 
        label: 'Đang sản xuất',
        icon: '🏭'
      },
      READY_FOR_DELIVERY: { 
        color: 'bg-cyan-50 text-cyan-700 border-cyan-200', 
        label: 'Sẵn sàng giao',
        icon: '🚚'
      },
      CANCELLED: { 
        color: 'bg-gray-100 text-gray-700 border-gray-300', 
        label: 'Đã hủy',
        icon: '🗑️'
      },
      DELETED: { 
        color: 'bg-red-100 text-red-600 border-red-300', 
        label: 'Đã xóa',
        icon: '⛔'
      },
      ON_HOLD: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        label: 'Tạm dừng',
        icon: '⏸️'
      },
      ISSUE_DETECTED: { 
        color: 'bg-amber-50 text-amber-700 border-amber-200', 
        label: 'Phát hiện vấn đề',
        icon: '⚠️'
      },

      // Giữ lại các trạng thái cũ để tương thích ngược
      PENDING: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        label: 'Chờ xử lý',
        icon: '⏳'
      },
      APPROVED: { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        label: 'Đã duyệt',
        icon: '✅'
      }
    };
    
    return configs[status] || { 
      color: 'bg-gray-100 text-gray-600 border-gray-300', 
      label: status || 'Hệ thống',
      icon: '📌'
    };
  };

  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size] || sizes.md;
  };

  const { color, label, icon } = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${color} ${sizeClasses} ${className}`}>
      {showIcon && <span className="mr-2 text-base">{icon}</span>}
      <span className={`rounded-full mr-2 opacity-70 ${
        size === 'sm' ? 'w-1.5 h-1.5' : 
        size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
      }`} style={{ backgroundColor: 'currentColor' }}></span>
      {label}
    </span>
  );
};

export default StatusBadge;