import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Download, Truck, Package, Clock } from 'lucide-react';
import { getOrderDetailAdmin, updateOrderStatus, cancelOrder, confirmOrder, exportInvoice } from '../../services/adminOrderService';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetailAdmin(orderId);
      if (response.code === 200 || response.code === "1000") {
        setOrder(response.result || response.data);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin đơn hàng');
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setProcessing(true);

      // Lấy managerId từ token
      const token = sessionStorage.getItem("token");
      let managerId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          managerId = payload.profileId;
        } catch (e) {
          console.error("Failed to parse token:", e);
        }
      }

      if (!managerId) {
        toast.error('Không tìm thấy ID người quản lý. Vui lòng thử đăng nhập lại.');
        return;
      }

      const response = await confirmOrder(orderId, managerId);
      if (response.code === 200 || response.code === "1000") {
        toast.success('Xác nhận đơn hàng thành công');
        loadOrderDetail();
      }
    } catch (error) {
      toast.error('Không thể xác nhận đơn hàng');
      console.error('Confirm error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      setProcessing(true);
      const response = await cancelOrder(orderId, cancelReason);
      if (response.code === 200) {
        toast.success('Hủy đơn hàng thành công');
        setShowCancelModal(false);
        setCancelReason('');
        loadOrderDetail();
      }
    } catch (error) {
      toast.error('Không thể hủy đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setProcessing(true);
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.code === 200) {
        toast.success('Cập nhật trạng thái thành công');
        loadOrderDetail();
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportInvoice = async () => {
    try {
      const blob = await exportInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống hóa đơn');
    } catch (error) {
      toast.error('Không thể xuất hóa đơn');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'EDITED': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'CONFIRMED': { label: 'Khách đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'APPROVED': { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'IN_PRODUCTION': { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', icon: Package },
      'DELIVERED': { label: 'Đã giao xe', color: 'bg-green-100 text-green-800', icon: Package },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
      'REJECTED': { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || { label: status || 'N/A', color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${config.color}`}>
        <Icon size={18} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng #{orderId}</h1>
            <p className="text-gray-600">Ngày đặt: {formatDate(order.createdAt || order.orderDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status || order.orderStatusB2C)}
          <button
            onClick={handleExportInvoice}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={18} />
            Xuất hóa đơn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm đặt hàng</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.imageUrl || '/placeholder-car.png'}
                    alt={item.variantName}
                    className="w-24 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder-car.png';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.variantName}</h3>
                    <p className="text-sm text-gray-500">{item.modelName}</p>
                    <p className="text-sm text-gray-600 mt-1">Màu: {item.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tổng kết đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền hàng:</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Tổng tiền thanh toán:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {order.downPayment > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Số tiền đã đặt cọc:</span>
                  <span className="text-green-600">-{formatPrice(order.downPayment)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold text-blue-700">
                    <span>Số tiền còn lại:</span>
                    <span>{formatPrice(order.totalAmount - order.downPayment)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tên khách hàng</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium text-gray-900">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                <p className="font-medium text-gray-900">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thanh toán</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phương thức</p>
                <p className="font-medium text-gray-900">{order.paymentMethod || 'Chưa xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'PARTIALLY_PAID' || order.downPayment > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {order.paymentStatus === 'PAID'
                      ? 'Đã thanh toán đầy đủ'
                      : (order.paymentStatus === 'PARTIALLY_PAID' || order.downPayment > 0)
                        ? 'Đã thanh toán cọc'
                        : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {order.downPayment > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Tiền cọc đã trả:</span>
                    <span className="font-bold text-green-600">{formatPrice(order.downPayment)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-500">Số tiền còn lại:</span>
                    <span className="font-bold text-blue-600">{formatPrice(order.totalAmount - order.downPayment)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác</h2>
            <div className="space-y-3">
              {/* Phê duyệt: PENDING, EDITED, hoặc CONFIRMED */}
              {['PENDING', 'EDITED', 'CONFIRMED'].includes(order.orderStatusB2C || order.status) && (
                <button
                  onClick={handleConfirmOrder}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Phê duyệt đơn hàng
                </button>
              )}

              {/* Bắt đầu xử lý: Sau khi APPROVED */}
              {(order.orderStatusB2C === 'APPROVED' || order.status === 'APPROVED') && (
                <button
                  onClick={() => handleStatusUpdate('IN_PRODUCTION')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Package size={18} />
                  Bắt đầu xử lý
                </button>
              )}

              {/* Giao xe: Sau khi IN_PRODUCTION */}
              {(order.orderStatusB2C === 'IN_PRODUCTION' || order.status === 'IN_PRODUCTION') && (
                <button
                  onClick={() => handleStatusUpdate('DELIVERED')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Truck size={18} />
                  Xác nhận giao xe
                </button>
              )}

              {/* Hủy đơn: Cho các trạng thái chưa hoàn tất */}
              {['PENDING', 'EDITED', 'CONFIRMED', 'APPROVED', 'IN_PRODUCTION'].includes(order.orderStatusB2C || order.status) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>

          {/* Order History/Notes */}
          {
            order.notes && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ghi chú</h2>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )
          }

          {/* Cancel Modal */}
          {
            showCancelModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Hủy đơn hàng</h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng nhập lý do hủy đơn hàng #{orderId}
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelReason('');
                      }}
                      disabled={processing}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {processing ? 'Đang xử lý...' : 'Xác nhận hủy'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
