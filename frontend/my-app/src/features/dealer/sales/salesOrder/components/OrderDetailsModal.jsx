import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Button } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  DollarOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import OrderSummary from './OrderSummary';
import OrderActions from './OrderActions';

const OrderDetailsModal = ({ order, visible, onClose }) => {
  if (!order) return null;

  const statusColors = {
    PENDING: 'orange',
    APPROVED: 'blue',
    CONFIRMED: 'green',
    IN_PRODUCTION: 'purple',
    READY_FOR_DELIVERY: 'cyan',
    DELIVERED: 'green',
    CANCELLED: 'red'
  };

  const statusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    CONFIRMED: 'Đã xác nhận',
    IN_PRODUCTION: 'Đang sản xuất',
    READY_FOR_DELIVERY: 'Sẵn sàng giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };

  return (
    <Modal
      title={`Chi tiết đơn hàng #${order.id}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="tracking" icon={<FileTextOutlined />}>
          Theo dõi đơn hàng
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <OrderSummary order={order} />
      </div>

      <Descriptions column={2} bordered>
        <Descriptions.Item label="Mã đơn hàng" span={1}>
          #{order.id}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={1}>
          <Tag color={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Khách hàng" span={1}>
          <div>
            <UserOutlined /> {order.customer?.name}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại" span={1}>
          <div>
            <PhoneOutlined /> {order.customer?.phone}
          </div>
        </Descriptions.Item>
        
        <Descriptions.Item label="Tổng tiền" span={1}>
          <div>
            <DollarOutlined /> {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(order.totalAmount)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo" span={1}>
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </Descriptions.Item>

        {order.notes && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {order.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <OrderActions 
          order={order} 
          onStatusChange={() => {}} // This would be passed from parent
          showLabel={true}
        />
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;