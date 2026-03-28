import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX, FiArrowRight, FiTrash2, FiLoader, FiCheckCircle, FiMinusCircle, FiLayout } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import Swal from "sweetalert2";
import {
  getAllFeatures,
  assignFeatureToVariant,
  unassignFeatureFromVariant,
} from "../services/vehicleCatalogService";

const FeatureAssignmentModal = ({ isOpen, onClose, variant, onSuccess }) => {
  const [allFeatures, setAllFeatures] = useState([]);
  const [assignedFeatures, setAssignedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchAll = async () => {
        try {
          setIsLoading(true); setError("");
          const response = await getAllFeatures();
          setAllFeatures(response.data.data || []);
          setAssignedFeatures(variant.features || []);
        } catch (err) {
          setError("Không thể tải danh sách tính năng.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAll();
    }
  }, [isOpen, variant]);

  const handleAssign = async (featureToAssign) => {
    const featureData = {
      featureId: featureToAssign.featureId,
      standard: true,
      additionalCost: 0,
    };
    try {
      await assignFeatureToVariant(variant.variantId, featureData);
      setAssignedFeatures([...assignedFeatures, { ...featureToAssign, ...featureData }]);
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể gán tính năng.", "error");
    }
  };

  const handleUnassign = async (featureToUnassign) => {
    try {
      await unassignFeatureFromVariant(variant.variantId, featureToUnassign.featureId);
      setAssignedFeatures(assignedFeatures.filter((f) => f.featureId !== featureToUnassign.featureId));
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể bỏ gán tính năng.", "error");
    }
  };

  const availableFeatures = allFeatures.filter((feature) => !assignedFeatures.some((assigned) => assigned.featureId === feature.featureId));

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
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
          className="relative bg-white shadow-2xl w-full max-w-3xl h-full flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white z-10 shadow-sm shrink-0">
            <div>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mb-1">Cấu hình thành phần</p>
              <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                {variant.versionName} <span className="text-gray-400 font-medium ml-2 text-xs italic">({variant.color})</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center py-24 bg-gray-50/10">
              <Spin size="large" />
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mt-4 italic">Đang đồng bộ hóa cấu hình...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col justify-center items-center bg-red-50/20 py-32">
              <FiX className="w-10 h-10 text-red-500 mb-4" />
              <p className="text-red-500 px-8 text-center font-bold text-sm tracking-tight">{error}</p>
            </div>
          ) : (
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden bg-gray-50/10 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Column 1: Available */}
              <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
                <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                    Kho linh kiện & thiết bị
                  </h3>
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-indigo-100 italic">{availableFeatures.length}</span>
                </div>
                <ul className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/30 scroll-smooth">
                  <AnimatePresence>
                    {availableFeatures.map((feature) => (
                      <motion.li
                        key={feature.featureId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        layout
                        className="group p-3.5 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all flex justify-between items-center cursor-default transform hover:-translate-y-0.5"
                      >
                        <div className="max-w-[80%]">
                          <p className="font-bold text-gray-900 mb-1 leading-tight text-sm truncate">{feature.featureName}</p>
                          <p className="text-[9px] font-black text-indigo-500 tracking-wider uppercase bg-indigo-50 inline-block px-1.5 py-0.5 rounded shadow-sm italic">{feature.category}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(feature)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-100 shrink-0"
                          title="Gán tính năng"
                        >
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {availableFeatures.length === 0 && (
                    <div className="text-center py-20 px-4">
                      <FiCheckCircle className="w-10 h-10 text-indigo-400 mx-auto mb-4 opacity-30" />
                      <p className="text-sm font-black text-gray-900 italic uppercase">Hoàn tất trang bị</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Đã cấu hình toàn bộ tính năng khả dụng.</p>
                    </div>
                  )}
                </ul>
              </div>

              {/* Column 2: Assigned */}
              <div className="flex flex-col bg-white rounded-2xl border border-indigo-100 shadow-md overflow-hidden min-h-0">
                <div className="px-5 py-4 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center shadow-md">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                    Gói trang bị hiện tại
                  </h3>
                  <span className="bg-white text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg italic">{assignedFeatures.length}</span>
                </div>
                <ul className="flex-1 overflow-y-auto p-4 space-y-2 bg-indigo-50/10 scroll-smooth">
                  <AnimatePresence>
                    {assignedFeatures.map((feature) => (
                      <motion.li
                        key={feature.featureId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        layout
                        className="group p-3.5 bg-white border border-indigo-50 rounded-xl hover:border-red-200 hover:bg-red-50/30 hover:shadow-md transition-all flex justify-between items-center cursor-default"
                      >
                        <div className="max-w-[80%]">
                          <p className="font-bold text-gray-900 mb-1 leading-tight text-sm truncate">{feature.featureName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black text-slate-500 tracking-wider uppercase bg-slate-50 inline-block px-1.5 py-0.5 rounded shadow-sm italic">Tiêu chuẩn</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassign(feature)}
                          className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-300 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm opacity-50 group-hover:opacity-100 hover:shadow-lg hover:shadow-red-100 shrink-0"
                          title="Bỏ gán"
                        >
                          <FiMinusCircle className="w-5 h-5" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {assignedFeatures.length === 0 && (
                    <div className="text-center py-10 px-4">
                      <FiLayout className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-xs font-black text-gray-400 italic uppercase">Chưa có trang bị</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">Sử dụng kho linh kiện để bổ sung cấu hình.</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10 shrink-0">
            <button
              onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3 bg-gray-900 text-white text-xs font-black rounded-xl shadow-xl shadow-gray-100 hover:bg-black transition-all uppercase tracking-tighter italic"
            >
              Phê duyệt & Đồng bộ cấu hình
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default FeatureAssignmentModal;
