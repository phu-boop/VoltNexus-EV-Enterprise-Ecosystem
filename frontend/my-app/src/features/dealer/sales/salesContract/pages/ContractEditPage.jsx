import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Alert, Spin, Button, message, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ExclamationCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useSalesContracts } from '../hooks/useSalesContracts';
import ContractForm from '../components/ContractForm';
import dayjs from 'dayjs';

const ContractEditPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading, error, fetchContractById, updateContract } = useSalesContracts();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    if (contractId) {
      fetchContractById(contractId);
    }
  }, [contractId, fetchContractById]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      await updateContract(contractId, values);
      message.success('Cập nhật hợp đồng thành công!');
      setFormChanged(false);
      navigate(`/dealer/contracts/${contractId}`, {
        replace: true,
        state: { 
          updated: true,
          timestamp: new Date().getTime()
        }
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật hợp đồng:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật hợp đồng';
      setSubmitError(errorMessage);
      message.error('Cập nhật hợp đồng thất bại!');
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (formChanged) {
      Modal.confirm({
        title: 'Bạn có chắc muốn rời đi?',
        content: 'Các thay đổi chưa được lưu sẽ bị mất.',
        okText: 'Rời đi',
        cancelText: 'Ở lại',
        okButtonProps: { danger: true },
        icon: <ExclamationCircleOutlined />,
        onOk: () => navigate(`/dealer/contracts/${contractId}`)
      });
    } else {
      navigate(`/dealer/contracts/${contractId}`);
    }
  };

  const handleFormChange = (changedFields, allFields) => {
    setFormChanged(true);
  };

  const handleRetry = () => {
    setSubmitError(null);
    fetchContractById(contractId);
  };

  const handleSaveAndContinue = async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      await updateContract(contractId, values);
      message.success('Cập nhật hợp đồng thành công!');
      setFormChanged(false);
      // Stay on the same page but refresh data
      fetchContractById(contractId);
    } catch (error) {
      console.error('Lỗi khi cập nhật hợp đồng:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật hợp đồng';
      setSubmitError(errorMessage);
      message.error('Cập nhật hợp đồng thất bại!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading && !contract) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin hợp đồng...</div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error && !contract) {
    return (
      <PageContainer>
        <Alert
          message="Lỗi tải hợp đồng"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button size="small" onClick={handleRetry}>
              Thử lại
            </Button>
          }
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dealer/contracts')}
          >
            Quay lại danh sách
          </Button>
        </div>
      </PageContainer>
    );
  }

  // No contract found
  if (!contract) {
    return (
      <PageContainer>
        <Alert
          message="Không tìm thấy hợp đồng"
          description={`Không thể tìm thấy hợp đồng với ID: ${contractId}`}
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dealer/contracts')}
          >
            Quay lại danh sách hợp đồng
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Check if contract can be edited
  const canEdit = contract.contractStatus === 'DRAFT' || contract.contractStatus === 'PENDING_REVISION';

  return (
    <PageContainer
      header={{
        title: `Chỉnh sửa hợp đồng #${contract.contractNumber || contract.contractId}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Hợp đồng', path: '' },
            { title: `Hợp đồng #${contract.contractNumber || contract.contractId}`, path: `` },
            { title: 'Chỉnh sửa' },
          ],
        },
      }}
      extra={[
        <Button 
          key="cancel"
          icon={<CloseOutlined />}
          onClick={handleBack}
          disabled={submitting}
        >
          Hủy
        </Button>,
        <Button 
          key="back" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dealer/contracts')}
          disabled={submitting}
        >
          Danh sách hợp đồng
        </Button>,
      ]}
      content={
        <div>
          <p style={{ margin: 0, color: '#666' }}>
            Chỉnh sửa thông tin hợp đồng bán hàng. Các thay đổi sẽ được cập nhật ngay lập tức.
            {formChanged && (
              <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                • Có thay đổi chưa được lưu
              </span>
            )}
          </p>
          {!canEdit && (
            <Alert
              message="Hợp đồng không thể chỉnh sửa"
              description="Chỉ có thể chỉnh sửa hợp đồng ở trạng thái DRAFT hoặc PENDING_REVISION."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      }
    >
      {/* Hiển thị lỗi submit nếu có */}
      {submitError && (
        <Alert
          message="Lỗi cập nhật hợp đồng"
          description={submitError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => setSubmitError(null)}>
              Đóng
            </Button>
          }
        />
      )}

      {canEdit ? (
        <ContractForm 
          initialValues={{
            ...contract,
            contractDate: contract.contractDate ? dayjs(contract.contractDate) : null,
            signingDate: contract.signingDate ? dayjs(contract.signingDate) : null,
            effectiveDate: contract.effectiveDate ? dayjs(contract.effectiveDate) : null,
            expiryDate: contract.expiryDate ? dayjs(contract.expiryDate) : null,
          }}
          onSubmit={handleSubmit}
          onSaveAndContinue={handleSaveAndContinue}
          onValuesChange={handleFormChange}
          loading={loading || submitting}
          isEdit={true}
          submitError={submitError}
          submitButtonProps={{
            icon: <SaveOutlined />,
            children: 'Lưu thay đổi',
            type: 'primary',
            loading: submitting,
            disabled: !formChanged
          }}
          saveAndContinueButtonProps={{
            icon: <SaveOutlined />,
            children: 'Lưu và tiếp tục',
            loading: submitting,
            disabled: !formChanged
          }}
        />
      ) : (
        <Alert
          message="Không thể chỉnh sửa"
          description="Hợp đồng này đã được ký hoặc đang trong trạng thái không cho phép chỉnh sửa."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              Quay lại
            </Button>
          }
        />
      )}
    </PageContainer>
  );
};

export default ContractEditPage;