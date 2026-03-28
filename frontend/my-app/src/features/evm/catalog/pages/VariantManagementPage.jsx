import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Eye,
  Search,
  Box,
  Layers,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  History,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getModels,
  getModelDetails,
  deactivateVariant,
} from "../services/vehicleCatalogService";
import { Spin } from "antd";
import VariantForm from "../components/VariantForm";
import ConfirmationModal from "../components/ConfirmationModal";
import FeatureAssignmentModal from "../components/FeatureAssignmentModal";
import VariantDetailsModal from "../../../../components/common/detail/VariantDetailsModal";
import VariantHistoryDrawer from "../components/VariantHistoryDrawer";

const STATUS_OPTIONS = {
  IN_PRODUCTION: { label: "Đang sản xuất", color: "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-50/50" },
  COMING_SOON: { label: "Sắp ra mắt", color: "bg-blue-50 text-blue-700 border-blue-100 shadow-sm shadow-blue-50/50" },
  DISCONTINUED: { label: "Ngừng sản xuất", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

const VariantManagementPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedModelDetails, setSelectedModelDetails] = useState(null);

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [variantToEdit, setVariantToEdit] = useState(null);
  const [variantToDeactivate, setVariantToDeactivate] = useState(null);

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [variantForFeatures, setVariantForFeatures] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [variantForDetails, setVariantForDetails] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [variantForHistory, setVariantForHistory] = useState(null);

  const [variantSearchQuery, setVariantSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const urlModelId = searchParams.get("modelId");
  const urlVariantId = searchParams.get("variantId");

  useEffect(() => {
    const fetchAllModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await getModels();
        const responseData = response.data?.data;

        let modelsArray = [];
        if (Array.isArray(responseData)) {
          modelsArray = responseData;
        } else if (responseData?.content && Array.isArray(responseData.content)) {
          modelsArray = responseData.content;
        }

        setModels(modelsArray);
      } catch (error) {
        console.error("Failed to fetch models", error);
        setModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchAllModels();
  }, []);

  const fetchVariantsForModel = useCallback(async () => {
    if (!selectedModelId) {
      setSelectedModelDetails(null);
      return;
    }
    try {
      setIsLoadingVariants(true);
      const response = await getModelDetails(selectedModelId);
      setSelectedModelDetails(response.data.data);
    } catch (error) {
      console.error("Failed to fetch model details", error);
      setSelectedModelDetails(null);
    } finally {
      setIsLoadingVariants(false);
    }
  }, [selectedModelId]);

  // Xử lý deep-linking từ URL params
  useEffect(() => {
    if (urlModelId && models.length > 0) {
      setSelectedModelId(urlModelId);
    }
  }, [urlModelId, models]);

  useEffect(() => {
    if (urlVariantId && selectedModelDetails?.variants) {
      const variant = selectedModelDetails.variants.find(
        (v) => v.variantId.toString() === urlVariantId
      );
      if (variant) {
        setVariantForDetails(variant);
        setIsDetailsOpen(true);
      }
    }
  }, [urlVariantId, selectedModelDetails]);

  useEffect(() => {
    fetchVariantsForModel();
  }, [fetchVariantsForModel]);

  const handleOpenAddForm = () => {
    setVariantToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (variant) => {
    setVariantToEdit(variant);
    setIsFormOpen(true);
  };

  const handleOpenConfirmModal = (variant) => {
    setVariantToDeactivate(variant);
    setIsConfirmOpen(true);
  };

  const handleOpenFeatureModal = (variant) => {
    setVariantForFeatures(variant);
    setIsFeatureModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormOpen(false);
    setIsConfirmOpen(false);
    setIsFeatureModalOpen(false);
    setIsDetailsOpen(false);
    setIsHistoryOpen(false);
    setVariantToEdit(null);
    setVariantToDeactivate(null);
    setVariantForFeatures(null);
    setVariantForDetails(null);
    setVariantForHistory(null);
  };

  const handleOpenDetailsModal = (variant) => {
    setVariantForDetails(variant);
    setIsDetailsOpen(true);
  };

  const handleOpenHistoryDrawer = (variant) => {
    setVariantForHistory(variant);
    setIsHistoryOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!variantToDeactivate) return;
    try {
      await deactivateVariant(variantToDeactivate.variantId);
      fetchVariantsForModel();
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể ngừng sản xuất phiên bản này.", "error");
    } finally {
      handleCloseModals();
    }
  };

  const filteredVariants = selectedModelDetails
    ? selectedModelDetails.variants.filter((variant) => {
      const query = variantSearchQuery.toLowerCase().trim();
      const versionName = (variant.versionName || "").toLowerCase();
      const color = (variant.color || "").toLowerCase();
      const skuCode = (variant.skuCode || "").toLowerCase();
      return versionName.includes(query) || color.includes(query) || skuCode.includes(query);
    })
    : [];

  return (
    <div className="min-h-screen bg-neutral-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 m-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
            <Layers className="w-5 h-5 shadow-lg shadow-indigo-100 rounded-lg" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-black italic">
              Hệ thống Biến thể v3.0
            </span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Biến thể & <span className="text-indigo-600 font-thin italic">Phiên bản</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={fetchVariantsForModel}
            disabled={!selectedModelId || isLoadingVariants}
            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingVariants ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddForm}
            disabled={!selectedModelId}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-widest italic"
          >
            <Plus className="w-4 h-4" /> Khởi tạo ngay
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Model Selection Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 ml-5"
        >
          <div className="flex items-center gap-2 mb-6">
            <Box className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 tracking-tight italic uppercase text-sm">Mẫu xe cơ sở</h3>
          </div>

          <div className="space-y-2">
            {isLoadingModels ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-neutral-50 animate-pulse rounded-2xl w-full" />
              ))
            ) : (
              models.map((model) => (
                <button
                  key={model.modelId}
                  onClick={() => setSelectedModelId(model.modelId)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedModelId === model.modelId
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xl shadow-indigo-50/50"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedModelId === model.modelId ? "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" : "bg-slate-200"}`} />
                    <span className="text-sm tracking-tight">{model.brand} {model.modelName}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedModelId === model.modelId ? "translate-x-1" : ""}`} />
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Variants Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8  bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden min-h-[500px]"
        >
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-neutral-800">
              {selectedModelDetails
                ? `Các phiên bản của ${selectedModelDetails.brand} ${selectedModelDetails.modelName}`
                : "Chọn một mẫu xe để xem các phiên bản"}
            </h2>

            {selectedModelId && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  value={variantSearchQuery}
                  onChange={(e) => setVariantSearchQuery(e.target.value)}
                  placeholder="Lọc phiên bản..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            )}
          </div>

          <div className="p-0">
            {isLoadingVariants ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <Spin size="large" />
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest italic">Đang tải các phiên bản...</p>
              </div>
            ) : selectedModelDetails && selectedModelDetails.variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50/30 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      <th className="px-8 py-4">Phiên bản</th>
                      <th className="px-6 py-4">Giá dự kiến</th>
                      <th className="px-6 py-4">Mã SKU</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-8 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <AnimatePresence mode="popLayout">
                      {filteredVariants.map((variant) => (
                        <motion.tr
                          key={variant.variantId}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group hover:bg-neutral-50/50 transition-all"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-neutral-800">{variant.versionName}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-3 h-3 rounded-full border border-neutral-200" style={{ backgroundColor: variant.color === 'White' ? '#fff' : variant.color === 'Black' ? '#000' : variant.color }} />
                                <span className="text-xs text-neutral-500">{variant.color}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono font-medium text-neutral-700">
                              {Number(variant.price).toLocaleString("vi-VN")} <span className="text-[10px] text-neutral-400">VND</span>
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <code className="bg-neutral-100 px-2 py-1 rounded text-xs text-neutral-600 font-mono">
                              {variant.skuCode}
                            </code>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm ${STATUS_OPTIONS[variant.status]?.color || "bg-neutral-100 text-neutral-600"
                                }`}
                            >
                              {STATUS_OPTIONS[variant.status]?.label || variant.status}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenDetailsModal(variant)}
                                className="p-2 text-neutral-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenFeatureModal(variant)}
                                className="p-2 text-neutral-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                                title="Quản lý tính năng"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenHistoryDrawer(variant)}
                                className="p-2 text-neutral-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                                title="Xem lịch sử thay đổi"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(variant)}
                                className="p-2 text-neutral-500 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all cursor-pointer"
                                title="Chỉnh sửa phiên bản"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenConfirmModal(variant)}
                                className="p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                                title="Ngừng sản xuất"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {filteredVariants.length === 0 && variantSearchQuery && (
                  <div className="p-20 text-center">
                    <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-neutral-300" />
                    </div>
                    <p className="text-neutral-500">Không tìm thấy phiên bản nào khớp với "{variantSearchQuery}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-24 text-center">
                <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {selectedModelId ? <Info className="w-10 h-10 text-neutral-300" /> : <Layers className="w-10 h-10 text-neutral-300" />}
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-2">
                  {selectedModelId ? "Không tìm thấy phiên bản nào" : "Chưa chọn mẫu xe"}
                </h3>
                <p className="text-neutral-500 max-w-xs mx-auto">
                  {selectedModelId
                    ? "Mẫu xe này chưa có phiên bản nào. Hãy bắt đầu bằng cách thêm mới."
                    : "Vui lòng chọn một mẫu xe từ thanh bên để xem và quản lý các phiên bản."}
                </p>
                {selectedModelId && (
                  <button
                    onClick={handleOpenAddForm}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                  >
                    Thêm phiên bản đầu tiên +
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <VariantForm
          isOpen={isFormOpen}
          onClose={handleCloseModals}
          onSuccess={() => {
            fetchVariantsForModel();
            handleCloseModals();
          }}
          modelId={selectedModelId}
          variant={variantToEdit}
        />
      )}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={handleCloseModals}
          onConfirm={handleDeactivateConfirm}
          title="Xác nhận ngừng sản xuất"
          message={`Bạn có chắc chắn muốn ngừng sản xuất phiên bản "${variantToDeactivate?.versionName} - ${variantToDeactivate?.color}" không? Hành động này tuân theo các giao thức hủy kích hoạt tiêu chuẩn.`}
        />
      )}
      {isFeatureModalOpen && (
        <FeatureAssignmentModal
          isOpen={isFeatureModalOpen}
          onClose={handleCloseModals}
          variant={variantForFeatures}
          onSuccess={fetchVariantsForModel}
        />
      )}
      {isDetailsOpen && (
        <VariantDetailsModal
          isOpen={isDetailsOpen}
          onClose={handleCloseModals}
          variant={variantForDetails}
        />
      )}
      <VariantHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={handleCloseModals}
        variantId={variantForHistory?.variantId}
        variantName={variantForHistory?.versionName}
      />
    </div>
  );
};

export default VariantManagementPage;
