import { useState, useEffect } from "react";
import { orderItemService } from "../services/orderItemService";
import { showSuccess, showError } from "../../../../../utils/notification";

/**
 * Hook quản lý order items
 * @param {string} orderId - ID của order (optional)
 * @returns {Object} Các phương thức và state quản lý order items
 */
export const useOrderItems = (orderId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lấy danh sách order items theo order ID
   */
  const fetchItems = async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await orderItemService.getByOrderId(orderId);
      setItems(response.data?.data || []);
    } catch (err) {
      setError(err.message);
      showError("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo mới order item
   * @param {Object} itemData - Dữ liệu order item
   * @returns {Object} Order item đã tạo
   */
  const createItem = async (itemData) => {
    try {
      const response = await orderItemService.create(itemData);
      showSuccess("Thêm sản phẩm thành công");
      await fetchItems();
      return response.data?.data;
    } catch (err) {
      showError(err.response.data.message);
      throw err;
    }
  };

  /**
   * Cập nhật order item
   * @param {string} itemId - ID của order item
   * @param {Object} itemData - Dữ liệu cập nhật
   * @returns {Object} Order item đã cập nhật
   */
  const updateItem = async (itemId, itemData) => {
    try {
      const response = await orderItemService.update(itemId, itemData);
      showSuccess("Cập nhật sản phẩm thành công");
      await fetchItems();
      return response.data?.data;
    } catch (err) {
      showError("Lỗi khi cập nhật sản phẩm");
      throw err;
    }
  };

  /**
   * Xóa order item
   * @param {string} itemId - ID của order item cần xóa
   */
  const deleteItem = async (itemId) => {
    try {
      await orderItemService.delete(itemId);
      showSuccess("Xóa sản phẩm thành công");
      await fetchItems();
    } catch (err) {
      showError("Lỗi khi xóa sản phẩm");
      throw err;
    }
  };

  /**
   * Cập nhật nhiều order items cùng lúc
   * @param {Array} updatedItems - Danh sách order items cần cập nhật
   * @returns {Array} Danh sách order items đã cập nhật
   */
  const updateBulk = async (updatedItems) => {
    try {
      const response = await orderItemService.updateBulk(orderId, updatedItems);
      showSuccess("Cập nhật danh sách sản phẩm thành công");
      await fetchItems();
      return response.data?.data;
    } catch (err) {
      showError("Lỗi khi cập nhật danh sách sản phẩm");
      throw err;
    }
  };

  /**
   * Validate danh sách order items
   * @param {Array} itemsToValidate - Danh sách order items cần validate
   * @returns {Object} Kết quả validate
   */
  const validateItems = async (itemsToValidate) => {
    try {
      const response = await orderItemService.validate(itemsToValidate);
      return response.data?.data;
    } catch (err) {
      showError("Lỗi khi kiểm tra sản phẩm");
      throw err;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchItems();
    }
  }, [orderId]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateBulk,
    validateItems,
  };
};
