import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import {
  createFeature,
  updateFeature,
} from "../services/vehicleCatalogService";

const FeatureFormModal = ({ isOpen, onClose, onSuccess, feature }) => {
  const isEditMode = !!feature;

  const initialFormState = {
    featureName: "", description: "", category: "Khoang lái (Cabin)", featureType: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && feature) {
        setFormData({
          featureName: feature.featureName || "", description: feature.description || "",
          category: feature.category || "Khoang lái (Cabin)", featureType: feature.featureType || "",
        });
      } else {
        setFormData(initialFormState);
      }
      setError(null);
    }
  }, [isEditMode, feature, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    try {
      if (isEditMode) {
        await updateFeature(feature.featureId, formData);
      } else {
        await createFeature(formData);
      }
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="relative bg-white shadow-2xl w-full max-w-md h-full flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white z-10 shadow-sm text-gray-900 font-black shrink-0">
              <div>
                <h2 className="text-lg tracking-tight">
                  {isEditMode ? "Tùy chỉnh Tính Năng" : "Thêm Tính Năng Mới"}
                </h2>
                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5 italic">Cấu hình hệ thống Catalog</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} id="feature-form" className="flex-1 flex flex-col h-full bg-gray-50/10 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tên tính năng <span className="text-red-500">*</span></label>
                    <input name="featureName" value={formData.featureName} onChange={handleChange} placeholder="VD: Màn hình cảm ứng 15.6 inch" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-gray-900 shadow-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nhóm cấu hình <span className="text-red-500">*</span></label>
                      <input name="category" value={formData.category} onChange={handleChange} placeholder="VD: Nội thất, Ngoại thất" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-gray-900 text-sm shadow-sm" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Loại hệ thống</label>
                      <input name="featureType" value={formData.featureType} onChange={handleChange} placeholder="VD: STANDARD, OPTION" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-gray-900 uppercase text-xs shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả kỹ thuật</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Cung cấp mô tả chi tiết về cơ chế hoạt động hoặc thiết kế..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800 text-sm resize-none shadow-sm h-32" />
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                    Tính năng này sẽ được áp dụng cho toàn bộ danh mục sau khi khởi tạo. Bạn có thể gán tính năng này cho các mẫu xe cụ thể trong phần quản lý chi tiết.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10">
                {error && <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl flex items-center gap-2 shadow-sm italic uppercase"><FiInfo className="w-4 h-4" /> {error}</div>}
                <div className="flex gap-2.5">
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs uppercase tracking-tighter">Hủy</button>
                  <button type="submit" disabled={isLoading} className="flex-[2] px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-50 hover:bg-indigo-700 disabled:opacity-50 transition-all text-xs uppercase tracking-tighter italic">
                    {isLoading ? <Spin size="small" /> : isEditMode ? "Cập nhật thay đổi" : "Khởi tạo tính năng"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default FeatureFormModal;
