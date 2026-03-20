import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VNPAY_GATEWAY_URL = `${API_BASE_URL}/payments/api/v1/payments/gateway`;

const DealerPaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        if (!searchParams.toString()) {
          throw new Error("Thiếu thông tin thanh toán từ VNPAY");
        }

        const response = await fetch(
          `${API_VNPAY_GATEWAY_URL}/callback/vnpay-return?${searchParams.toString()}`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }

          try {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `Lỗi server: ${response.status}`
            );
          } catch {
            throw new Error(
              `Lỗi server: ${response.status} - ${response.statusText}`
            );
          }
        }

        const data = await response.json();
        setPaymentResult(data);
      } catch (error) {
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");
        const vnpAmount = searchParams.get("vnp_Amount");

        const isSuccess =
          vnpResponseCode === "00" && vnpTransactionStatus === "00";
        const amount = vnpAmount ? parseInt(vnpAmount, 10) / 100 : 0;

        setPaymentResult({
          success: isSuccess,
          message:
            error.message ||
            (isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"),
          amount,
          transactionId: searchParams.get("vnp_TxnRef") || "",
          invoiceId: extractInvoiceIdFromOrderInfo(searchParams.get("vnp_OrderInfo") || ""),
          responseCode: vnpResponseCode || "",
          transactionStatus: vnpTransactionStatus || "",
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentResult();
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
  // Extract invoiceId from backend response, or from vnp_OrderInfo as fallback
  const invoiceId =
    paymentResult?.invoiceId ||
    extractInvoiceIdFromOrderInfo(searchParams.get("vnp_OrderInfo") || "") ||
    "";
  const invoicesListPath = "/dealer/manager/payments/invoices";
  const invoiceDetailPath = invoiceId
    ? `${invoicesListPath}/${invoiceId}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          to={invoicesListPath}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại danh sách hóa đơn
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              {isSuccess
                ? "Thanh toán hóa đơn thành công"
                : "Thanh toán hóa đơn thất bại"}
            </h1>
            <p
              className={`text-lg ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {paymentResult?.message ||
                (isSuccess
                  ? "Giao dịch đã được ghi nhận."
                  : "Giao dịch bị từ chối.")}
            </p>
          </div>

          <div className="p-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Chi tiết giao dịch
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
                  <span className="text-gray-600">Mã giao dịch VNPAY:</span>
                  <span className="font-medium text-gray-900">
                    {searchParams.get("vnp_TransactionNo")}
                  </span>
                </div>
              )}

              {invoiceId && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Mã hóa đơn:</span>
                  <span className="font-medium text-gray-900">{invoiceId}</span>
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

          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={invoicesListPath}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Danh sách hóa đơn
              </Link>

              {isSuccess && invoiceDetailPath ? (
                <Link
                  to={invoiceDetailPath}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
                >
                  Xem chi tiết hóa đơn
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

        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Thông tin hỗ trợ</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • Nếu có thắc mắc về giao dịch, vui lòng liên hệ bộ phận kế toán
              EVM.
            </p>
            <p>• Hotline: 1900 1234</p>
            <p>• Email: finance@evm.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatVNPayDate = (payDate) => {
  if (!payDate) return "";
  const year = payDate.substring(0, 4);
  const month = payDate.substring(4, 6);
  const day = payDate.substring(6, 8);
  const hour = payDate.substring(8, 10);
  const minute = payDate.substring(10, 12);
  const second = payDate.substring(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

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
  };

  return bankNames[bankCode] || bankCode;
};

// Helper function to extract invoiceId from vnp_OrderInfo
// Format: ThanhToanHoaDon_<invoiceId> or ThanhToanHoaDon<invoiceId> (sanitized)
const extractInvoiceIdFromOrderInfo = (orderInfo) => {
  if (!orderInfo) return "";
  // Try with underscore first, then without
  let id = orderInfo.replace("ThanhToanHoaDon_", "").replace("ThanhToanHoaDon", "");
  // Validate it looks like a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id : "";
};

export default DealerPaymentResultPage;
