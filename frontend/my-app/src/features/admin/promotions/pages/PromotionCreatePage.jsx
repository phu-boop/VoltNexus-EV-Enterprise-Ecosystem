// features/admin/promotions/pages/PromotionCreatePage.js
import React, { useState } from 'react';
import PromotionForm from '../components/PromotionForm';
import { usePromotions } from '../hooks/usePromotions';
import Alert from '../../../../components/ui/Alert';
import { FaArrowLeft } from "react-icons/fa";

const PromotionCreatePage = ({ onBack }) => {
  const { createPromotion } = usePromotions();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleSubmit = async (data) => {
    const result = await createPromotion(data);
    if (result.success) {
      setAlert({
        show: true,
        type: 'success',
        message: 'Tạo khuyến mãi thành công!'
      });
      // Kéo lên top khi hiển thị alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        onBack();
      }, 2000);
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
             <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo Khuyến mãi Mới</h1>
            <p className="text-sm text-gray-600 mt-1">Thiết lập chương trình khuyến mãi mới</p>
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
        />
      </div>
    </div>
  );
};

export default PromotionCreatePage;