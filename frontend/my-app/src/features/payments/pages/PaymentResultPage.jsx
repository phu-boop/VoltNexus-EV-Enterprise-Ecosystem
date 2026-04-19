// src/pages/payment/PaymentResultPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
// import apiConstPaymentService from "../../../services/apiConstPaymentService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VNPAY_GATEWAY_URL = `${API_BASE_URL}/payments/api/v1/payments/gateway`;

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        const response = await fetch(
          `${API_VNPAY_GATEWAY_URL}/callback/vnpay-return?${searchParams.toString()}`
        );

        // Kiểm tra nếu response không OK
        if (!response.ok) {
          // Nếu là lỗi 401, endpoint vẫn cần xác thực
          if (response.status === 401) {
            throw new Error("Không thể xác thực. Vui lòng đăng nhập lại.");
          }

          // Thử đọc thông báo lỗi từ response
          try {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `Lỗi server: ${response.status}`
            );
          } catch {
            // Nếu không parse được JSON, dùng message mặc định (ĐÃ SỬA: bỏ biến jsonError)
            throw new Error(
              `Lỗi server: ${response.status} - ${response.statusText}`
            );
          }
        }

        // Parse response JSON
        const data = await response.json();

        // Backend (VnpayGatewayController) đã trả về { success, message, ... }
        setPaymentResult(data);
      } catch (error) {
        console.error("Error checking payment result:", error);

        // Fallback: tự xác định kết quả từ URL parameters nếu không gọi được API
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");
        const vnpAmount = searchParams.get("vnp_Amount");

        const isSuccess =
          vnpResponseCode === "00" && vnpTransactionStatus === "00";
        const amount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;

        setPaymentResult({
          success: isSuccess,
          message: isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại",
          amount: amount,
          transactionId: searchParams.get("vnp_TxnRef") || "",
          responseCode: vnpResponseCode || "",
          transactionStatus: vnpTransactionStatus || "",
        });
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.toString()) {
      checkPaymentResult();
    }
  }, [searchParams]);

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác nhận kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentResult?.success;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <Link
          to="/dealer/staff/payments/b2c-orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại danh sách đơn hàng
        </Link>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-8 text-center ${
              isSuccess ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex justify-center mb-4">
              {isSuccess ? (
                <CheckCircleIcon className="h-20 w-20 text-green-500" />
              ) : (
                <XCircleIcon className="h-20 w-20 text-red-500" />
              )}
            </div>

            <h1
              className={`text-3xl font-bold mb-2 ${
                isSuccess ? "text-green-800" : "text-red-800"
              }`}
            >
              {isSuccess ? "Thanh Toán Thành Công" : "Thanh Toán Thất Bại"}
            </h1>
            <p
              className={`text-lg ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {paymentResult?.message}
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Chi Tiết Giao Dịch
            </h2>

            <div className="space-y-4">
              {paymentResult?.amount && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(paymentResult.amount)}
                  </span>
                </div>
              )}

              {searchParams.get("vnp_TransactionNo") && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium text-gray-900">
                    {searchParams.get("vnp_TransactionNo")}
                  </span>
                </div>
              )}

              {searchParams.get("vnp_TxnRef") && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium text-gray-900">
                    {searchParams.get("vnp_TxnRef")}
                  </span>
                </div>
              )}

              {searchParams.get("vnp_PayDate") && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium text-gray-900">
                    {formatVNPayDate(searchParams.get("vnp_PayDate"))}
                  </span>
                </div>
              )}

              {searchParams.get("vnp_BankCode") && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium text-gray-900">
                    {getBankName(searchParams.get("vnp_BankCode"))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dealer/staff/payments/b2c-orders"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Danh sách đơn hàng
              </Link>

              {isSuccess ? (
                <Link
                  to="/dealer/staff/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
                >
                  Về trang chủ
                </Link>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  Thử lại thanh toán
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Thông tin hỗ trợ</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • Nếu có thắc mắc về giao dịch, vui lòng liên hệ bộ phận hỗ trợ
            </p>
            <p>• Hotline: 1900 1234</p>
            <p>• Email: support@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format VNPay date
const formatVNPayDate = (payDate) => {
  if (!payDate) return "";
  // Format: yyyyMMddHHmmss
  const year = payDate.substring(0, 4);
  const month = payDate.substring(4, 6);
  const day = payDate.substring(6, 8);
  const hour = payDate.substring(8, 10);
  const minute = payDate.substring(10, 12);
  const second = payDate.substring(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

// Helper function to get bank name
const getBankName = (bankCode) => {
  const bankNames = {
    VNBANK: "Ngân hàng Việt Nam",
    INTCARD: "Thẻ quốc tế",
    VNPAYQR: "VNPAY QR",
    MBAPP: "MB Bank",
    VCB: "Vietcombank",
    BIDV: "BIDV",
    AGRIBANK: "Agribank",
    TCB: "Techcombank",
    VPBANK: "VPBank",
    // Thêm các ngân hàng khác nếu cần
  };

  return bankNames[bankCode] || bankCode;
};

export default PaymentResultPage;
