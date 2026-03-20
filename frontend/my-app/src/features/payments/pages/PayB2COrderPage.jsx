// Pay B2C Order Page (Dealer Staff)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { salesOrderB2CApi } from "../../dealer/sales/salesOrder/services/salesOrderService";
import paymentService from "../services/paymentService";
import PaymentForm from "../components/PaymentForm";
import PaymentHistory from "../components/PaymentHistory";
import VNPayPaymentForm from "../components/VNPayPaymentForm";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const PayB2COrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState("other"); // 'vnpay' or 'other'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
  const API_VNPAY_GATEWAY_URL = `${API_BASE_URL}/payments/api/v1/payments/gateway`;

  // useEffect(() => {
  //   const query = new URLSearchParams(window.location.search);
  //   const responseCode = query.get("vnp_ResponseCode");
  //   const txnRef = query.get("vnp_TxnRef");
  //
  //   if (responseCode && txnRef) {
  //     checkPaymentReturn();
  //   }
  // }, []);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadPaymentMethods();
      loadPaymentHistory();
    }
  }, [orderId]);

  // const checkPaymentReturn = async () => {
  //   try {
  //     const response = await fetch(
  //       `${API_BASE_URL}/payment/return?${window.location.search}`
  //     );
  //     const data = await response.json();
  //
  //     if (data.success) {
  //       toast.success(
  //         `Thanh toán thành công: ${formatCurrency(data.amount)} cho đơn ${
  //           data.orderId
  //         }`
  //       );
  //     } else {
  //       toast.error(`Thanh toán thất bại cho đơn ${data.orderId}`);
  //     }
  //     loadPaymentHistory();
  //     loadOrder();
  //   } catch (error) {
  //     toast.error("Không thể xác nhận thanh toán");
  //   }
  // };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await salesOrderB2CApi.getById(orderId);
      const data = response.data?.data || response.data;
      setOrder(data);
    } catch (error) {
      toast.error("Không thể tải thông tin đơn hàng");
      navigate("/dealer/staff/payments/b2c-orders");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getActivePaymentMethods();
      setPaymentMethods(response.data.data || response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách phương thức thanh toán");
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory(orderId);
      setPaymentHistory(response.data.data || response.data || []);
    } catch (error) {}
  };

  const handlePayment = async (paymentData) => {
    try {
      setSubmitting(true);
      const response = await paymentService.initiatePayment(
        orderId,
        paymentData
      );
      const data = response.data.data || response.data;

      const selectedMethod = paymentMethods.find(
        (m) => m.methodId === paymentData.paymentMethodId
      );
      const isCash = selectedMethod?.methodType === "MANUAL";

      if (data.status === "PENDING_GATEWAY" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (isCash) {
        toast.success(
          "Yêu cầu thanh toán đã được gửi. Vui lòng chờ Dealer Manager duyệt."
        );
        setTimeout(() => navigate("/dealer/staff/payments/b2c-orders"), 2000);
      } else {
        toast.success(data.message || "Thanh toán đã được khởi tạo thành công");
        setTimeout(() => navigate("/dealer/staff/payments/b2c-orders"), 2000);
      }

      loadPaymentHistory();
      loadOrder();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể khởi tạo thanh toán"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVNPayPayment = async (amount) => {
    // 1. Kiểm tra thông tin đơn hàng và khách hàng
    if (!order || !order.orderId) {
      toast.error("Không thể tải thông tin đơn hàng.");
      return;
    }

    // Giả sử order.customerId. Bạn cần kiểm tra lại cấu trúc state 'order'
    // Nó có thể là 'order.customerId' hoặc 'order.customer.id'
    const customerId = order.customerId; // <-- KIỂM TRA LẠI TRƯỜNG NÀY

    if (!customerId) {
      toast.error("Không thể tìm thấy ID khách hàng trong đơn hàng.");
      return;
    }

    try {
      setSubmitting(true); // Kích hoạt loading
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Chưa có token, vui lòng đăng nhập");

      // 2. Định nghĩa URL trả về cho frontend
      // (Đây là URL mà VNPAY sẽ redirect về sau khi thanh toán)
      const returnUrl = `${window.location.origin}/payment/result`;

      // 3. Tạo body cho request, khớp với VnpayInitiateRequest.java
      const initiationData = {
        orderId: order.orderId,
        customerId: customerId,
        totalAmount: order.totalAmount, // Tổng giá trị đơn hàng
        paymentAmount: amount, // Số tiền thanh toán
        returnUrl: returnUrl,
      };

      // 4. Gọi endpoint MỚI bằng phương thức POST
      const response = await fetch(
        `${API_VNPAY_GATEWAY_URL}/initiate-b2c`, // ĐÃ THAY ĐỔI
        {
          method: "POST", // ĐÃ THAY ĐỔI
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ĐÃ THAY ĐỔI
          },
          body: JSON.stringify(initiationData), // ĐÃ THAY ĐỔI
        }
      );

      if (!response.ok) {
        // Nếu là lỗi 401, báo cụ thể
        if (response.status === 401) {
          throw new Error(
            "Lỗi 401: Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại."
          );
        }

        // Nếu là lỗi khác, thử đọc JSON
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Backend trả lỗi ${response.status}`
          );
        } catch {
          throw new Error(
            `Backend trả lỗi ${response.status} (phản hồi không phải JSON).`
          );
        }
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Chuyển sang VNPAY
      } else {
        throw new Error("Backend chưa trả về payment URL");
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo thanh toán");
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateRemainingAmount = () => {
    const totalPaid = paymentHistory
      .filter((t) => t.status === "SUCCESS" || t.status === "CONFIRMED")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return (parseFloat(order?.totalAmount) || 0) - totalPaid;
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

  const remainingAmount = calculateRemainingAmount();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate("/dealer/staff/payments/b2c-orders")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Quay lại
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Thanh Toán Đơn Hàng B2C
        </h1>
        <p className="text-gray-600 mt-2">Mã đơn hàng: {order.orderId}</p>

        {/* Payment Summary */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(order.totalAmount - remainingAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Còn lại</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      {remainingAmount > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chọn Phương Thức Thanh Toán
          </h2>

          {/* Method Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActivePaymentMethod("other")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                activePaymentMethod === "other"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
              }`}
            >
              <BanknotesIcon className="h-5 w-5" />
              Phương thức khác
            </button>
            <button
              onClick={() => setActivePaymentMethod("vnpay")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                activePaymentMethod === "vnpay"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
              }`}
            >
              <CreditCardIcon className="h-5 w-5" />
              Thanh toán VNPAY
            </button>
          </div>

          {/* Payment Forms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {activePaymentMethod === "vnpay" ? (
              <VNPayPaymentForm
                remainingAmount={remainingAmount}
                onSubmit={handleVNPayPayment}
                formatCurrency={formatCurrency}
              />
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông Tin Thanh Toán
                </h3>
                <PaymentForm
                  paymentMethods={paymentMethods}
                  onSubmit={handlePayment}
                  loading={submitting}
                />
                {paymentMethods.some((m) => m.methodType === "MANUAL") && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Thanh toán tiền mặt cần được
                      Dealer Manager duyệt. Công nợ và lịch sử thanh toán sẽ
                      được cập nhật sau khi được duyệt.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Lịch Sử Thanh Toán
        </h2>
        <PaymentHistory history={paymentHistory} />
      </div>
    </div>
  );
};

export default PayB2COrderPage;
