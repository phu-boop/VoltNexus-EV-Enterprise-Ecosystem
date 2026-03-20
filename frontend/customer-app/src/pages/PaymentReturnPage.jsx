import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse VNPay return parameters
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");
    const vnpTxnRef = searchParams.get("vnp_TxnRef");
    const vnpAmount = searchParams.get("vnp_Amount");
    const vnpBankCode = searchParams.get("vnp_BankCode");
    const vnpTransactionNo = searchParams.get("vnp_TransactionNo");

    // Check if payment was successful
    const isSuccess = vnpResponseCode === "00" && vnpTransactionStatus === "00";

    // Convert amount from VNPay format (divided by 100)
    const amount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;

    setPaymentResult({
      success: isSuccess,
      responseCode: vnpResponseCode,
      transactionStatus: vnpTransactionStatus,
      transactionId: vnpTxnRef,
      transactionNo: vnpTransactionNo,
      amount: amount,
      bankCode: vnpBankCode,
    });

    setLoading(false);

    // Show toast notification
    if (isSuccess) {
      toast.success("Thanh toán thành công!");
    } else {
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    }
  }, [searchParams]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const getResponseMessage = (code) => {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)"
    };
    return messages[code] || "Lỗi không xác định";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Result Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`py-8 px-6 text-center ${
              paymentResult?.success 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              {paymentResult?.success ? (
                <div>
                  <svg
                    className="mx-auto h-24 w-24 text-white mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Thanh toán thành công!
                  </h1>
                  <p className="text-green-100">
                    Giao dịch của bạn đã được xử lý thành công
                  </p>
                </div>
              ) : (
                <div>
                  <svg
                    className="mx-auto h-24 w-24 text-white mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Thanh toán thất bại
                  </h1>
                  <p className="text-red-100">
                    Giao dịch không thành công, vui lòng thử lại
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết giao dịch</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {paymentResult?.transactionId || 'N/A'}
                  </span>
                </div>
                
                {paymentResult?.transactionNo && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Mã giao dịch VNPay:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {paymentResult.transactionNo}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(paymentResult?.amount)}
                  </span>
                </div>

                {paymentResult?.bankCode && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentResult.bankCode}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-semibold ${
                    paymentResult?.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {paymentResult?.success ? 'Thành công' : 'Thất bại'}
                  </span>
                </div>

                {!paymentResult?.success && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Lý do:</strong> {getResponseMessage(paymentResult?.responseCode)}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {paymentResult?.success ? (
                  <>
                    <button
                      onClick={() => navigate('/orders')}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Xem đơn hàng
                    </button>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/cart')}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Quay lại giỏ hàng
                    </button>
                    <button
                      onClick={() => navigate('/checkout')}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Thử lại thanh toán
                    </button>
                  </>
                )}
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📞 Hotline: 1900-xxxx (24/7)</p>
                  <p>📧 Email: support@vms.vn</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Nếu bạn có bất kỳ thắc mắc nào về giao dịch, vui lòng liên hệ với chúng tôi và cung cấp mã giao dịch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
