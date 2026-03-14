// features/admin/promotions/pages/PromotionEditPage.js
import React, { useState } from 'react';
import PromotionForm from '../components/PromotionForm';
import { usePromotions } from '../hooks/usePromotions';
import Alert from '../../../../components/ui/Alert';

export const PromotionEditPage = ({ promotion, onBack }) => {
  const { updatePromotion } = usePromotions();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleSubmit = async (data) => {
    const result = await updatePromotion(promotion.promotionId, data);
    if (result.success) {
      setAlert({
        show: true,
        type: 'success',
        message: 'Cập nhật khuyến mãi thành công!'
      });
      // Kéo lên top khi hiển thị alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        onBack();
      }, 1000);
    } else {
      setAlert({
        show: true,
        type: 'error',
        message: result.error
      });
      // Kéo lên top khi hiển thị alert lỗi
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Khuyến mãi</h1>
            <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin khuyến mãi</p>
          </div>
        </div>

        {/* Hiển thị Alert ở đầu trang */}
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={handleCloseAlert}
          />
        )}

        <PromotionForm 
          onSubmit={handleSubmit} 
          onCancel={onBack}
          initialData={promotion}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default PromotionEditPage;