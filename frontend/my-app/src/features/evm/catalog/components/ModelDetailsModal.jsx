import React from 'react';
import { Drawer, Descriptions, Tag, Typography, Table, Image, Space, Badge } from 'antd';
import { CarOutlined, SettingOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_COLORS = {
  COMING_SOON: "orange",
  IN_PRODUCTION: "green",
  DISCONTINUED: "red",
};

const STATUS_LABELS = {
  COMING_SOON: "Sắp ra mắt",
  IN_PRODUCTION: "Đang sản xuất",
  DISCONTINUED: "Ngừng sản xuất",
};

const ModelDetailsModal = ({ isOpen, onClose, model }) => {
  if (!model) return null;

  const variantColumns = [
    {
      title: 'Tên Phiên Bản',
      dataIndex: 'versionName',
      key: 'versionName',
      render: (text) => <Text strong className="text-blue-800">{text}</Text>,
    },
    {
      title: 'Màu Sắc',
      dataIndex: 'color',
      key: 'color',
      render: (color) => <Tag color="blue" className="rounded-full shadow-sm">{color}</Tag>,
    },
    {
      title: 'Mã SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      render: (sku) => <Text code className="bg-gray-100 text-gray-700">{sku}</Text>,
    },
    {
      title: 'Giá Bán (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text className="text-red-600 font-bold">{Number(price).toLocaleString("vi-VN")} đ</Text>,
    },
  ];

  return (
    <Drawer
      title={<Space><CarOutlined className="text-blue-600 text-xl" /><span className="text-xl font-extrabold text-gray-900 tracking-tight">Chi tiết Mẫu Xe</span></Space>}
      width={800}
      placement="right"
      onClose={onClose}
      open={isOpen}
      styles={{ body: { paddingBottom: 80, backgroundColor: '#fcfcfc' }, header: { borderBottom: '1px solid #f0f0f0', backgroundColor: '#ffffff' } }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in-0 duration-300">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {model.thumbnailUrl ? (
            <div className="w-full md:w-5/12 flex-shrink-0 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex items-center justify-center">
              <Image
                src={model.thumbnailUrl}
                alt={model.modelName}
                className="rounded-xl object-contain mix-blend-multiply"
                style={{ maxHeight: '200px' }}
              />
            </div>
          ) : (
            <div className="w-full md:w-5/12 aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
              <Text type="secondary" className="font-medium">Chưa có hình ảnh</Text>
            </div>
          )}

          <div className="w-full md:w-7/12">
            <div className="mb-6 flex flex-col items-start justify-between">
              <div className="flex items-center justify-between w-full mb-2">
                <Text className="text-blue-600 tracking-widest text-xs font-bold uppercase">{model.brand}</Text>
                <Tag color={STATUS_COLORS[model.status] || 'default'} className="m-0 px-3 py-1 text-xs font-bold rounded-full border-none shadow-sm uppercase tracking-wide">
                  {STATUS_LABELS[model.status] || model.status}
                </Tag>
              </div>
              <Title level={2} className="mt-0 mb-1 text-gray-900 font-extrabold">{model.modelName}</Title>
              <Text type="secondary" className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-md mt-1">ID: {model.modelId}</Text>
            </div>

            <Descriptions column={1} size="small" className="mt-4">
              <Descriptions.Item label={<Text className="text-gray-500 font-medium">Chi tiết mẫu xe</Text>}>
                Cấu hình hệ thống mặc định cho xe EVM.
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-bottom-4 duration-500">
        <Title level={5} className="mb-5 flex items-center text-gray-800 font-bold">
          <SettingOutlined className="mr-2 text-green-500" /> Thông số kỹ thuật cơ bản
        </Title>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ backgroundColor: '#fafafa', fontWeight: 600, color: '#4b5563' }} contentStyle={{ backgroundColor: '#ffffff', color: '#111827' }} className="rounded-xl overflow-hidden shadow-sm">
          <Descriptions.Item label="Quãng đường">
            {model.baseRangeKm ? <Text strong>{model.baseRangeKm} km</Text> : <Text type="secondary">N/A</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Công suất">
            {model.baseMotorPower ? <Text strong>{model.baseMotorPower} kW</Text> : <Text type="secondary">N/A</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng Pin">
            {model.baseBatteryCapacity ? <Text strong>{model.baseBatteryCapacity} kWh</Text> : <Text type="secondary">N/A</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian sạc">
            {model.baseChargingTime ? <Text strong>{model.baseChargingTime} giờ</Text> : <Text type="secondary">N/A</Text>}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {model.extendedSpecs && Object.keys(model.extendedSpecs).length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-bottom-6 duration-500">
          <Title level={5} className="mb-5 flex items-center text-gray-800 font-bold">
            <AppstoreOutlined className="mr-2 text-indigo-500" /> Thông số kỹ thuật mở rộng
          </Title>
          <Descriptions bordered column={1} size="small" labelStyle={{ backgroundColor: '#fafafa', fontWeight: 600, width: '40%', color: '#4b5563' }} contentStyle={{ backgroundColor: '#ffffff', color: '#111827' }} className="rounded-xl overflow-hidden shadow-sm">
            {Object.entries(model.extendedSpecs).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">
        <Title level={5} className="mb-5 flex items-center text-gray-800 font-bold">
          <Badge status="processing" className="mr-2" /> Các Phiên Bản (Variants)
        </Title>
        {model.variants && model.variants.length > 0 ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <Table
              columns={variantColumns}
              dataSource={model.variants}
              rowKey="variantId"
              pagination={false}
              size="middle"
              className="m-0"
            />
          </div>
        ) : (
          <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Text type="secondary" className="text-base">Chưa có phiên bản nào cho mẫu xe này.</Text>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ModelDetailsModal;
