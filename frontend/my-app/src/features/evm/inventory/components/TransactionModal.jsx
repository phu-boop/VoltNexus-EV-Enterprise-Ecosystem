import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { executeTransaction } from "../services/inventoryService";
import { useAuthContext } from "../../../../features/auth/AuthProvider";

const TransactionModal = ({ isOpen, onClose, onSuccess, variantId }) => {
  const { email } = useAuthContext();

  const [vinsInput, setVinsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form khi modal mở
  useEffect(() => {
    if (isOpen) {
      setVinsInput("");
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: message,
      timer: 2000, // Tự động đóng sau 2 giây
      timerProgressBar: true,
      showConfirmButton: true,
      willClose: () => {
        onSuccess();
        onClose();
      },
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Thao tác thất bại",
      text: message,
      showConfirmButton: true, // Cho phép đóng sớm
      confirmButtonText: "Đóng",
      confirmButtonColor: "#dc2626",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const vinList = vinsInput
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (vinList.length === 0) {
        setError("Vui lòng nhập ít nhất một số VIN.");
        setIsLoading(false);
        return;
      }

      const payload = {
        transactionType: "RESTOCK",
        variantId,
        quantity: vinList.length,
        vins: vinList,
        notes,
        staffId: email,
      };

      await executeTransaction(payload);

      // Hiển thị thông báo thành công và tự động đóng
      showSuccessAlert(`Đã nhập kho thành công ${vinList.length} xe!`);
    } catch (err) {
      const apiErrorMessage = err.response?.data?.message || err.message;
      const errorMsg = apiErrorMessage || "Thao tác thất bại.";

      // Hiển thị thông báo lỗi và tự động đóng sau 3 giây
      showErrorAlert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">
                Nhập Kho Trung Tâm (Theo VIN)
              </h3>
              <p className="text-sm text-gray-500">
                {variantId && `Cho sản phẩm Variant ID: ${variantId}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={isLoading}
            >
              <FiX />
            </button>
          </div>

          {/* Body Form */}
          <div className="p-6 space-y-4">
            {/* Ô nhập VIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh sách số VIN (mỗi VIN một dòng)*
              </label>
              <textarea
                value={vinsInput}
                onChange={(e) => setVinsInput(e.target.value)}
                placeholder="VIN001...&#10;VIN002...&#10;VIN003..."
                required
                disabled={isLoading}
                className="p-2 border rounded-lg w-full h-32 font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            {/* Ô ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú (tùy chọn)"
                disabled={isLoading}
                className="p-2 border rounded-lg w-full h-24 disabled:bg-gray-100 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white rounded-lg disabled:bg-gray-400 bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận nhập kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
