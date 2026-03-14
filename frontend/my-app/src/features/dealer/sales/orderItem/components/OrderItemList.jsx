import React, { useState } from "react";
import { useOrderItems } from "../hooks/useOrderItems";
import OrderItemForm from "./OrderItemForm";
import OrderItemCard from "./OrderItemCard";

/**
 * Component hiển thị danh sách sản phẩm trong đơn hàng
 * @param {string} orderId - ID của order
 * @param {boolean} readOnly - Chế độ chỉ đọc (không cho phép chỉnh sửa)
 */
const OrderItemList = ({ orderId, readOnly = false }) => {
  const { items, loading, error, createItem, updateItem, deleteItem } =
    useOrderItems(orderId);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Xử lý thêm sản phẩm mới
  const handleAddItem = async (itemData) => {
    setFormLoading(true);
    try {
      await createItem({
        ...itemData,
        orderId: orderId,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Xử lý cập nhật sản phẩm
  const handleUpdateItem = async (itemData) => {
    setFormLoading(true);
    try {
      await updateItem(editingItem.orderItemId, itemData);
      setEditingItem(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi đơn hàng?")) {
      try {
        await deleteItem(itemId);
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Tính tổng giá trị đơn hàng
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.finalPrice || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 font-medium mb-2">
          Lỗi tải danh sách sản phẩm
        </div>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header với tổng tiền */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm đặt hàng
          </h3>
          <p className="text-sm text-gray-500">
            {items.length} sản phẩm - Tổng tiền:{" "}
            <span className="font-semibold text-green-600">
              {formatCurrency(calculateTotal())}
            </span>
          </p>
        </div>

        {!readOnly && (
          <div className='flex gap-5'>
          <button
            onClick={() => setShowForm(true)}
            disabled={formLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>+</span>
            Thêm sản phẩm
          </button>
            </div>
        )}
      </div>

      {/* Form thêm/sửa sản phẩm */}
      {(showForm || editingItem) && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-3">
            {editingItem ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h4>
          <OrderItemForm
            item={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={formLoading}
            orderId={orderId}
          />
        </div>
      )}

      {/* Danh sách sản phẩm */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-4xl mb-3">📦</div>
          <h4 className="text-gray-500 font-medium mb-1">
            Chưa có sản phẩm nào
          </h4>
          <p className="text-gray-400 text-sm">
            Thêm sản phẩm vào đơn hàng để bắt đầu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <OrderItemCard
              key={item.orderItemId}
              item={item}
              onEdit={!readOnly ? setEditingItem : null}
              onDelete={!readOnly ? handleDeleteItem : null}
              readOnly={readOnly}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderItemList;
