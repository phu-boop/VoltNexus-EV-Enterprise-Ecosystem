import React from 'react';
import { 
  ClockCircleOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  UserOutlined,
  SyncOutlined,
  TruckOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';

const OrderStatus = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <ClockCircleOutlined className="text-yellow-600" />,
        label: 'Chờ xử lý'
      },
      EDITED: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <EditOutlined className="text-orange-600" />,
        label: 'Đã chỉnh sửa'
      },
      APPROVED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircleOutlined className="text-blue-600" />,
        label: 'Đã duyệt'
      },
      CONFIRMED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <UserOutlined className="text-green-600" />,
        label: 'Đã xác nhận'
      },
      IN_PRODUCTION: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <SyncOutlined className="text-purple-600" spin />,
        label: 'Đang sản xuất'
      },
      DELIVERED: {
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: <TruckOutlined className="text-teal-600" />,
        label: 'Đã giao hàng'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <CloseCircleOutlined className="text-red-600" />,
        label: 'Đã hủy'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <ClockCircleOutlined />,
      label: status
    };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </span>
  );
};

export default OrderStatus;