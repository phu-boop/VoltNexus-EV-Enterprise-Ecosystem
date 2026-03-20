// B2C Order Detail Page (Dealer Staff)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { salesOrderB2CApi } from "../../dealer/sales/salesOrder/services/salesOrderService";
import paymentService from "../services/paymentService";
import PaymentHistory from "../components/PaymentHistory";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const B2COrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadPaymentHistory();
    }
  }, [orderId]);

  // Recalculate payment status when both order and payment history are loaded
  useEffect(() => {
    if (order && paymentHistory) {
      updatePaymentStatusFromHistory();
    }
  }, [order, paymentHistory]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await salesOrderB2CApi.getById(orderId);
      const data = response.data?.data || response.data;
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      if (error.response?.status === 404) {
        toast.error(
          "Không tìm thấy đơn hàng B2C với ID này. Có thể đơn hàng đã bị xóa hoặc không tồn tại."
        );
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
      }
      // Navigate back based on user role or previous page
      const userRole = sessionStorage.getItem("role");
      if (userRole === "DEALER_MANAGER") {
        navigate("/dealer/manager/payments/b2c-cash-payments");
      } else {
        navigate("/dealer/staff/payments/b2c-orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory(orderId);
      const history = response.data?.data || response.data || [];
      setPaymentHistory(history);
    } catch (error) {
      console.error("Error loading payment history:", error);
    }
  };

  const updatePaymentStatusFromHistory = () => {
    if (!order) {
      return;
    }

    if (!paymentHistory || paymentHistory.length === 0) {
      setPaymentStatus("UNPAID");
      return;
    }

    const totalPaid = paymentHistory
      .filter((t) => t.status === "SUCCESS" || t.status === "CONFIRMED")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totalAmount = parseFloat(order.totalAmount) || 0;

    // Use Math.abs to handle floating point precision issues
    // Consider paid if difference is less than 1 VND (0.01)
    const difference = Math.abs(totalAmount - totalPaid);

    if (totalAmount <= 0) {
      setPaymentStatus("UNPAID");
    } else if (difference < 0.01 || totalPaid >= totalAmount) {
      // Fully paid (with tolerance for floating point errors)
      // Only if totalPaid is greater than or equal to totalAmount (with small tolerance)
      setPaymentStatus("PAID");
    } else if (totalPaid > 0) {
      // Partially paid - totalPaid > 0 but < totalAmount
      setPaymentStatus("PARTIALLY_PAID");
    } else {
      setPaymentStatus("UNPAID");
    }
  };

  const handlePayOrder = () => {
    navigate(`/dealer/staff/payments/b2c-orders/${orderId}/pay`);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      UNPAID: { color: "bg-red-100 text-red-800", label: "Chưa thanh toán" },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Thanh toán một phần",
      },
      PAID: { color: "bg-green-100 text-green-800", label: "Đã thanh toán" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const totalPaid = paymentHistory
    .filter((t) => t.status === "SUCCESS" || t.status === "CONFIRMED")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const remainingAmount = (parseFloat(order.totalAmount) || 0) - totalPaid;

  // Determine back navigation based on user role
  const userRole = sessionStorage.getItem("role");
  const getBackPath = () => {
    if (userRole === "DEALER_MANAGER") {
      return "/dealer/manager/payments/b2c-cash-payments";
    }
    return "/dealer/staff/payments/b2c-orders";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(getBackPath())}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Quay lại
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chi Tiết Đơn Hàng B2C
          </h1>
          <p className="text-gray-600 mt-1">Mã đơn hàng: {order.orderId}</p>
        </div>
        {getPaymentStatusBadge(paymentStatus)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông Tin Đơn Hàng
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                <p className="text-lg font-medium text-gray-900">
                  {format(new Date(order.orderDate), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                <p className="text-lg font-medium text-gray-900">
                  {order.orderStatusB2C || order.orderStatus || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã thanh toán</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Còn lại</p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(remainingAmount)}
                </p>
              </div>
              {order.deliveryDate && (
                <div>
                  <p className="text-sm text-gray-600">Ngày giao hàng</p>
                  <p className="text-lg font-medium text-gray-900">
                    {format(new Date(order.deliveryDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
              )}
            </div>

            {order.orderItems && order.orderItems.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Sản phẩm
                </p>
                <div className="space-y-2">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.variantName || item.productName || "Sản phẩm"}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(item.price)} x {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Tiến độ thanh toán</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(totalPaid / (order.totalAmount || 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {((totalPaid / (order.totalAmount || 1)) * 100).toFixed(1)}% đã
                thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Lịch Sử Thanh Toán
            </h2>
            {(paymentStatus === "UNPAID" ||
              paymentStatus === "PARTIALLY_PAID") && (
              <button
                onClick={handlePayOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Thanh Toán
              </button>
            )}
          </div>
          <PaymentHistory history={paymentHistory} />
        </div>
      </div>
    </div>
  );
};

export default B2COrderDetailPage;
