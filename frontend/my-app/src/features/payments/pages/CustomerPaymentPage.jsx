// Customer Payment Page (B2C Payment Flow)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import { toast } from 'react-toastify';

const CustomerPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
    loadPaymentHistory();
  }, [orderId]);

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getActivePaymentMethods();
      setPaymentMethods(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory(orderId);
      setPaymentHistory(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      setLoading(true);
      const response = await paymentService.initiatePayment(orderId, paymentData);
      const data = response.data.data || response.data;

      // Nếu là VNPAY gateway, redirect đến payment URL
      if (data.status === 'PENDING_GATEWAY' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success(data.message || 'Thanh toán đã được khởi tạo thành công');
        loadPaymentHistory();
        setShowPaymentForm(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Không thể khởi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Thanh Toán Đơn Hàng</h1>
        <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        {showPaymentForm && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Thanh Toán</h2>
            <PaymentForm
              paymentMethods={paymentMethods}
              onSubmit={handlePayment}
              loading={loading}
            />
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch Sử Thanh Toán</h2>
          <PaymentHistory history={paymentHistory} />
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;


