import React, { useState, useEffect } from "react";
import { FiX, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import {
  createVariant,
  updateVariant,
} from "../services/vehicleCatalogService";

const STATUS_OPTIONS = {
  IN_PRODUCTION: "Đang sản xuất",
  COMING_SOON: "Sắp ra mắt",
  DISCONTINUED: "Ngừng sản xuất",
};

const VariantForm = ({ isOpen, onClose, onSuccess, modelId, variant }) => {
  const isEditMode = !!variant;

  const initialFormState = {
    versionName: "", color: "", price: "", skuCode: "", imageUrl: "", status: "IN_PRODUCTION",
    wholesalePrice: "", batteryCapacity: "", chargingTime: "", rangeKm: "", motorPower: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && variant) {
      setFormData({
        versionName: variant.versionName || "", color: variant.color || "", price: variant.price || "",
        skuCode: variant.skuCode || "", imageUrl: variant.imageUrl || "", status: variant.status || "IN_PRODUCTION",
        wholesalePrice: variant.wholesalePrice || "", batteryCapacity: variant.batteryCapacity || "",
        chargingTime: variant.chargingTime || "", rangeKm: variant.rangeKm || "", motorPower: variant.motorPower || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEditMode, variant, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || null,
      batteryCapacity: Number(formData.batteryCapacity) || null,
      chargingTime: Number(formData.chargingTime) || null,
      rangeKm: Number(formData.rangeKm) || null,
      motorPower: Number(formData.motorPower) || null,
    };

    try {
      if (isEditMode) {
        await updateVariant(variant.variantId, payload);
      } else {
        await createVariant(modelId, payload);
      }
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white shadow-2xl w-full max-w-xl h-full flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white z-10 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {isEditMode ? "Tùy chỉnh Phiên Bản" : "Thêm Phiên Bản Mới"}
              </h2>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 italic">Model ID: <span className="text-indigo-600 font-black">{modelId}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} id="variant-form" className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/10 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
            {/* Section 1: Basic Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black italic">1</div>
                Thông tin cơ sở
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên phiên bản <span className="text-red-500">*</span></label>
                    <input name="versionName" value={formData.versionName} onChange={handleChange} placeholder="VD: Plus" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-gray-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Màu sắc <span className="text-red-500">*</span></label>
                    <input name="color" value={formData.color} onChange={handleChange} placeholder="VD: Trắng" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900 shadow-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Giá niêm yết (VNĐ) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="VD: 1250000000" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-black text-indigo-600 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mã SKU <span className="text-red-500">*</span></label>
                    <input name="skuCode" value={formData.skuCode} onChange={handleChange} placeholder="VD: VF8-PLUS-WHT" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono uppercase text-xs text-gray-900 shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL Hình ảnh</label>
                  <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs text-gray-900 shadow-sm" />
                </div>
              </div>
            </div>

            {/* Section 2: Specs */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black italic">2</div>
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quãng đường (km)</label>
                  <input type="number" name="rangeKm" value={formData.rangeKm} onChange={handleChange} placeholder="VD: 420" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Công suất (kW)</label>
                  <input type="number" name="motorPower" value={formData.motorPower} onChange={handleChange} placeholder="VD: 300" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pin (kWh)</label>
                  <input type="number" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} placeholder="VD: 87.7" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sạc (giờ)</label>
                  <input type="number" name="chargingTime" value={formData.chargingTime} onChange={handleChange} placeholder="VD: 8" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900" />
                </div>
              </div>
            </div>

            {/* Section 3: Release Settings */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black italic">3</div>
                Cài đặt phát hành
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trạng thái phát hành</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-bold text-gray-900 appearance-none">
                    {Object.entries(STATUS_OPTIONS).map(([val, text]) => (<option key={val} value={val}>{text}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Giá sỉ (Tùy chọn)</label>
                  <input type="number" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} placeholder="VD: 1100000000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-medium text-gray-900" />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 bg-white shadow-sm z-10">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl flex items-center gap-2 italic uppercase">
                <FiInfo className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs uppercase tracking-tighter"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('variant-form').requestSubmit()}
                disabled={isLoading}
                className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-50 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-widest italic"
              >
                {isLoading ? <Spin size="small" /> : isEditMode ? "Lưu thay đổi" : "Khởi tạo phiên bản"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VariantForm;
