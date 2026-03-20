import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import apiPublic from "../services/apiPublic";
import Button from "../components/ui/Button";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const amount = parseFloat(searchParams.get("amount")) || 0;

  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!orderId || amount <= 0) {
      toast.error("Thông tin đơn hàng không hợp lệ");
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "VNPAY") {
        // Call VNPay gateway
        const response = await apiPublic.post(
          "/payments/api/v1/vnpay/initiate-b2c",
          {
            orderId: orderId,
            amount: amount,
            orderDescription: `Thanh toán đơn hàng ${orderId}`,
            returnUrl: `${window.location.origin}/payment/callback?orderId=${orderId}`,
          }
        );

        if (response.data?.url) {
          // Redirect to VNPay
          window.location.href = response.data.url;
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      } else if (paymentMethod === "BANK_TRANSFER") {
        // Create manual payment request
        const response = await apiPublic.post(
          `/payments/api/v1/payments/customer/orders/${orderId}/pay`,
          {
            amount: amount,
            paymentMethodId: 2, // Bank Transfer
            notes: "Chuyển khoản ngân hàng",
          }
        );

        toast.success(
          "Đã tạo yêu cầu thanh toán. Vui lòng chuyển khoản theo thông tin được gửi."
        );
        navigate(`/orders/${orderId}`);
      } else {
        toast.error("Phương thức thanh toán chưa được hỗ trợ");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thanh toán"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Check payment status if returning from callback
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setPaymentStatus("success");
    } else if (status === "cancel") {
      setPaymentStatus("cancel");
    }
  }, [searchParams]);

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thanh Toán Thành Công!</h1>
          <p className="text-gray-600 mb-6">
            Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý
            đơn hàng sớm nhất.
          </p>
          <Button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Xem Đơn Hàng
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "cancel") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thanh Toán Đã Hủy</h1>
          <p className="text-gray-600 mb-6">
            Bạn đã hủy thanh toán. Bạn có thể thanh toán lại sau.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(`/orders/${orderId}`)}
              variant="outline"
              className="flex-1"
            >
              Xem Đơn Hàng
            </Button>
            <Button
              onClick={() => setPaymentStatus(null)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thanh Toán Lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Thanh Toán Đơn Hàng
          </h1>
          <p className="text-gray-600 mb-8">Đơn hàng: {orderId}</p>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tóm Tắt Đơn Hàng</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold">{formatPrice(amount)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Thành tiền:</span>
                  <span className="text-blue-600">{formatPrice(amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Chọn Phương Thức Thanh Toán
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("VNPAY")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === "VNPAY"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">VNPay</div>
                    <div className="text-sm text-gray-600">
                      Thanh toán qua VNPay (Thẻ ATM, Visa, Mastercard)
                    </div>
                  </div>
                  {paymentMethod === "VNPAY" && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Chuyển Khoản Ngân Hàng</div>
                    <div className="text-sm text-gray-600">
                      Chuyển khoản trực tiếp vào tài khoản
                    </div>
                  </div>
                  {paymentMethod === "BANK_TRANSFER" && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">Bảo Mật Thanh Toán</div>
              <div>
                Thông tin thanh toán của bạn được mã hóa và bảo mật. Chúng tôi
                không lưu trữ thông tin thẻ của bạn.
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !orderId || amount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 inline mr-2" />
                Thanh Toán {formatPrice(amount)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
