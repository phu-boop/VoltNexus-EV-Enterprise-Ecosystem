import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  InputNumber,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";

const OrderItemList = ({ items, onUpdate, onDelete, editable = false }) => {
  const [editingKey, setEditingKey] = useState("");
  const [editingData, setEditingData] = useState({});

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    setEditingKey(record.id);
    setEditingData({ ...record });
  };

  const cancel = () => {
    setEditingKey("");
    setEditingData({});
  };

  const save = async (id) => {
    try {
      await onUpdate(id, editingData);
      setEditingKey("");
      setEditingData({});
      message.success("Cập nhật thành công");
    } catch (error) {
      message.error("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      message.success("Xóa thành công");
    } catch (error) {
      message.error("Lỗi khi xóa");
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          {record.variant && (
            <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
              Phiên bản: {record.variant}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            min={1}
            value={editingData.quantity}
            onChange={(value) =>
              setEditingData((prev) => ({ ...prev, quantity: value }))
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            min={0}
            formatter={(value) =>
              `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
            value={editingData.unitPrice}
            onChange={(value) =>
              setEditingData((prev) => ({ ...prev, unitPrice: value }))
            }
          />
        ) : (
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(text)
        );
      },
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 120,
      render: (_, record) => {
        const quantity = isEditing(record)
          ? editingData.quantity
          : record.quantity;
        const unitPrice = isEditing(record)
          ? editingData.unitPrice
          : record.unitPrice;
        const total = quantity * unitPrice;

        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(total);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag
          color={
            status === "AVAILABLE"
              ? "green"
              : status === "OUT_OF_STOCK"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (editable) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="link"
              icon={<SaveOutlined />}
              onClick={() => save(record.id)}
            />
            <Button type="link" onClick={cancel}>
              Hủy
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
            />
            <Popconfirm
              title="Bạn có chắc muốn xóa sản phẩm này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="id"
      pagination={false}
      scroll={{ x: 800 }}
    />
  );
};

export default OrderItemList;
