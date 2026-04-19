import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, Package, Truck, FileCheck, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getOrderById, cancelOrder } from "../services/orderService";
import { toast } from "react-toastify";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch order detail
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        const response = await getOrderById(orderId);
        return response.data;
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
        throw error;
      }
    },
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, cancelReason),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng");
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
      setShowCancelModal(false);
    },
    onError: () => {
      toast.error("Không thể hủy đơn hàng");
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    // Map backend statuses to simplified display statuses
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      EDITED: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      CONFIRMED: { label: 'Khách đã xác nhận', color: 'bg-green-100 text-green-800', icon: FileCheck },
      IN_PRODUCTION: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', icon: Package },
      READY_FOR_DELIVERY: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', icon: Package },
      DELIVERED: { label: 'Đã giao xe', color: 'bg-green-100 text-green-800', icon: Truck },
      COMPLETED: { label: 'Đã giao xe', color: 'bg-green-100 text-green-800', icon: Truck },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
      REJECTED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      NONE: { label: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-600', icon: AlertCircle },
      PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PARTIALLY_PAID: { label: 'Đã cọc', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
      PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800', icon: XCircle },
      REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn");
      return;
    }
    cancelMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const order = orderData;
  const statusInfo = getStatusInfo(order.orderStatusB2C);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
  const canCancel = ['PENDING', 'APPROVED'].includes(order.orderStatusB2C);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/orders')}
            className="text-white hover:text-gray-200 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
          <p className="text-blue-100 mt-2">Mã đơn: {order.orderId}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                  <statusInfo.icon size={16} />
                  {statusInfo.label}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 ${paymentInfo.color}`}>
                  <paymentInfo.icon size={16} />
                  {paymentInfo.label}
                </span>
              </div>

              {/* Order Tracking */}
              {order.orderTrackings && order.orderTrackings.length > 0 && (
                <div className="relative">
                  {order.orderTrackings.map((tracking, index) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        {index < order.orderTrackings.length - 1 && (
                          <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="font-semibold text-gray-900">
                          {getStatusInfo(tracking.statusB2C).label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(tracking.updateDate)}
                        </div>
                        {tracking.notes && (
                          <div className="text-sm text-gray-700 mt-1">{tracking.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm</h2>
              
              {order.orderItems && order.orderItems.length > 0 ? (
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                        {item.imageUrl && item.imageUrl !== '/placeholder-car.png' ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.variantName || item.modelName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-car.png';
                            }}
                          />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {item.modelName || `Xe điện - Variant ${item.variantId}`}
                        </h3>
                        {item.variantName && (
                          <div className="text-sm text-gray-700 mb-1">
                            Phiên bản: {item.variantName}
                          </div>
                        )}
                        {item.color && (
                          <div className="text-sm text-gray-600 mb-1">
                            Màu sắc: {item.color}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Số lượng: <span className="font-medium">{item.quantity}</span></p>
                          <p>Đơn giá: {formatPrice(item.unitPrice)}</p>
                          {item.discount > 0 && (
                            <p className="text-red-600">Giảm giá: -{formatPrice(item.discount)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(item.finalPrice || (item.quantity * item.unitPrice))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Không có thông tin sản phẩm</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Ngày đặt:</span>
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between text-gray-700">
                    <span>Dự kiến giao:</span>
                    <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.downPayment > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Đặt cọc:</span>
                    <span className="font-semibold">{formatPrice(order.downPayment)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(order.downPayment > 0 ? order.totalAmount - order.downPayment : order.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold mb-3"
                >
                  Hủy đơn hàng
                </button>
              )}

              <button
                onClick={() => navigate('/orders')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Quay lại danh sách
              </button>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Hỗ trợ</h3>
                <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>📞 Hotline: 1900-xxxx</p>
                  <p>📧 Email: support@vms.vn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hủy đơn hàng</h3>
            <p className="text-gray-600 mb-4">Vui lòng cho biết lý do hủy đơn hàng:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="4"
              placeholder="Nhập lý do hủy đơn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
