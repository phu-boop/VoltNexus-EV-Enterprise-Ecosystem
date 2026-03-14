// pages/PromotionCreatePage.js
import React, { useState } from "react";
import PromotionForm from "../components/PromotionForm";
import { promotionService } from "../services/promotionService";
import Alert from "../../../../components/ui/Alert"; // Import Alert component

export default function PromotionCreatePage({ onBack }) {
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (data) => {
    try {
      await promotionService.create(data);
      setAlert({
        show: true,
        type: "success",
        message: "Tạo chương trình khuyến mãi thành công!",
      });
      // Kéo lên top khi hiển thị alert
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Tự động quay lại sau 2 giây
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: "Lỗi khi tạo chương trình!",
      });
      // Kéo lên top khi hiển thị alert lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ show: false, type: "", message: "" });
  };

  return (
    <div className="bg-white rounded-lg p-0 mx-auto">
      {/* Alert Component */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}

      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </div>
      <PromotionForm onSubmit={handleSubmit} onCancel={onBack} />
    </div>
  );
}
