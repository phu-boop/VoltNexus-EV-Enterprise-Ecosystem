import React from 'react';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Space, 
  DatePicker,
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  FilterOutlined,
  ExportOutlined 
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ContractFilters = ({ 
  onSearch, 
  onReset, 
  onExport,
  loading = false,
  initialValues = {} 
}) => {
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    const formattedValues = {
      ...values,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    delete formattedValues.dateRange;
    onSearch(formattedValues);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const statusOptions = [
    { value: 'DRAFT', label: 'Bản nháp', color: 'default' },
    { value: 'PENDING_SIGNATURE', label: 'Chờ ký', color: 'orange' },
    { value: 'SIGNED', label: 'Đã ký', color: 'green' },
    { value: 'EXPIRED', label: 'Hết hạn', color: 'red' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
  ];

  const quickFilterOptions = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Sắp hết hạn', value: 'expiring' },
  ];

  return (
    <Card 
      className="filter-card"
      style={{ 
        marginBottom: 16,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={initialValues}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="contractNumber" label="Số hợp đồng">
              <Input 
                placeholder="Nhập số hợp đồng..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item name="orderId" label="Mã đơn hàng">
              <Input 
                placeholder="Nhập mã đơn hàng..." 
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item name="status" label="Trạng thái">
              <Select 
                placeholder="Chọn trạng thái" 
                allowClear
                mode="multiple"
                maxTagCount="responsive"
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Tag color={option.color} style={{ margin: 0 }}>
                      {option.label}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item name="digitalSignature" label="Trạng thái ký số">
              <Select placeholder="Chọn trạng thái ký" allowClear>
                <Option value="signed">Đã ký số</Option>
                <Option value="unsigned">Chưa ký số</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item name="dateRange" label="Khoảng thời gian">
              <RangePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item name="quickFilter" label="Lọc nhanh">
              <Select placeholder="Chọn bộ lọc nhanh" allowClear>
                {quickFilterOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label=" " colon={false}>
              <Space size="middle" style={{ marginTop: '8px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />} 
                  loading={loading}
                  style={{ 
                    borderRadius: '6px',
                    padding: '0 20px',
                    height: '36px'
                  }}
                >
                  Tìm kiếm
                </Button>
                
                <Button 
                  onClick={handleReset} 
                  icon={<ReloadOutlined />}
                  style={{ 
                    borderRadius: '6px',
                    padding: '0 20px',
                    height: '36px'
                  }}
                >
                  Đặt lại
                </Button>
                
                {onExport && (
                  <Button 
                    icon={<ExportOutlined />}
                    style={{ 
                      borderRadius: '6px',
                      padding: '0 20px',
                      height: '36px'
                    }}
                    onClick={onExport}
                  >
                    Xuất Excel
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* Quick Filter Tags */}
        <Row>
          <Col span={24}>
            <Space size="small" wrap>
              <span style={{ color: '#666', fontSize: '14px' }}>Lọc nhanh:</span>
              {quickFilterOptions.map(option => (
                <Tag 
                  key={option.value}
                  color="blue"
                  style={{ 
                    cursor: 'pointer',
                    borderRadius: '16px',
                    padding: '2px 12px'
                  }}
                  onClick={() => form.setFieldValue('quickFilter', option.value)}
                >
                  {option.label}
                </Tag>
              ))}
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ContractFilters;