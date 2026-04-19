import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Dropdown, Avatar } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const ContractList = ({ 
  contracts, 
  loading, 
  onEdit, 
  onDelete, 
  onView,
  onSign,
  showActions = true 
}) => {
  const navigate = useNavigate();

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'default', text: 'Bản nháp', icon: <FileTextOutlined /> },
      PENDING_SIGNATURE: { color: 'orange', text: 'Chờ ký', icon: <ClockCircleOutlined /> },
      SIGNED: { color: 'green', text: 'Đã ký', icon: <CheckCircleOutlined /> },
      EXPIRED: { color: 'red', text: 'Hết hạn', icon: <ExclamationCircleOutlined /> },
      CANCELLED: { color: 'red', text: 'Đã hủy', icon: <ExclamationCircleOutlined /> }
    };
    return configs[status] || { color: 'default', text: status, icon: <FileTextOutlined /> };
  };

  const getPriorityColor = (contractDate) => {
    const daysDiff = dayjs().diff(dayjs(contractDate), 'day');
    if (daysDiff > 30) return 'green';
    if (daysDiff > 7) return 'orange';
    return 'red';
  };

  const columns = [
    {
      title: 'Mã hợp đồng',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 120,
      render: (text, record) => (
        <Space>
          <Avatar 
            size="small" 
            style={{ 
              backgroundColor: getPriorityColor(record.contractDate),
              fontSize: '10px'
            }}
          >
            {record.contractNumber?.charAt(0) || 'H'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {record.contractNumber}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {text?.substring(0, 8)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
      render: (text) => (
        <Tag color="blue">#{text?.substring(0, 8)}...</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'contractDate',
      key: 'contractDate',
      width: 120,
      render: (date) => (
        <div>
          <div style={{ fontWeight: 500 }}>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.contractDate).unix() - dayjs(b.contractDate).unix(),
    },
    {
      title: 'Ngày ký',
      dataIndex: 'signingDate',
      key: 'signingDate',
      width: 120,
      render: (date) => date ? (
        <div>
          <div style={{ fontWeight: 500 }}>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{dayjs(date).format('HH:mm')}</div>
        </div>
      ) : (
        <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa ký</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'contractStatus',
      key: 'contractStatus',
      width: 130,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              width: 'fit-content'
            }}
          >
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Bản nháp', value: 'DRAFT' },
        { text: 'Chờ ký', value: 'PENDING_SIGNATURE' },
        { text: 'Đã ký', value: 'SIGNED' },
        { text: 'Hết hạn', value: 'EXPIRED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.contractStatus === value,
    },
    {
      title: 'Chữ ký số',
      dataIndex: 'digitalSignature',
      key: 'digitalSignature',
      width: 100,
      render: (signature) => (
        <Tag color={signature ? 'green' : 'default'}>
          {signature ? 'Đã ký số' : 'Chưa ký số'}
        </Tag>
      ),
    },
  ];

  // Add actions column if showActions is true
  if (showActions) {
    columns.push({
      title: 'Hành động',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Xem chi tiết',
            onClick: () => onView ? onView(record) : navigate(`/sales/contracts/${record.contractId}`)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => onEdit ? onEdit(record) : navigate(`/sales/contracts/${record.contractId}/edit`)
          },
          record.contractStatus === 'PENDING_SIGNATURE' && {
            key: 'sign',
            icon: <CheckCircleOutlined />,
            label: 'Ký hợp đồng',
            onClick: () => onSign && onSign(record)
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            danger: true,
            onClick: () => onDelete && onDelete(record.contractId)
          },
        ].filter(Boolean);

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => onView ? onView(record) : navigate(`/sales/contracts/${record.contractId}`)}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
            
            <Dropdown 
              menu={{ items: menuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                icon={<MoreOutlined />}
                style={{ color: '#666' }}
              />
            </Dropdown>
          </Space>
        );
      },
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={contracts}
      rowKey="contractId"
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `Hiển thị ${range[0]}-${range[1]} của ${total} hợp đồng`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 10,
      }}
      onRow={(record) => ({
        onClick: () => onView && onView(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default ContractList;