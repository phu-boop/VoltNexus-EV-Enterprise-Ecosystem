import { useState, useEffect } from "react";
import { salesOrderService } from "../services/salesOrderService";
import { showSuccess, showError } from "../../../../../utils/notification";

export const useSalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 Lấy danh sách đơn hàng
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesOrderService.getList(params); // getList() đã return response.data.data
      setOrders(data.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
      showError("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Tạo đơn hàng mới
  const createOrder = async (quotationId, orderData) => {
    try {
      const data = await salesOrderService.createOrder(quotationId, orderData); // đã return response.data.data
      showSuccess("Tạo đơn hàng thành công");
      await fetchOrders(); // Refresh list sau khi tạo
      return data;
    } catch (err) {
      console.error("Create order error:", err);
      showError("Lỗi khi tạo đơn hàng");
      throw err;
    }
  };

  // 🟢 Cập nhật trạng thái đơn hàng
  const updateStatus = async (orderId, status, reason = "") => {
    try {
      const data = await salesOrderService.updateOrderStatus(
        orderId,
        status,
        reason
      ); // đã return response.data.data
      showSuccess("Cập nhật trạng thái thành công");
      await fetchOrders(); // Refresh list
      return data;
    } catch (err) {
      console.error("Update status error:", err);
      showError("Lỗi khi cập nhật trạng thái");
      throw err;
    }
  };

  // 🟢 Duyệt đơn hàng
  const approveOrder = async (orderId, managerId) => {
    try {
      const response = await salesOrderService.approve(orderId, managerId);
      const data = response.data?.data || null;
      showSuccess("Duyệt đơn hàng thành công");
      await fetchOrders();
      return data;
    } catch (err) {
      console.error("Approve order error:", err);
      showError("Lỗi khi duyệt đơn hàng");
      throw err;
    }
  };

  // 🟢 Recalculate / Add order items tự động
  const recalcOrderItems = async (orderId) => {
    try {
      const response = await salesOrderService.recalcOrderItems(orderId);
      const data = response.data?.data || null;
      showSuccess("Tính toán lại order items thành công");
      await fetchOrders(); // Refresh list
      return data;
    } catch (err) {
      console.error("Recalculate order items error:", err);
      showError("Lỗi khi tính toán lại order items");
      throw err;
    }
  };

  // 🟢 Chuyển trạng thái sang EDITED
  const markOrderAsEdited = async (orderId, staffId) => {
    try {
      const data = await salesOrderService.markOrderAsEdited(orderId, staffId);
      showSuccess("Đơn hàng đã được chuyển sang trạng thái EDITED");
      await fetchOrders(); // Refresh list
      return data;
    } catch (err) {
      console.error("Mark order as EDITED error:", err);
      showError("Lỗi khi chuyển trạng thái sang EDITED");
      throw err;
    }
  };

  // Thêm hàm gửi duyệt đơn
  const sendOrderForApproval = async (orderId, dealerId) => {
    try {
      const response = await salesOrderService.sendForApproval(
        orderId,
        dealerId
      );
      const data = response.data?.data || null;
      showSuccess("Đơn hàng đã được gửi quản lý duyệt");
      await fetchOrders();
      return data;
    } catch (err) {
      console.error("Send order for approval error:", err);
      showError("Lỗi khi gửi quản lý duyệt");
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateStatus,
    approveOrder,
    recalcOrderItems,
    markOrderAsEdited,
    sendOrderForApproval,
  };
};
