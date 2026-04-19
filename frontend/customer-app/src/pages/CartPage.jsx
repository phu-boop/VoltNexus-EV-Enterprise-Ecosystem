import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getCartSummary, updateCartItem, removeCartItem, clearCart } from "../services/cartService";
import { toast } from "react-toastify";

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const customerId = user?.memberId; // Assuming memberId is the customerId

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

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }) =>
      updateCartItem(customerId, cartItemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', customerId]);
      toast.success("Đã cập nhật giỏ hàng");
    },
    onError: () => {
      toast.error("Không thể cập nhật giỏ hàng");
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (cartItemId) => removeCartItem(customerId, cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', customerId]);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    },
    onError: () => {
      toast.error("Không thể xóa sản phẩm");
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => clearCart(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', customerId]);
      toast.success("Đã xóa toàn bộ giỏ hàng");
    },
    onError: () => {
      toast.error("Không thể xóa giỏ hàng");
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateMutation.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      removeMutation.mutate(cartItemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearMutation.mutate();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
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
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isEmpty ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <button
              onClick={() => navigate('/vehicles')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá xe điện
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Sản phẩm ({cartData?.totalItems || 0})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Cart Items List */}
              {items.map((item) => (
                <div key={item.cartItemId} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {item.vehicleImageUrl ? (
                        <img
                          src={item.vehicleImageUrl}
                          alt={item.vehicleName}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.vehicleName}
                      </h3>
                      {item.vehicleColor && (
                        <p className="text-sm text-gray-600 mb-2">Màu: {item.vehicleColor}</p>
                      )}
                      <p className="text-xl font-bold text-blue-600 mb-3">
                        {formatPrice(item.unitPrice)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-2">Ghi chú: {item.notes}</p>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan đơn hàng</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính:</span>
                    <span className="font-semibold">{formatPrice(cartData?.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Thuế VAT (10%):</span>
                    <span className="font-semibold">{formatPrice(cartData?.estimatedTax)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatPrice(cartData?.estimatedTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg mb-3"
                >
                  Tiến hành thanh toán
                </button>

                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Tiếp tục mua sắm
                </button>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Chính sách mua hàng</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Miễn phí giao xe toàn quốc</li>
                    <li>✓ Bảo hành chính hãng 5 năm</li>
                    <li>✓ Hỗ trợ trả góp 0% lãi suất</li>
                    <li>✓ Đổi trả trong 7 ngày</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
