import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiPlusCircle, FiFileText, FiType } from "react-icons/fi";
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
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fff',
      padding: '2em',
      customClass: {
        title: 'text-2xl font-bold text-slate-900',
        popup: 'rounded-3xl shadow-2xl border-none'
      },
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
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      confirmButtonColor: "#0f172a", // Slate-900
      customClass: {
        popup: 'rounded-2xl shadow-xl border-none'
      }
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
      showSuccessAlert(`Đã nhập kho thành công ${vinList.length} xe!`);
    } catch (err) {
      const apiErrorMessage = err.response?.data?.message || err.message;
      showErrorAlert(apiErrorMessage || "Thao tác thất bại.");
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
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <FiPlusCircle size={18} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Nhập Kho Theo VIN
                </h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Phiên bản sản phẩm <span className="text-blue-600 font-bold">#{variantId}</span>
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
            {/* Input VINs */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiFileText size={14} className="text-blue-500" />
                Danh sách số VIN (Mỗi dòng một VIN)
              </label>
              <textarea
                value={vinsInput}
                onChange={(e) => setVinsInput(e.target.value)}
                placeholder="VD: VIN00123456789&#10;VIN00123456790..."
                required
                disabled={isLoading}
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
              ></textarea>
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] text-slate-400 italic">Nhấn Enter để xuống dòng mới</p>
                {vinsInput.trim() && (
                  <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-lg">
                    TỔNG: {vinsInput.split('\n').filter(v => v.trim()).length} XE
                  </span>
                )}
              </div>
            </div>

            {/* Input Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiType size={14} className="text-blue-500" />
                Ghi chú nội bộ
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập nội dung ghi chú nếu có"
                disabled={isLoading}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
              />
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
              {isLoading ? "Đang lưu..." : "Xác nhận nhập kho"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TransactionModal;
