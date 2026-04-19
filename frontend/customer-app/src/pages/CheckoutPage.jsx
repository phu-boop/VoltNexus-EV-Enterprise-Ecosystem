import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getCartSummary, clearCart } from "../services/cartService";
import { createOrder } from "../services/orderService";
import { initiateVNPayPayment } from "../services/paymentService";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const customerId = user?.memberId;

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    district: "",
    ward: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("VNPAY");

  // Fetch cart summary
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      try {
        const response = await getCartSummary(customerId);
        return response.data;
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Không thể tải giỏ hàng");
        return null;
      }
    },
    enabled: !!customerId,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => createOrder(orderData),
    onSuccess: async (response) => {
      const orderId = response.data?.orderId;
      
      // If payment method is VNPay, initiate payment
      if (paymentMethod === "VNPAY" && orderId) {
        try {
          // Generate return URL (current origin + payment return path)
          const returnUrl = `${window.location.origin}/payment/return`;
          
          const paymentData = {
            orderId: orderId,
            customerId: customerId,
            totalAmount: cartData.estimatedTotal,
            paymentAmount: cartData.estimatedTotal,
            returnUrl: returnUrl,
          };

          const paymentResponse = await initiateVNPayPayment(paymentData);
          
          if (paymentResponse.data?.url) {
            // Clear cart before redirecting to payment
            await clearCart(customerId);
            queryClient.invalidateQueries(['cart', customerId]);
            
            // Redirect to VNPay payment page
            window.location.href = paymentResponse.data.url;
          } else {
            toast.error("Không thể khởi tạo thanh toán VNPay");
            navigate(`/orders/${orderId}`);
          }
        } catch (error) {
          console.error("Error initiating VNPay payment:", error);
          toast.error("Lỗi khi khởi tạo thanh toán. Vui lòng thử lại.");
          navigate(`/orders/${orderId}`);
        }
      } else {
        // Other payment methods (COD, Bank Transfer)
        toast.success("Đặt hàng thành công!");
        clearCart(customerId);
        queryClient.invalidateQueries(['cart', customerId]);
        navigate(`/orders/${orderId}`);
      }
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      // Backend endpoint chưa có - tạm thời mock flow
      toast.info("Chức năng đang được phát triển. Demo VNPay flow...");
      
      // Mock order ID for demo
      const mockOrderId = "mock-" + Date.now();
      
      if (paymentMethod === "VNPAY") {
        // Demo: Generate VNPay payment URL
        const returnUrl = `${window.location.origin}/payment/return`;
        
        initiateVNPayPayment({
          orderId: mockOrderId,
          customerId: customerId,
          totalAmount: cartData.estimatedTotal,
          paymentAmount: cartData.estimatedTotal,
          returnUrl: returnUrl,
        }).then(response => {
          if (response.data?.url) {
            clearCart(customerId);
            queryClient.invalidateQueries(['cart', customerId]);
            window.location.href = response.data.url;
          } else {
            toast.error("Không thể khởi tạo thanh toán");
            navigate('/orders');
          }
        }).catch(err => {
          console.error("VNPay initiation error:", err);
          toast.error("Lỗi thanh toán VNPay");
          clearCart(customerId);
          queryClient.invalidateQueries(['cart', customerId]);
          navigate('/orders');
        });
      } else {
        clearCart(customerId);
        queryClient.invalidateQueries(['cart', customerId]);
        navigate('/orders');
      }
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!cartData?.items || cartData.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const orderData = {
      customerId: customerId,
      shippingInfo: shippingInfo,
      paymentMethod: paymentMethod,
      items: cartData.items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: cartData.totalAmount,
      estimatedTax: cartData.estimatedTax,
      estimatedTotal: cartData.estimatedTotal,
    };

    createOrderMutation.mutate(orderData);
  };

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const items = cartData?.items || [];
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem xe điện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Thanh toán</h1>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Info & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={shippingInfo.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={shippingInfo.ward}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={shippingInfo.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">Thanh toán VNPay</div>
                    <div className="text-sm text-gray-600">Thanh toán qua cổng VNPay (ATM, Visa, MasterCard...)</div>
                  </div>
                  <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" className="h-8" />
                </label>
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận xe</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-gray-600">Chuyển khoản trực tiếp đến tài khoản công ty</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 pb-3 border-b">
                    <div className="flex-shrink-0">
                      {item.vehicleImageUrl ? (
                        <img
                          src={item.vehicleImageUrl}
                          alt={item.vehicleName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.vehicleName}</h3>
                      <p className="text-xs text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(cartData?.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Thuế VAT (10%):</span>
                  <span className="font-semibold">{formatPrice(cartData?.estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(cartData?.estimatedTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Cam kết của chúng tôi</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Giao xe miễn phí toàn quốc</li>
                  <li>✓ Bảo hành chính hãng 5 năm</li>
                  <li>✓ Hỗ trợ trả góp 0% lãi suất</li>
                  <li>✓ Đổi trả trong 7 ngày</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
