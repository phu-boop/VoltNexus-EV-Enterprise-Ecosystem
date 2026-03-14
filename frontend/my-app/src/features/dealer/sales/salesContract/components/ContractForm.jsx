import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Button, Space, Card, Row, Col, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // ✅ Thêm import dayjs

const { TextArea } = Input;
const { Option } = Select;

const ContractForm = ({ initialValues, onSubmit, loading = false, orderInfo }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      const formattedValues = {
        ...initialValues,
        contractDate: initialValues.contractDate ? dayjs(initialValues.contractDate) : null,
        signingDate: initialValues.signingDate ? dayjs(initialValues.signingDate) : null,
      };
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]); // ✅ Thêm form vào dependencies

  const onFinish = (values) => {
    const formattedValues = {
      ...values,
      contractDate: values.contractDate?.format('YYYY-MM-DDTHH:mm:ss'),
      signingDate: values.signingDate?.format('YYYY-MM-DDTHH:mm:ss'),

    };
    onSubmit(formattedValues);
  };

  return (
    <Card title="Thông tin hợp đồng" className="contract-form">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contractNumber"
              label="Số hợp đồng"
              rules={[{ required: true, message: 'Vui lòng nhập số hợp đồng' }]}
            >
              <Input placeholder="Nhập số hợp đồng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contractDate"
              label="Ngày lập hợp đồng"
              rules={[{ required: true, message: 'Vui lòng chọn ngày lập hợp đồng' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn ngày lập hợp đồng"
              />
            </Form.Item>
          </Col>
        </Row>

        {orderInfo && (
          <Card type="inner" title="Thông tin đơn hàng" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Mã đơn hàng:</strong> {orderInfo.id}</p>
                <p><strong>Khách hàng:</strong> {orderInfo.customer?.name}</p>
              </Col>
              <Col span={12}>
                <p><strong>Tổng giá trị:</strong> {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(orderInfo.totalAmount)}</p>
                <p><strong>Số lượng sản phẩm:</strong> {orderInfo.itemsCount}</p>
              </Col>
            </Row>
          </Card>
        )}

        <Form.Item
          name="contractTerms"
          label="Điều khoản hợp đồng"
          rules={[{ required: true, message: 'Vui lòng nhập điều khoản hợp đồng' }]}
        >
          <TextArea
            rows={12}
            placeholder="Nhập điều khoản hợp đồng..."
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="signingDate"
              label="Ngày ký dự kiến"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn ngày ký dự kiến"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contractStatus"
              label="Trạng thái hợp đồng"
              initialValue="DRAFT"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="DRAFT">Bản nháp</Option>
                <Option value="PENDING_SIGNATURE">Chờ ký</Option>
                <Option value="SIGNED">Đã ký</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="contractFileUrl"
          label="Đường dẫn file hợp đồng"
        >
          <Input placeholder="Nhập đường dẫn file hợp đồng" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Lưu hợp đồng
            </Button>
            <Button htmlType="button" onClick={() => form.resetFields()} size="large">
              Đặt lại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ContractForm;
