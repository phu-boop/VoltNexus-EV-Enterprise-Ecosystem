import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FiX, FiPlus, FiTrash2, FiChevronDown, FiInfo, FiTag, FiLayers, FiSettings, FiImage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import {
  createModelWithVariants,
  updateModel,
} from "../services/vehicleCatalogService";

const SPEC_TEMPLATES = [
  { key: "Động cơ", value: "VD: Electric 150kW" },
  { key: "Công suất tối đa", value: "VD: 201 (mã lực)" },
  { key: "Mô-men xoắn cực đại", value: "VD: 310 (Nm)" },
  { key: "Dung lượng pin", value: "VD: 77 (kWh)" },
  { key: "Quãng đường di chuyển", value: "VD: 420 (km)" },
  { key: "Thời gian sạc nhanh", value: "VD: 25 (phút)" },
  { key: "Kích thước (D x R x C)", value: "VD: 4750 x 1921 x 1624 (mm)" },
  { key: "Chiều dài cơ sở", value: "VD: 2950 (mm)" },
];

const STATUS_OPTIONS = {
  COMING_SOON: "Sắp ra mắt",
  IN_PRODUCTION: "Đang sản xuất",
  DISCONTINUED: "Ngừng sản xuất",
};

const SpecificationInputs = ({ specifications, onChange, onAdd, onRemove, onSelectTemplate }) => {
  return (
    <div className="space-y-4">
      {specifications.map((spec, index) => (
        <div key={index} className="flex items-start gap-3 group">
          <div className="flex-1 relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 shadow-sm transition-all">
            <input
              type="text"
              placeholder="Tên thuộc tính"
              value={spec.key}
              onChange={(e) => onChange(index, "key", e.target.value)}
              className="px-4 py-2.5 w-full outline-none bg-transparent rounded-l-xl text-sm font-medium text-gray-900 placeholder-gray-400"
            />
            <div className="relative group/dropdown h-full">
              <button
                type="button"
                className="px-3 border-l border-gray-200 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-r-xl transition-colors text-gray-500"
              >
                <FiChevronDown />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-20 overflow-hidden">
                <div className="py-2 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Gợi ý mẫu</div>
                  {SPEC_TEMPLATES.map((template) => (
                    <button
                      key={template.key}
                      type="button"
                      onClick={() => onSelectTemplate(index, template)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {template.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder={spec.placeholder || "Giá trị"}
              value={spec.value}
              onChange={(e) => onChange(index, "value", e.target.value)}
              className="px-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm transition-all text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Xóa thuộc tính"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm w-fit mt-2"
      >
        <FiPlus className="mr-2 w-4 h-4" /> Thêm thuộc tính
      </button>
    </div>
  );
};

const ModelForm = ({ isOpen, onClose, onSuccess, model }) => {
  const isEditMode = !!model;
  const contentRef = useRef(null);

  const initialFormState = {
    modelName: "", brand: "", thumbnailUrl: "", status: "",
    baseRangeKm: "", baseMotorPower: "", baseBatteryCapacity: "", baseChargingTime: "",
    extendedSpecifications: [{ key: "", value: "", placeholder: "" }],
    variants: [
      { versionName: "", color: "", price: "", skuCode: "", imageUrl: "", batteryCapacity: "", rangeKm: "", motorPower: "", status: "IN_PRODUCTION" },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (isEditMode && model) {
      let extendedSpecsArray = [];
      if (model.extendedSpecs) {
        extendedSpecsArray = Object.entries(model.extendedSpecs).map(([key, value]) => ({ key, value: String(value) }));
      }
      setFormData({
        modelName: model.modelName || "",
        brand: model.brand || "",
        thumbnailUrl: model.thumbnailUrl || "",
        status: model.status || "",
        baseRangeKm: model.baseRangeKm || "",
        baseMotorPower: model.baseMotorPower || "",
        baseBatteryCapacity: model.baseBatteryCapacity || "",
        baseChargingTime: model.baseChargingTime || "",
        extendedSpecifications: extendedSpecsArray.length > 0 ? extendedSpecsArray : [{ key: "", value: "", placeholder: "" }],
        variants: initialFormState.variants,
      });
    } else {
      setFormData(initialFormState);
    }
    setActiveTab("general");
  }, [isEditMode, model, isOpen]);

  const handleModelChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleExtendedSpecChange = (index, field, value) => {
    const newSpecs = [...formData.extendedSpecifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, extendedSpecifications: newSpecs });
  };
  const addExtendedSpec = () => {
    setFormData({ ...formData, extendedSpecifications: [...formData.extendedSpecifications, { key: "", value: "", placeholder: "" }] });
  };
  const removeExtendedSpec = (index) => {
    const newSpecs = formData.extendedSpecifications.filter((_, i) => i !== index);
    setFormData({ ...formData, extendedSpecifications: newSpecs.length ? newSpecs : [{ key: "", value: "", placeholder: "" }] });
  };
  const handleSelectExtendedSpecTemplate = (index, template) => {
    const newSpecs = [...formData.extendedSpecifications];
    newSpecs[index].key = template.key;
    newSpecs[index].placeholder = template.value;
    newSpecs[index].value = "";
    setFormData({ ...formData, extendedSpecifications: newSpecs });
  };

  const handleVariantChange = (index, e) => {
    const newVariants = [...formData.variants];
    newVariants[index][e.target.name] = e.target.value;
    setFormData({ ...formData, variants: newVariants });
  };
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { versionName: "", color: "", price: "", skuCode: "", imageUrl: "", batteryCapacity: "", rangeKm: "", motorPower: "", status: "IN_PRODUCTION" }],
    });
  };
  const removeVariant = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    const extendedSpecsObject = formData.extendedSpecifications
      .filter((spec) => spec.key.trim() !== "")
      .reduce((obj, spec) => { obj[spec.key] = spec.value; return obj; }, {});

    const payload = {
      modelName: formData.modelName, brand: formData.brand, thumbnailUrl: formData.thumbnailUrl, status: formData.status || "COMING_SOON",
      baseRangeKm: Number(formData.baseRangeKm) || null, baseMotorPower: Number(formData.baseMotorPower) || null,
      baseBatteryCapacity: Number(formData.baseBatteryCapacity) || null, baseChargingTime: Number(formData.baseChargingTime) || null,
      extendedSpecs: extendedSpecsObject,
    };

    try {
      if (isEditMode) {
        await updateModel(model.modelId, payload);
      } else {
        const hasVariants = formData.variants.some(v => v.versionName.trim() !== "");
        const variantsPayload = hasVariants ? formData.variants.filter(v => v.versionName.trim() !== "").map((v) => ({
          versionName: v.versionName, color: v.color, price: Number(v.price) || 0, skuCode: v.skuCode, imageUrl: v.imageUrl,
          batteryCapacity: Number(v.batteryCapacity) || null, baseChargingTime: Number(v.baseChargingTime) || null,
          rangeKm: Number(v.rangeKm) || null, motorPower: Number(v.motorPower) || null, status: v.status || "IN_PRODUCTION",
        })) : [];

        await createModelWithVariants({ ...payload, createdBy: "evm.staff@example.com", variants: variantsPayload });
      }
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const sidebarTabs = [
    { id: "general", label: "Thông tin chung", icon: FiInfo },
    { id: "specs", label: "Thông số kỹ thuật", icon: FiSettings },
    { id: "extended", label: "Mở rộng", icon: FiTag },
    ...(isEditMode ? [] : [{ id: "variants", label: "Phiên bản (Tùy chọn)", icon: FiLayers }])
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(`section-${id}`);
    const container = contentRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: relativeTop,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  const portalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex justify-end"
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
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-20 shadow-sm shrink-0">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {isEditMode ? "Tùy chỉnh Mẫu Xe" : "Tạo Mẫu Xe Mới"}
              </h2>
              {isEditMode && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                  ID Hệ thống: <span className="text-indigo-600 select-all">{model.modelId}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden relative bg-gray-50/50">
            {/* Sidebar Navigation */}
            <div className="w-16 border-r border-gray-100 bg-white flex flex-col items-center py-6 shrink-0 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
              <nav className="space-y-4">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => scrollToSection(tab.id)}
                      className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all group ${activeTab === tab.id
                        ? "text-white"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600 shadow-none"
                        }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100"
                        />
                      )}
                      <Icon className="w-5 h-5 z-10" />

                      {/* Tooltip */}
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                        {tab.label}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Form Body with improved scroll detection */}
            <form id="vehicle-form" onSubmit={handleSubmit} className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden">
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200"
                onScroll={(e) => {
                  const container = e.target;
                  const scrollPos = container.scrollTop;
                  const containerTop = container.getBoundingClientRect().top;

                  const sections = sidebarTabs.map(t => ({
                    id: t.id,
                    el: document.getElementById(`section-${t.id}`)
                  }));

                  for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i].el;
                    if (section) {
                      const sectionTopRelative = section.getBoundingClientRect().top - containerTop;
                      if (sectionTopRelative <= 100) {
                        if (activeTab !== sections[i].id) setActiveTab(sections[i].id);
                        break;
                      }
                    }
                  }
                }}
              >
                {/* Section: General */}
                <section id="section-general" className="scroll-mt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">1</div>
                    <h3 className="text-lg font-bold text-gray-900">Thông tin chung</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên mẫu xe <span className="text-red-500">*</span></label>
                        <input name="modelName" value={formData.modelName} onChange={handleModelChange} placeholder="VD: VF 8" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hãng sản xuất <span className="text-red-500">*</span></label>
                        <input name="brand" value={formData.brand} onChange={handleModelChange} placeholder="VD: VinFast" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trạng thái phát hành</label>
                        <select name="status" value={formData.status} onChange={handleModelChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900 appearance-none">
                          <option value="">-- Mặc định (Sắp ra mắt) --</option>
                          {Object.entries(STATUS_OPTIONS).map(([val, text]) => (<option key={val} value={val}>{text}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL Ảnh đại diện</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><FiImage /></span>
                          <input name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleModelChange} placeholder="https://..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs text-gray-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section: Core Specs */}
                <section id="section-specs" className="scroll-mt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">2</div>
                    <h3 className="text-lg font-bold text-gray-900">Thông số chính</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { name: "baseRangeKm", label: "Quãng đường", placeholder: "km", icon: "🚗" },
                        { name: "baseMotorPower", label: "Công suất", placeholder: "kW", icon: "⚡" },
                        { name: "baseBatteryCapacity", label: "Dung lượng pin", placeholder: "kWh", icon: "🔋" },
                        { name: "baseChargingTime", label: "Thời gian sạc", placeholder: "giờ", icon: "⏱️" }
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{field.icon} {field.label}</label>
                          <div className="relative">
                            <input type="number" name={field.name} value={formData[field.name]} onChange={handleModelChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900" />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-[10px] font-bold uppercase">{field.placeholder}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section: Extended Specs */}
                <section id="section-extended" className="scroll-mt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold shadow-sm">3</div>
                    <h3 className="text-lg font-bold text-gray-900">Thông số mở rộng</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <SpecificationInputs
                      specifications={formData.extendedSpecifications}
                      onChange={handleExtendedSpecChange}
                      onAdd={addExtendedSpec}
                      onRemove={removeExtendedSpec}
                      onSelectTemplate={handleSelectExtendedSpecTemplate}
                    />
                  </div>
                </section>

                {/* Section: Variants (Only Create Mode) */}
                {!isEditMode && (
                  <section id="section-variants" className="scroll-mt-6 pb-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shadow-sm">4</div>
                      <h3 className="text-lg font-bold text-gray-900">Phiên bản ban đầu</h3>
                    </div>
                    <div className="space-y-5">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                          {formData.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(index)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-200"></div>
                          <h4 className="font-bold text-gray-900 mb-5 flex items-center text-sm">
                            <span className="bg-orange-100 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2">V{index + 1}</span>
                            Cấu hình phiên bản {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tên phiên bản</label>
                                <input name="versionName" value={variant.versionName} onChange={(e) => handleVariantChange(index, e)} placeholder="VD: Plus" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Màu sắc</label>
                                <input name="color" value={variant.color} onChange={(e) => handleVariantChange(index, e)} placeholder="VD: Đỏ" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mã SKU</label>
                              <input name="skuCode" value={variant.skuCode} onChange={(e) => handleVariantChange(index, e)} placeholder="VD: VF8-PLUS-RED" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono text-[10px] uppercase" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Giá niêm yết (VNĐ)</label>
                              <input type="number" name="price" value={variant.price} onChange={(e) => handleVariantChange(index, e)} placeholder="VD: 1250000000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-gray-900" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={addVariant} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm">
                        <FiPlus /> Thêm phiên bản khác
                      </button>
                    </div>
                  </section>
                )}
              </div>

              {/* Form Actions Footer */}
              <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10">
                {error && <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl flex items-center gap-2 italic uppercase"><FiInfo className="w-4 h-4" /> {error}</div>}
                <div className="flex gap-2.5">
                  <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs uppercase tracking-tighter">Hủy</button>
                  <button type="button" onClick={() => document.getElementById('vehicle-form').requestSubmit()} disabled={isLoading} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-50 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-tighter italic">
                    {isLoading ? <Spin size="small" /> : isEditMode ? "Cập nhật Model" : "Khởi tạo Model"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};

export default ModelForm;
