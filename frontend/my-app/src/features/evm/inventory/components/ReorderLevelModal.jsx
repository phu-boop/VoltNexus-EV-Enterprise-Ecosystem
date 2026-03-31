import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiActivity, FiLayers, FiPlusCircle, FiSettings } from "react-icons/fi";
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
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#fff',
        padding: '2em',
        customClass: {
          title: 'text-2xl font-bold text-slate-900',
          popup: 'rounded-3xl shadow-2xl border-none'
        }
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại.");
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: err.response?.data?.message || "Cập nhật thất bại.",
        confirmButtonColor: "#0f172a"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <FiSettings size={18} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Ngưỡng Tồn Kho
                </h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Cập nhật cho sản phẩm <span className="text-blue-600 font-bold">#{variantId}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiActivity size={14} className="text-blue-500" />
                Ngưỡng đặt lại (Reorder Level)
              </label>
              <div className="relative">
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  placeholder="Nhập số lượng tối thiểu*"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic px-1">
                Gợi ý: Ngưỡng này giúp hệ thống tự động cảnh báo khi tồn kho thấp.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-600 text-sm font-medium animate-in slide-in-from-top-1">
                <FiX size={16} />
                {error}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 items-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiPlusCircle />
              )}
              {isLoading ? "Đang xử lý..." : "Cập Nhật Ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReorderLevelModal;
