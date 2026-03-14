// VNPAY Return Page - Xử lý redirect từ VNPAY
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../features/payments/services/paymentService';
import { toast } from 'react-toastify';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const VnpayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    processPaymentReturn();
  }, []);

  const processPaymentReturn = async () => {
    try {
      setLoading(true);
      
      // Lấy các tham số từ VNPAY URL
      const vnpParams = {};
      searchParams.forEach((value, key) => {
        vnpParams[key] = value;
      });

      // Gọi API để xử lý return URL
      // Backend endpoint: GET /api/v1/payments/gateway/callback/vnpay-return
      const response = await paymentService.vnpayReturn(vnpParams);
      const data = response.data;

      // Check response code và transaction status
      const responseCode = data.responseCode || searchParams.get('vnp_ResponseCode');
      const transactionStatus = data.transactionStatus || searchParams.get('vnp_TransactionStatus');

      if (data.success && responseCode === '00' && transactionStatus === '00') {
        setPaymentStatus('success');
        toast.success('Thanh toán thành công!');
        
        // Redirect về trang đơn hàng sau 3 giây
        setTimeout(() => {
          navigate('/dealer/manager/orders'); // Hoặc trang tương ứng
        }, 3000);
      } else {
        setPaymentStatus('failed');
        toast.error(data.message || 'Thanh toán thất bại');
      }
    } catch (error) {
      console.error('Error processing VNPAY return:', error);
      setPaymentStatus('error');
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-gray-600 mb-6">
              Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã thanh toán.
            </p>
            <button
              onClick={() => navigate('/dealer/manager/orders')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Quay Lại Đơn Hàng
            </button>
          </>
        ) : (
          <>
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh Toán Thất Bại</h2>
            <p className="text-gray-600 mb-6">
              Giao dịch của bạn không thể được xử lý. Vui lòng thử lại.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Quay Lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VnpayReturnPage;

