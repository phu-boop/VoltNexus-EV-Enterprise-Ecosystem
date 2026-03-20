import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { updateDealerReorderLevel } from "../services/dealerSalesService";

const DealerReorderModal = ({
  isOpen,
  onClose,
  onSuccess,
  variantId,
  currentReorderLevel,
}) => {
  const [newReorderLevel, setNewReorderLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewReorderLevel(
        currentReorderLevel !== null && currentReorderLevel !== undefined
          ? String(currentReorderLevel)
          : ""
      ); // Chuyển thành string để input nhận
      setError("");
    }
  }, [isOpen, currentReorderLevel]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số nguyên không âm
    if (/^\d*$/.test(value)) {
      setNewReorderLevel(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const level = parseInt(newReorderLevel, 10);

    // Kiểm tra giá trị hợp lệ
    if (isNaN(level) || level < 0) {
      setError("Vui lòng nhập một số nguyên không âm.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        variantId: variantId,
        reorderLevel: level,
      };

      await updateDealerReorderLevel(payload);

      Swal.fire(
        "Thành công!",
        "Cập nhật ngưỡng đặt lại thành công!",
        "success"
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại."
      );
      console.error("Failed to update reorder level:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {" "}
        {/* Giảm max-w một chút */}
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cập Nhật Ngưỡng Đặt Lại</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body Form */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Nhập số lượng tồn kho tối thiểu mong muốn cho sản phẩm (Variant
              ID: {variantId}). Khi số lượng khả dụng bằng hoặc thấp hơn ngưỡng
              này, trạng thái sẽ là "Tồn kho thấp".
            </p>
            <div>
              <label
                htmlFor="reorderLevelInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ngưỡng đặt lại mới *
              </label>
              <input
                id="reorderLevelInput"
                type="number"
                inputMode="numeric"
                value={newReorderLevel}
                onChange={handleInputChange}
                placeholder="Nhập số lượng (vd: 5)"
                required
                min="0"
                className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-150"
            >
              {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerReorderModal;
