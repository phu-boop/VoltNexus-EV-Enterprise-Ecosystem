import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiX,
  FiInfo,
  FiLayers,
  FiTag,
  FiPlus,
  FiCheckCircle,
  FiBatteryCharging,
  FiZap,
  FiMap,
  FiExternalLink
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ModelDetailsModal = ({ isOpen, onClose, model }) => {
  const [activeTab, setActiveTab] = useState("general");
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset scroll and tab when model changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("general");
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, model?.modelId]);

  if (!isOpen || !model) return null;

  let specifications = {};
  if (model.specificationsJson) {
    try {
      specifications = JSON.parse(model.specificationsJson);
    } catch (error) {
      console.error("Lỗi parse JSON:", error);
    }
  }

  const tabs = [
    { id: "general", label: "Tổng quan", icon: FiInfo },
    { id: "specs", label: "Thông số", icon: FiTag },
    { id: "variants", label: "Phiên bản", icon: FiLayers }
  ];
  if (model.extendedSpecs && Object.keys(model.extendedSpecs).length > 0) {
    tabs.push({ id: "extended", label: "Mở rộng", icon: FiPlus });
  }

  const portalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="bg-white shadow-2xl w-full max-w-2xl h-full flex flex-col overflow-hidden ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white z-20 shadow-sm shrink-0">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1.5 italic">{model.brand}</p>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">{model.modelName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {/* Top Image Section */}
            <div className="bg-white p-6 border-b border-gray-100 flex flex-col items-center">
              <div className="relative w-full aspect-[16/10] bg-gray-50/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner group">
                {model.thumbnailUrl ? (
                  <img
                    src={model.thumbnailUrl}
                    alt={`${model.brand} ${model.modelName}`}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 drop-shadow-lg"
                  />
                ) : (
                  <div className="text-gray-300 font-bold uppercase tracking-widest text-xs">No Image</div>
                )}

                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border ${model.status === "IN_PRODUCTION" ? "bg-indigo-600 text-white border-indigo-400" :
                    model.status === "COMING_SOON" ? "bg-blue-500 text-white border-blue-400" :
                      "bg-slate-500 text-white border-slate-400"
                    }`}>
                    {model.status === "IN_PRODUCTION" ? "Đang sản xuất" :
                      model.status === "COMING_SOON" ? "Sắp ra mắt" : "Ngừng sản xuất"}
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full mt-6">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                  <FiMap className="w-3.5 h-3.5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Quãng đường</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{model.baseRangeKm || "N/A"}<span className="text-[8px] ml-0.5 text-gray-400">km</span></p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                  <FiZap className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Công suất</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{model.baseMotorPower || "N/A"}<span className="text-[8px] ml-0.5 text-gray-400">kW</span></p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                  <FiBatteryCharging className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pin</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{model.baseBatteryCapacity || "N/A"}<span className="text-[8px] ml-0.5 text-gray-400">kWh</span></p>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 z-10">
              <div className="flex space-x-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 z-10 ${activeTab === tab.id
                      ? "text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabDetail"
                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md z-[-1]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "general" && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                          <FiInfo className="text-indigo-500" />
                          Thông tin hệ thống
                        </h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                          {[
                            { label: "Mã Hệ thống", value: model.modelId, mono: true },
                            { label: "Thương hiệu", value: model.brand },
                            { label: "Tên dòng xe", value: model.modelName },
                            { label: "Tiêu chuẩn sạc", value: model.baseChargingTime ? `${model.baseChargingTime} giờ` : "N/A" }
                          ].map((item, idx) => (
                            <div key={idx}>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{item.label}</p>
                              <p className={`text-sm font-bold text-gray-900 ${item.mono ? "font-mono bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100" : ""}`}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "specs" && (
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Quãng đường cơ bản", value: model.baseRangeKm, unit: "km", icon: FiMap, color: "text-indigo-500", bg: "bg-indigo-50" },
                        { label: "Công suất cơ bản", value: model.baseMotorPower, unit: "kW", icon: FiZap, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Dung lượng PIN", value: model.baseBatteryCapacity, unit: "kWh", icon: FiBatteryCharging, color: "text-slate-500", bg: "bg-slate-50" },
                        { label: "Sạc chuẩn", value: model.baseChargingTime, unit: "giờ", icon: FiTag, color: "text-slate-400", bg: "bg-gray-50" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-indigo-100 transition-all">
                          <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                            <p className="text-xl font-black text-gray-900">
                              {item.value ? `${item.value} ` : <span className="text-gray-300 font-medium">N/A</span>}
                              {item.value && <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">{item.unit}</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "variants" && (
                    <div className="space-y-4">
                      {model.variants && model.variants.length > 0 ? (
                        model.variants.map((variant) => (
                          <div key={variant.variantId} className="bg-white p-6 border border-gray-100 rounded-3xl hover:border-indigo-100 shadow-sm transition-all group relative overflow-hidden">
                            {/* Nút điều hướng chi tiết */}
                            <button
                              onClick={() => {
                                const isAdmin = location.pathname.includes('/admin/');
                                const prefix = isAdmin ? '/evm/admin/products/variants' : '/evm/staff/products/variants';
                                navigate(`${prefix}?modelId=${model.modelId}&variantId=${variant.variantId}`);
                                onClose();
                              }}
                              className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white shadow-sm z-10"
                              title="Xem chi tiết tại trang quản lý"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tight">
                                  {variant.versionName}
                                </h4>
                                <p className="text-lg font-black text-indigo-600">
                                  {Number(variant.price).toLocaleString("vi-VN")} <span className="text-[10px] font-bold text-gray-400">VNĐ</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
                                  <span className="w-3.5 h-3.5 rounded-full border border-gray-200 block shadow-inner" style={{ backgroundColor: variant.color }}></span>
                                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">{variant.color}</span>
                                </div>
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1.5 rounded-xl border border-gray-100 uppercase">
                                  {variant.skuCode}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-50">
                              {variant.batteryCapacity && (
                                <div>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pin cụ thể</p>
                                  <p className="font-bold text-gray-900 text-sm">{variant.batteryCapacity} <span className="text-gray-400 text-[10px] ml-0.5">kWh</span></p>
                                </div>
                              )}
                              {variant.rangeKm && (
                                <div>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Quãng đường</p>
                                  <p className="font-bold text-gray-900 text-sm">{variant.rangeKm} <span className="text-gray-400 text-[10px] ml-0.5">km</span></p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                          <FiLayers className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                          <p className="text-sm font-bold text-gray-900">Chưa có phiên bản</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "extended" && model.extendedSpecs && (
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-gray-100">
                          {Object.entries(model.extendedSpecs).map(([key, value]) => (
                            <tr key={key} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="py-3.5 px-5 font-bold text-gray-400 uppercase tracking-tighter w-1/3 bg-gray-50/50 border-r border-gray-100">{key}</td>
                              <td className="py-3.5 px-5 text-gray-900 font-bold">{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-white shadow-sm flex gap-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white text-xs font-black rounded-xl shadow-xl shadow-gray-100 hover:bg-black transition-all uppercase tracking-widest italic"
            >
              Đóng cửa sổ
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};

export default ModelDetailsModal;
