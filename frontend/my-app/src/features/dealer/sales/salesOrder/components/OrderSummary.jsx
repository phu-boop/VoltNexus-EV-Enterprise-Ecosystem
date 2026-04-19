import React from 'react';
import { 
  Calendar, 
  User, 
  CreditCard, 
  FileText, 
  Tag,
  Users,
  Building
} from 'lucide-react';

/**
 * Component hiển thị tổng quan thông tin đơn hàng
 * @param {Object} order - Đơn hàng từ API response
 */
const OrderSummary = ({ order }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa xác định';
  };

  const getRemainingAmount = () => {
    return (order.totalAmount || 0) - (order.downPayment || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b border-gray-100">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đơn hàng <span className="text-blue-600">#{order.orderId.slice(-8)}</span>
          </h1>
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Tạo ngày {formatDate(order.orderDate)}</span>
          </div>
        </div>
        <div className="mt-4 lg:mt-0">
          <OrderStatus status={order.orderStatusB2C} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin cơ bản */}
        <div className="space-y-6 lg:border-r lg:border-gray-200 lg:pr-8 relative">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin đơn hàng</h3>
          </div>
          
          <div className="space-y-4">
            <InfoItem 
              icon={<Tag className="w-4 h-4" />}
              label="Mã đơn hàng" 
              value={order.orderId}
              valueClass="font-mono"
            />
            <InfoItem 
              icon={<FileText className="w-4 h-4" />}
              label="Loại đơn hàng" 
              value={order.typeOder}
            />
            <InfoItem 
              icon={<Calendar className="w-4 h-4" />}
              label="Ngày đặt hàng" 
              value={formatDate(order.orderDate)}
            />
            <InfoItem 
              icon={<Calendar className="w-4 h-4 text-orange-500" />}
              label="Ngày giao dự kiến" 
              value={formatDate(order.deliveryDate)}
              valueClass={new Date(order.deliveryDate) < new Date() ? 'text-red-500 font-semibold' : ''}
            />
          </div>

          {/* Vertical divider decoration */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>

        {/* Thông tin khách hàng & nhân viên */}
        <div className="space-y-6 lg:border-r lg:border-gray-200 lg:pr-8 relative">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin liên hệ</h3>
          </div>
          
          <div className="space-y-4">
            <InfoItem 
              icon={<User className="w-4 h-4" />}
              label="Mã khách hàng" 
              value={order.customerId}
            />
            <InfoItem 
              icon={<User className="w-4 h-4 text-purple-500" />}
              label="Mã nhân viên" 
              value={order.staffId}
            />
            <InfoItem 
              icon={<Building className="w-4 h-4" />}
              label="Mã đại lý" 
              value={order.dealerId}
            />
          </div>

          {/* Vertical divider decoration */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>

        {/* Thông tin tài chính */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin tài chính</h3>
          </div>
          
          <div className="space-y-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-100">
            <InfoItem 
              label="Tổng tiền" 
              value={formatCurrency(order.totalAmount)}
              valueClass="text-lg font-bold text-gray-900"
            />
            <InfoItem 
              label="Đặt cọc" 
              value={formatCurrency(order.downPayment)}
              valueClass="text-blue-600 font-semibold"
            />
            <div className="border-t border-gray-200 pt-3 mt-3">
              <InfoItem 
                label="Còn lại" 
                value={formatCurrency(getRemainingAmount())}
                valueClass={`text-lg font-bold ${
                  getRemainingAmount() > 0 ? 'text-orange-600' : 'text-green-600'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin báo giá (nếu có) */}
      {order.quotation && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin báo giá</h3>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem 
                label="Mã báo giá" 
                value={order.quotation.quotationId}
                valueClass="font-mono text-indigo-700"
              />
              <InfoItem 
                label="Giá trị báo giá" 
                value={formatCurrency(order.quotation.finalPrice)}
                valueClass="text-lg font-bold text-indigo-700"
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Trạng thái:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.quotation.status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : order.quotation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.quotation.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component cho từng thông tin
const InfoItem = ({ icon, label, value, valueClass = "" }) => (
  <div className="flex justify-between items-center py-2 hover:bg-white hover:bg-opacity-50 rounded-lg px-2 transition-colors duration-200 group">
    <div className="flex items-center space-x-2">
      {icon && <span className="text-gray-400 group-hover:text-gray-600 transition-colors">{icon}</span>}
      <span className="text-gray-600 text-sm font-medium">{label}:</span>
    </div>
    <span className={`text-gray-900 text-sm ${valueClass}`}>
      {value || <span className="text-gray-400">N/A</span>}
    </span>
  </div>
);

// Component OrderStatus giả định (cần import thực tế)
const OrderStatus = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
    status === 'completed' ? 'bg-green-100 text-green-800' :
    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
    status === 'cancelled' ? 'bg-red-100 text-red-800' :
    'bg-blue-100 text-blue-800'
  }`}>
    {status}
  </span>
);

export default OrderSummary;