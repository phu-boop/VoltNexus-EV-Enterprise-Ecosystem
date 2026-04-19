import React, { useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Row, Col, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useOrderTracking } from '../hooks/useOrderTracking';
import TrackingTimeline from '../components/TrackingTimeline';
import StatusBadge from '../components/StatusBadge';
import TrackingModal from '../components/TrackingModal';
import NoteForm from '../components/NoteForm';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { 
    trackings, 
    currentStatus, 
    loading, 
    addTracking, 
    addNote, 
    deleteTracking 
  } = useOrderTracking(orderId);
  
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTracking = async (values) => {
    try {
      await addTracking({
        ...values,
        orderId,
        updatedBy: sessionStorage.getItem('profileId')
      });
      setModalVisible(false);
      message.success('Thêm trạng thái thành công');
    } catch (error) {
      message.error('Lỗi khi thêm trạng thái');
    }
  };

  const handleAddNote = async (notes) => {
    try {
      await addNote(notes);
      message.success('Thêm ghi chú thành công');
    } catch (error) {
      message.error('Lỗi khi thêm ghi chú');
    }
  };

  const handleDeleteTracking = async (trackId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa trạng thái này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteTracking(trackId);
          message.success('Xóa trạng thái thành công');
        } catch (error) {
          message.error('Lỗi khi xóa trạng thái');
        }
      }
    });
  };

  const handleEditTracking = (trackId) => {
    navigate(`/dealer/orders/${orderId}/tracking/${trackId}/edit`);
  };

  // Giả sử bạn có logic kiểm tra quyền ở đây
  const permissions = {
    canCRUDTracking: true // Thay bằng logic thực tế của bạn
  };

  return (
    <PageContainer
      header={{
        title: `Theo dõi đơn hàng #${orderId}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Đơn hàng', path: '/sales/orders' },
            { title: `Theo dõi #${orderId}` },
          ],
        },
      }}
      extra={[
        permissions.canCRUDTracking && (
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Thêm trạng thái
          </Button>
        ),
      ]}
      loading={loading}
    >
      <Row gutter={16}>
        <Col span={18}>
          <TrackingTimeline 
            trackings={trackings} 
            currentStatus={currentStatus} 
            loading={loading}
            orderId={orderId}
            readOnly={!permissions.canCRUDTracking}
            onCreate={permissions.canCRUDTracking ? 
              () => setModalVisible(true) : 
              undefined
            }
            onEdit={permissions.canCRUDTracking ? 
              handleEditTracking : 
              undefined
            }
            onDelete={permissions.canCRUDTracking ? 
              handleDeleteTracking : 
              undefined
            }
          />
        </Col>
        
        <Col span={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {currentStatus && (
              <ProCard title="Trạng thái hiện tại">
                <StatusBadge status={currentStatus.status} />
                <div style={{ marginTop: 8, fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                  Cập nhật: {new Date(currentStatus.createdAt).toLocaleString('vi-VN')}
                </div>
              </ProCard>
            )}
            
            {permissions.canCRUDTracking && (
              <NoteForm onSubmit={handleAddNote} />
            )}
          </Space>
        </Col>
      </Row>

      {permissions.canCRUDTracking && (
        <TrackingModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSubmit={handleAddTracking}
        />
      )}
    </PageContainer>
  );
};

export default OrderTrackingPage;