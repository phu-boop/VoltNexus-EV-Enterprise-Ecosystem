
import React from 'react';
import { Card, Descriptions, Tag, Button, Space, Row, Col, Timeline, Alert ,Modal} from 'antd';
import { 
  DownloadOutlined, 
  EditOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  FilePdfOutlined
} from '@ant-design/icons';

const ContractDetails = ({ contract, onEdit, onDownload, onSign, onCancel }) => {
  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'default',
      PENDING_SIGNATURE: 'orange',
      SIGNED: 'green',
      EXPIRED: 'red',
      CANCELLED: 'red',
      ACTIVE: 'blue'
    };
    return colors[status] || 'default';
  };
  const [modal, contextHolder] = Modal.useModal();
   const handleCancel = () => {
    if (!contract?.contractId) return;

    modal.confirm({
      title: 'Xác nhận hủy hợp đồng',
      content: 'Bạn có chắc chắn muốn hủy hợp đồng này không?',
      okText: 'Hủy hợp đồng',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await onCancel(contract.contractId);
        } catch (err) {
          console.error(err);
        }
      },
    });
  };



  const getStatusText = (status) => {
    const texts = {
      DRAFT: 'Bản nháp',
      PENDING_SIGNATURE: 'Chờ ký',
      SIGNED: 'Đã ký',
      EXPIRED: 'Hết hạn',
      CANCELLED: 'Đã hủy',
      ACTIVE: 'Đang hiệu lực'
    };
    return texts[status] || status;
  };

  // Build timeline items based on contract events
  const timelineItems = [
    {
      color: 'green',
      children: (
        <div>
          <p><strong>Tạo hợp đồng</strong></p>
          <p>{contract.contractDate ? new Date(contract.contractDate).toLocaleString('vi-VN') : 'Chưa xác định'}</p>
        </div>
      ),
    },
    ...(contract.signingDate ? [{
      color: 'blue',
      children: (
        <div>
          <p><strong>Ký hợp đồng</strong></p>
          <p>{new Date(contract.signingDate).toLocaleString('vi-VN')}</p>
          {contract.digitalSignature && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Đã ký số
            </Tag>
          )}
        </div>
      ),
    }] : [{
      color: 'gray',
      children: (
        <div>
          <p><strong>Chờ ký</strong></p>
          <p>Hợp đồng chưa được ký</p>
        </div>
      ),
    }]),
  ];

  // Check if contract is expiring soon (within 7 days)
  const isExpiringSoon = () => {
    if (!contract.contractDate || contract.contractStatus !== 'DRAFT') return false;
    const contractDate = new Date(contract.contractDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return contractDate < sevenDaysFromNow;
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card 
          title="Chi tiết hợp đồng" 
          extra={
            <Space>
              {contract.contractFileUrl && (
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={onDownload}
                  type="primary"
                  ghost
                >
                  Tải hợp đồng
                </Button>
              )}
              {contract.contractStatus === 'DRAFT' && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={onEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
            </Space>
          }
        >
          {isExpiringSoon() && (
            <Alert
              message="Hợp đồng sắp hết hạn"
              description="Hợp đồng này sẽ hết hạn trong vòng 7 ngày tới. Vui lòng xử lý kịp thời."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
            <Descriptions.Item label="Số hợp đồng" span={1}>
              {contract.contractNumber || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Mã hợp đồng" span={1}>
              {contract.contractId}
            </Descriptions.Item>
            
            <Descriptions.Item label="Mã đơn hàng" span={1}>
              {contract.orderId ? (
                <Tag color="blue">#{contract.orderId}</Tag>
              ) : (
                'Chưa có'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {contract.contractDate ? new Date(contract.contractDate).toLocaleString('vi-VN') : 'Chưa xác định'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Ngày ký" span={1}>
              {contract.signingDate ? new Date(contract.signingDate).toLocaleString('vi-VN') : 'Chưa ký'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag 
                color={getStatusColor(contract.contractStatus)} 
                style={{ 
                  fontSize: '14px', 
                  padding: '4px 8px',
                  minWidth: 100,
                  textAlign: 'center'
                }}
              >
                {getStatusText(contract.contractStatus)}
              </Tag>
            </Descriptions.Item>
            
            {contract.digitalSignature && (
              <Descriptions.Item label="Chữ ký số" span={2}>
                <Space>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đã ký số
                  </Tag>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {contract.digitalSignature.substring(0, 20)}...
                  </span>
                </Space>
              </Descriptions.Item>
            )}
            
            {contract.contractFileUrl && (
              <Descriptions.Item label="File hợp đồng" span={2}>
                <Button 
                  type="link" 
                  icon={<FilePdfOutlined />}
                  href={contract.contractFileUrl} 
                  target="_blank"
                  style={{ padding: 0 }}
                >
                  Xem file hợp đồng
                </Button>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Điều khoản hợp đồng" span={2}>
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0',
                  lineHeight: '1.6'
                }}
              >
                {contract.contractTerms || 'Chưa có điều khoản hợp đồng'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card title="Lịch sử hợp đồng" size="small">
            <Timeline items={timelineItems} />
          </Card>
          
          {/* Action Cards */}
          {contract.contractStatus === 'PENDING_SIGNATURE' && (
            <Card title="Hành động" size="small">
              <Button 
                type="primary" 
                block 
                size="large"
                onClick={onSign}
                icon={<CheckCircleOutlined />}
                style={{ marginBottom: 8 }}
              >
                Ký hợp đồng
              </Button>
              <Button 
                block 
                icon={<FileTextOutlined />}
                onClick={onDownload}
              >
                Xem trước hợp đồng
              </Button>
            </Card>
          )}
          
          {contract.contractStatus === 'DRAFT' && (
            <Card title="Hành động" size="small">
              <Button 
                type="primary" 
                block 
                onClick={onEdit}
                icon={<EditOutlined />}
                style={{ marginBottom: 8 }}
              >
                Chỉnh sửa hợp đồng
              </Button>
              {contextHolder}
              <Button 
                block 
                icon={<ClockCircleOutlined />}
                onClick={handleCancel}
              >
                Huỷ hợp đồng
              </Button>
            </Card>
          )}
          
          {contract.contractStatus === 'SIGNED' && (
            <Card title="Trạng thái" size="small">
              <Alert
                message="Hợp đồng đã có hiệu lực"
                description="Hợp đồng đã được ký và có hiệu lực pháp lý."
                type="success"
                showIcon
              />
            </Card>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default ContractDetails;