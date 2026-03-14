import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { updateCentralReorderLevel } from "../services/inventoryService";
import Swal from "sweetalert2";

const ReorderLevelModal = ({ isOpen, onClose, onSuccess, variantId }) => {
  const [reorderLevel, setReorderLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await updateCentralReorderLevel({
        variantId,
        reorderLevel: Number(reorderLevel),
      });
      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật ngưỡng tồn kho thành công.",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Cập nhật ngưỡng tồn kho</h3>
              <p className="text-sm text-gray-500">
                Cho Variant ID: {variantId}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX />
            </button>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngưỡng đặt lại mới
            </label>
            <input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              placeholder="Nhập số lượng*"
              required
              className="p-2 border rounded-lg w-full"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReorderLevelModal;
