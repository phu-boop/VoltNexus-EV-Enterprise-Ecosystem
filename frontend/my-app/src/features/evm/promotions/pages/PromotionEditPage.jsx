// pages/PromotionEditPage.jsx
import React, { useState } from "react";
import PromotionForm from "../components/PromotionForm";
import { promotionService } from "../services/promotionService";
import Alert from "../../../../components/ui/Alert";

export default function PromotionEditPage({ promotion, onBack }) {
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });

    const handleSubmit = async (data) => {
        try {
            await promotionService.update(promotion.promotionId, data);
            setAlert({
                show: true,
                type: "success",
                message: "Cập nhật chương trình khuyến mãi thành công!",
            });
            // Scroll to top to see alert
            window.scrollTo({ top: 0, behavior: "smooth" });
            // Redirect back after success
            setTimeout(() => {
                onBack();
            }, 2000);
        } catch (err) {
            console.error("Error updating promotion:", err);
            const errorMessage = err.response?.data?.message || "Lỗi khi cập nhật chương trình!";
            setAlert({
                show: true,
                type: "error",
                message: errorMessage,
            });
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
                    className="mr-4 m-10 text-gray-500 hover:text-gray-700 focus:outline-none"
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
            <PromotionForm
                onSubmit={handleSubmit}
                onCancel={onBack}
                initialData={promotion}
                isEdit={true}
            />
        </div>
    );
}
