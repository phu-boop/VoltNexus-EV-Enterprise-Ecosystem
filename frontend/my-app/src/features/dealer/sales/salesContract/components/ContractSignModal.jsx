
// export default ContractSignModal;
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Card, Alert, Divider, Typography } from 'antd';
import { SignatureOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ContractSignModal = ({ visible, contract, onSign, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const [signature, setSignature] = useState('');
  const [isValidSignature, setIsValidSignature] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSignature('');
      setIsValidSignature(false);
    }
  }, [visible, form]);

  const handleSign = () => {
    form.validateFields().then(values => {
      onSign(contract.contractId, values.digitalSignature);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setSignature('');
    setIsValidSignature(false);
    onCancel();
  };

  const validateSignature = (signature) => {
    // Basic validation - signature should be at least 6 characters
    // and contain at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(signature);
    const hasNumber = /[0-9]/.test(signature);
    return signature.length >= 6 && hasLetter && hasNumber;
  };

  const handleSignatureChange = (e) => {
    const value = e.target.value;
    setSignature(value);
    setIsValidSignature(validateSignature(value));
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SignatureOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Ký hợp đồng số {contract?.contractNumber}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button 
          key="sign" 
          type="primary" 
          onClick={handleSign}
          loading={loading}
          icon={<SignatureOutlined />}
          disabled={!isValidSignature || loading}
        >
          Ký hợp đồng
        </Button>,
      ]}
      width={650}
      destroyOnClose
    >
      <Alert
        message="Thông tin quan trọng"
        description="Sau khi ký, hợp đồng sẽ có hiệu lực pháp lý và không thể thay đổi. Vui lòng kiểm tra kỹ thông tin trước khi ký."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Card 
        size="small" 
        style={{ marginBottom: 16, borderColor: '#1890ff' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            Thông tin hợp đồng
          </Text>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <div>
              <Text type="secondary">Số hợp đồng: </Text>
              <Text strong>{contract?.contractNumber}</Text>
            </div>
            <div>
              <Text type="secondary">Ngày lập: </Text>
              <Text strong>
                {contract && contract.contractDate ? new Date(contract.contractDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item
          name="digitalSignature"
          label={
            <span>
              <SafetyCertificateOutlined style={{ marginRight: 4 }} />
              Chữ ký số
            </span>
          }
          rules={[
            { 
              required: true, 
              message: 'Vui lòng nhập chữ ký số' 
            },
            { 
              min: 6, 
              message: 'Chữ ký số phải có ít nhất 6 ký tự' 
            },
            {
              validator: (_, value) => {
                if (value && !validateSignature(value)) {
                  return Promise.reject(new Error('Chữ ký số phải chứa ít nhất 1 chữ cái và 1 số'));
                }
                return Promise.resolve();
              }
            }
          ]}
          help="Chữ ký số phải có ít nhất 6 ký tự, bao gồm cả chữ và số"
        >
          <Input.Password
            placeholder="Nhập chữ ký số của bạn"
            prefix={<LockOutlined />}
            size="large"
            value={signature}
            onChange={handleSignatureChange}
            style={{ 
              borderColor: isValidSignature && signature ? '#52c41a' : undefined 
            }}
          />
        </Form.Item>

        {signature && (
          <Card 
            size="small" 
            style={{ 
              backgroundColor: isValidSignature ? '#f6ffed' : '#fff2f0',
              borderColor: isValidSignature ? '#b7eb8f' : '#ffccc7',
              marginBottom: 16
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ color: isValidSignature ? '#52c41a' : '#ff4d4f' }}>
                {isValidSignature ? '✓ Chữ ký hợp lệ' : '✗ Chữ ký không hợp lệ'}
              </Text>
              <Paragraph 
                style={{ 
                  margin: '8px 0 0 0',
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: isValidSignature ? '#52c41a' : '#ff4d4f',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
              >
                {signature}
              </Paragraph>
            </div>
          </Card>
        )}
      </Form>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: 8 }}>
          Bằng việc nhấn "Ký hợp đồng", bạn xác nhận:
        </Paragraph>
        <ul style={{ 
          textAlign: 'left', 
          fontSize: '12px', 
          color: '#666',
          paddingLeft: '20px',
          marginBottom: '16px'
        }}>
          <li>Đã đọc và hiểu rõ tất cả điều khoản trong hợp đồng</li>
          <li>Đồng ý với các điều khoản và điều kiện đã nêu</li>
          <li>Cam kết thực hiện đầy đủ nghĩa vụ theo hợp đồng</li>
          <li>Biết rằng hợp đồng có giá trị pháp lý sau khi ký</li>
        </ul>
      </div>
    </Modal>
  );
};

export default ContractSignModal;