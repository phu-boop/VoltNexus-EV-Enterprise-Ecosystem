import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiRepeat, FiHash, FiMapPin, FiType, FiLoader } from "react-icons/fi";
import { useAuthContext } from "../../../../features/auth/AuthProvider";
import { getAllDealersList } from "../../../dealer/ordervariants/services/dealerSalesService";
import {
  createB2BOrder,
  createB2BOrderByStaff,
} from "../services/evmSalesService";
import Swal from "sweetalert2";

const TransferRequestModal = ({ isOpen, onClose, onSuccess, variantId }) => {
  const { email, roles } = useAuthContext();
  const isStaffOrAdmin =
    roles?.includes("EVM_STAFF") || roles?.includes("ADMIN");

  const [quantity, setQuantity] = useState("");
  const [toDealerId, setToDealerId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [dealerList, setDealerList] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setToDealerId("");
      setNotes("");
      setError("");

      const fetchDealers = async () => {
        setIsListLoading(true);
        try {
          const response = await getAllDealersList();
          setDealerList(response.data.data || []);
        } catch (err) {
          setError("Lỗi: Không thể tải danh sách đại lý.");
        } finally {
          setIsListLoading(false);
        }
      };
      fetchDealers();
    }
  }, [isOpen]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: message,
      timer: 2500,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const basePayload = {
        dealerId: toDealerId,
        requestedByEmail: email,
        notes: notes,
        items: [
          {
            variantId: variantId,
            quantity: Number(quantity),
          },
        ],
      };

      if (isStaffOrAdmin) {
        if (!toDealerId) {
          setError("Vui lòng chọn đại lý nhận.");
          setIsLoading(false);
          return;
        }
        await createB2BOrderByStaff(basePayload);
        showSuccessAlert("Đã tạo lệnh điều chuyển thành công! Vui lòng vào trang 'Điều Phối Xe' để duyệt.");
      } else {
        await createB2BOrder(basePayload);
        showSuccessAlert("Đã tạo đơn đặt hàng thành công!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Thao tác thất bại.");
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
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                  <FiRepeat size={18} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Tạo Lệnh Điều Chuyển
                </h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Phiên bản sản phẩm <span className="text-purple-600 font-bold">#{variantId}</span>
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
            {/* Input Quantity */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiHash size={14} className="text-purple-500" />
                Số lượng điều chuyển (Đơn vị: xe)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="VD: 5"
                min="1"
                required
                disabled={isLoading}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-inner font-bold"
              />
            </div>

            {/* Select Dealer */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiMapPin size={14} className="text-purple-500" />
                Đại lý đích tiếp nhận
              </label>
              <div className="relative">
                <select
                  value={toDealerId}
                  onChange={(e) => setToDealerId(e.target.value)}
                  required
                  disabled={isListLoading || isLoading}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-inner appearance-none disabled:bg-slate-100 pr-10 font-medium"
                >
                  <option value="" disabled>
                    {isListLoading ? "Đang tải danh sách..." : "-- Lựa chọn đại lý --"}
                  </option>
                  {dealerList.map((dealer) => (
                    <option key={dealer.dealerId} value={dealer.dealerId}>
                      {dealer.dealerName}
                    </option>
                  ))}
                </select>
                {isListLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiLoader className="animate-spin text-purple-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Input Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                <FiType size={14} className="text-purple-500" />
                Thông tin bổ sung (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lý do điều phối, thời gian dự kiến..."
                disabled={isLoading}
                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-inner resize-none"
              ></textarea>
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
              className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiRepeat />
              )}
              {isLoading ? "Đang xử lý..." : "Tạo Lệnh Ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TransferRequestModal;
