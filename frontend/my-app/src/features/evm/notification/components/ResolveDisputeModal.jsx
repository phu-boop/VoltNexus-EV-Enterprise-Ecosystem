// src/components/modals/ResolveDisputeModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useResolveDispute } from "../hooks/useStaffNotifications";

// Dựa trên OrderStatusB2B của bạn
const statusOptions = [
  { value: "IN_TRANSIT", label: "Tiếp tục giao hàng (Giao lại cho Đại lý)" },
  { value: "RETURNED_TO_CENTRAL", label: "Trả về kho trung tâm" },
  { value: "DELIVERED", label: "Xác nhận đã đến Đại lý (Bỏ qua khiếu nại)" },
];

/**
 * Modal này nhận vào orderId và một hàm onClose
 * @param {{ orderId: string, onClose: () => void }} props
 */
const ResolveDisputeModal = ({ orderId, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const resolveDisputeMutation = useResolveDispute();

  // Dựa trên ResolveDisputeRequest DTO
  const onSubmit = (data) => {
    const payload = {
      newStatus: data.newStatus, // "IN_TRANSIT" | "DELIVERED" | "RETURNED_TO_CENTRAL"
      notes: data.notes,
    };

    resolveDisputeMutation.mutate(
      { orderId, payload },
      {
        onSuccess: () => {
          onClose(); // Đóng modal khi thành công
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex justify-center items-start pt-32 z-50">
      {/* ========================== */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          Giải quyết Khiếu nại Đơn hàng
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Lựa chọn trạng thái mới */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cập nhật trạng thái mới
            </label>
            <select
              {...register("newStatus", {
                required: "Vui lòng chọn trạng thái mới",
              })}
              className={`w-full p-2 border rounded ${
                errors.newStatus ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Chọn trạng thái --</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.newStatus && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newStatus.message}
              </p>
            )}
          </div>

          {/* Ghi chú của Admin */}
          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              id="notes"
              {...register("notes")}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Nhập ghi chú giải quyết, ví dụ: Đã liên hệ tài xế..."
            ></textarea>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={resolveDisputeMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {resolveDisputeMutation.isLoading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveDisputeModal;
