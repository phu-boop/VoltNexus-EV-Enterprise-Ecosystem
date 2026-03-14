import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle, Clock, Truck, Home, Search } from "lucide-react";
import { toast } from "react-toastify";
import apiPublic from "../services/apiPublic";
import Button from "../components/ui/Button";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchOrderId, setSearchOrderId] = useState(orderId || '');

  // Fetch order details
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const response = await apiPublic.get(`/api/v1/sales-orders/b2c/${orderId}`);
        return response.data?.data || response.data;
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không tìm thấy đơn hàng");
        return null;
      }
    },
    enabled: !!orderId,
  });

  // Fetch order tracking
  const { data: trackingData } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      try {
        const response = await apiPublic.get(`/sales/api/v1/order-tracking/order/${orderId}`);
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error("Error fetching tracking:", error);
        return [];
      }
    },
    enabled: !!orderId,
  });

  const handleSearch = () => {
    if (!searchOrderId.trim()) {
      toast.error("Vui lòng nhập mã đơn hàng");
      return;
    }
    navigate(`/orders/${searchOrderId}`);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { 
        label: 'Chờ Xác Nhận', 
        icon: Clock, 
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Đơn hàng đã được tạo và đang chờ xác nhận'
      },
      'CONFIRMED': { 
        label: 'Đã Xác Nhận', 
        icon: CheckCircle, 
        color: 'text-blue-600 bg-blue-100',
        description: 'Đơn hàng đã được xác nhận và đang chuẩn bị'
      },
      'PAID': { 
        label: 'Đã Thanh Toán', 
        icon: CheckCircle, 
        color: 'text-green-600 bg-green-100',
        description: 'Đã thanh toán thành công'
      },
      'IN_PRODUCTION': { 
        label: 'Đang Sản Xuất', 
        icon: Package, 
        color: 'text-purple-600 bg-purple-100',
        description: 'Xe đang được sản xuất tại nhà máy'
      },
      'IN_TRANSIT': { 
        label: 'Đang Vận Chuyển', 
        icon: Truck, 
        color: 'text-orange-600 bg-orange-100',
        description: 'Xe đang được vận chuyển đến showroom'
      },
      'READY_FOR_DELIVERY': { 
        label: 'Sẵn Sàng Giao', 
        icon: Home, 
        color: 'text-indigo-600 bg-indigo-100',
        description: 'Xe đã đến showroom và sẵn sàng giao'
      },
      'DELIVERED': { 
        label: 'Đã Giao', 
        icon: CheckCircle, 
        color: 'text-green-600 bg-green-100',
        description: 'Đã giao xe thành công'
      },
      'CANCELLED': { 
        label: 'Đã Hủy', 
        icon: Clock, 
        color: 'text-red-600 bg-red-100',
        description: 'Đơn hàng đã bị hủy'
      },
    };

    return statusMap[status] || { 
      label: status, 
      icon: Package, 
      color: 'text-gray-600 bg-gray-100',
      description: 'Trạng thái không xác định'
    };
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Order status timeline
  const statusTimeline = [
    { status: 'PENDING', step: 1 },
    { status: 'CONFIRMED', step: 2 },
    { status: 'PAID', step: 3 },
    { status: 'IN_PRODUCTION', step: 4 },
    { status: 'IN_TRANSIT', step: 5 },
    { status: 'READY_FOR_DELIVERY', step: 6 },
    { status: 'DELIVERED', step: 7 },
  ];

  const currentStatus = orderData?.orderStatusB2C || orderData?.orderStatus || 'PENDING';
  const currentStep = statusTimeline.findIndex(s => s.status === currentStatus) + 1;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Theo Dõi Đơn Hàng
            </h1>
            <p className="text-gray-600 mb-6">Nhập mã đơn hàng để theo dõi trạng thái</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Nhập mã đơn hàng..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-5 h-5 inline mr-2" />
                Tìm Kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Không Tìm Thấy Đơn Hàng</h2>
            <p className="text-gray-600 mb-6">Mã đơn hàng không hợp lệ hoặc không tồn tại</p>
            <Button
              onClick={() => navigate('/orders')}
              variant="outline"
            >
              Tìm Kiếm Đơn Hàng Khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Theo Dõi Đơn Hàng
              </h1>
              <p className="text-gray-600">Mã đơn hàng: <span className="font-semibold">{orderId}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-full ${statusInfo.color} flex items-center gap-2`}>
              <statusInfo.icon className="w-5 h-5" />
              <span className="font-semibold">{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Tiến Trình Đơn Hàng</h2>
          <div className="relative">
            {statusTimeline.map((item, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep - 1;
              const itemStatusInfo = getStatusInfo(item.status);
              const Icon = itemStatusInfo.icon;

              return (
                <div key={item.status} className="flex items-start mb-8 last:mb-0">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {itemStatusInfo.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {itemStatusInfo.description}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-600 mt-1 font-semibold">
                        Trạng thái hiện tại
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Thông Tin Đơn Hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt:</span>
                <span className="font-semibold">{formatDate(orderData.orderDate)}</span>
              </div>
              {orderData.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày giao dự kiến:</span>
                  <span className="font-semibold">{formatDate(orderData.deliveryDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-blue-600">
                  {formatPrice(orderData.totalAmount || orderData.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className={`font-semibold ${
                  orderData.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {orderData.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Lịch Sử Cập Nhật</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trackingData && trackingData.length > 0 ? (
                trackingData.map((track, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4 last:pb-0">
                    <div className="font-semibold text-sm">{getStatusInfo(track.status).label}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatDate(track.updatedAt)}
                    </div>
                    {track.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {track.location}
                      </div>
                    )}
                    {track.notes && (
                      <div className="text-xs text-gray-600 mt-1">
                        {track.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">Chưa có cập nhật</div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          {orderData.paymentStatus !== 'PAID' && (
            <Button
              onClick={() => navigate(`/payment?orderId=${orderId}&amount=${orderData.totalAmount || orderData.finalAmount}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thanh Toán Ngay
            </Button>
          )}
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
          >
            Về Trang Chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
