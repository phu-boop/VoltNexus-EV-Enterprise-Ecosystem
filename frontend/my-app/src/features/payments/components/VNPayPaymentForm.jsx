// components/VNPayPaymentForm.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

const VNPayPaymentForm = ({ remainingAmount, onSubmit, formatCurrency }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trong hàm handleSubmit của VNPayPaymentForm
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (parseFloat(paymentAmount) > remainingAmount) {
      toast.error("Số tiền thanh toán không được vượt quá số tiền còn lại");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(paymentAmount);
      // Redirect sẽ được xử lý trong hàm handleVNPayPayment của parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [
    { label: "100,000 ₫", value: 100000 },
    { label: "500,000 ₫", value: 500000 },
    { label: "1,000,000 ₫", value: 1000000 },
    { label: "Toàn bộ", value: remainingAmount },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Thanh Toán Qua VNPAY
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn nhanh số tiền
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickAmounts.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPaymentAmount(item.value)}
                className="p-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Hoặc nhập số tiền tùy chọn
          </label>
          <input
            type="number"
            id="amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Nhập số tiền thanh toán"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1000"
            max={remainingAmount}
            step="1000"
          />
          <p className="text-sm text-gray-500 mt-2">
            Số tiền tối đa:{" "}
            <span className="font-semibold">
              {formatCurrency(remainingAmount)}
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            !paymentAmount ||
            paymentAmount <= 0 ||
            paymentAmount > remainingAmount ||
            isSubmitting
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </>
          ) : (
            "Thanh Toán Qua VNPAY"
          )}
        </button>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            Thông tin thanh toán
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Hệ thống sẽ chuyển hướng đến trang VNPAY</li>
            <li>• Thanh toán được xử lý an toàn và bảo mật</li>
            <li>• Giao dịch sẽ được cập nhật ngay sau khi hoàn tất</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default VNPayPaymentForm;
