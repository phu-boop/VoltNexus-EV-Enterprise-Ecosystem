import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const CreateInvoiceFromOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  const [formData, setFormData] = useState({
    orderId: orderId || order?.orderId || '',
    dealerId: order?.dealerId || '',
    amount: order?.totalAmount || '',
    dueDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!order && orderId) {
      // Nếu không có order từ state, có thể fetch từ API
      // TODO: Fetch order details if needed
    }
  }, [order, orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.orderId) {
      newErrors.orderId = 'Mã đơn hàng là bắt buộc';
    }
    
    if (!formData.dealerId) {
      newErrors.dealerId = 'Mã đại lý là bắt buộc';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Hạn thanh toán là bắt buộc';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Hạn thanh toán phải là ngày hôm nay hoặc sau đó';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: formData.orderId,
        dealerId: formData.dealerId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined
      };

      const response = await paymentService.createDealerInvoice(payload);
      
      toast.success('Hóa đơn đã được tạo thành công! Đơn hàng đã được cập nhật trạng thái thanh toán.');
      // Redirect về trang danh sách đơn hàng để thấy cập nhật
      navigate('/evm/staff/orders', { 
        state: { 
          message: 'Hóa đơn đã được tạo thành công',
          invoiceId: response.data?.dealerInvoiceId 
        } 
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo hóa đơn';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Lập Hóa Đơn</h1>
        <p className="text-gray-600 mt-1">Tạo hóa đơn từ đơn hàng B2B</p>
      </div>

      {/* Order Info */}
      {order && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Thông tin đơn hàng</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Mã đơn hàng:</span>
              <span className="ml-2 font-medium">#{order.orderId?.substring(0, 8)}</span>
            </div>
            <div>
              <span className="text-blue-700">Tổng tiền đơn hàng:</span>
              <span className="ml-2 font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div>
              <span className="text-blue-700">Trạng thái:</span>
              <span className="ml-2 font-medium">{order.orderStatus}</span>
            </div>
            <div>
              <span className="text-blue-700">Ngày đặt:</span>
              <span className="ml-2 font-medium">
                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã đơn hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              {errors.orderId && (
                <p className="mt-1 text-sm text-red-600">{errors.orderId}</p>
              )}
            </div>

            {/* Dealer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã đại lý <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dealerId"
                value={formData.dealerId}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              {errors.dealerId && (
                <p className="mt-1 text-sm text-red-600">{errors.dealerId}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền hóa đơn <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nhập số tiền"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hạn thanh toán <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5" />
                  Tạo hóa đơn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceFromOrderPage;

