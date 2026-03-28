import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
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
  getAllVariantsPaginated,
  getVariantDetails,
  deactivateVariant,
  deleteVariantsBulk,
} from "../services/vehicleCatalogService";
import { Spin, Pagination, Checkbox } from "antd";
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

  const [variants, setVariants] = useState([]);
  const [totalVariants, setTotalVariants] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const [variantSearchQuery, setVariantSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  const fetchVariants = useCallback(async (page = 1, size = pageSize, query = variantSearchQuery, modelId = selectedModelId) => {
    try {
      setIsLoadingVariants(true);
      const params = { page: page - 1, size };
      if (query) params.search = query;
      if (modelId) params.modelId = modelId;

      const response = await getAllVariantsPaginated(params);
      const data = response.data?.data;
      if (data?.content) {
        setVariants(data.content);
        setTotalVariants(data.totalElements);
      } else {
        setVariants([]);
        setTotalVariants(0);
      }
    } catch (error) {
      console.error("Failed to fetch variants", error);
      setVariants([]);
      setTotalVariants(0);
    } finally {
      setIsLoadingVariants(false);
    }
  }, [pageSize, variantSearchQuery, selectedModelId]);

  // Xử lý deep-linking từ URL params
  useEffect(() => {
    if (urlModelId && models.length > 0) {
      setSelectedModelId(urlModelId);
    }
  }, [urlModelId, models]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVariants(currentPage, pageSize, variantSearchQuery, selectedModelId);
    }, 500);
    return () => clearTimeout(timer);
  }, [variantSearchQuery, currentPage, pageSize, selectedModelId, fetchVariants]);

  useEffect(() => {
    const loadDeepLinkedVariant = async () => {
      if (urlVariantId && !variantForDetails) {
        try {
          const response = await getVariantDetails(urlVariantId);
          if (response.data?.data) {
            setVariantForDetails(response.data.data);
            setIsDetailsOpen(true);
          }
        } catch (err) {
          console.error("Failed to fetch deep linked variant details:", err);
        }
      }
    };
    loadDeepLinkedVariant();
  }, [urlVariantId, variantForDetails]);

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

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIdsOnPage = variants.map(v => v.variantId);
      setSelectedIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
    } else {
      const allIdsOnPage = variants.map(v => v.variantId);
      setSelectedIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await deleteVariantsBulk(selectedIds);
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      fetchVariants(currentPage, pageSize, variantSearchQuery, selectedModelId);
    } catch (err) {
      Swal.fire("Lỗi", "Không thể xóa các phiên bản đã chọn.", "error");
    }
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
      fetchVariants();
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể ngừng sản xuất phiên bản này.", "error");
    } finally {
      handleCloseModals();
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="min-h-screen bg-neutral-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 m-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold mb-1.5">
                <div className="w-6 h-0.5 bg-indigo-600 rounded-full"></div>
                <span className="uppercase tracking-widest text-[10px]">Cấu hình kỹ thuật</span>
              </div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Quản lý <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">Phiên bản</span>
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => fetchVariants()}
            disabled={isLoadingVariants}
            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingVariants ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-widest italic"
          >
            <Plus className="w-4 h-4" /> Khởi tạo ngay
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-5">
        {/* Model Selection Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 ml-5 h-full"
        >
          <div className="flex items-center gap-2 mb-6">
            <Box className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 tracking-tight italic uppercase text-sm">Lọc theo mẫu xe</h3>
          </div>

          <div className="space-y-2 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingModels ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-neutral-50 animate-pulse rounded-2xl w-full" />
              ))
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedModelId("");
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedModelId === ""
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xl shadow-indigo-50/50"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedModelId === "" ? "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" : "bg-slate-200"}`} />
                    <span className="text-sm tracking-tight text-left">Tất cả mẫu xe</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedModelId === "" ? "translate-x-1" : ""}`} />
                </button>
                {models.map((model) => (
                  <button
                    key={model.modelId}
                    onClick={() => {
                      setSelectedModelId(model.modelId);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedModelId === model.modelId
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xl shadow-indigo-50/50"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${selectedModelId === model.modelId ? "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" : "bg-slate-200"}`} />
                      <span className="text-sm tracking-tight text-left">{model.brand} {model.modelName}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedModelId === model.modelId ? "translate-x-1" : ""}`} />
                  </button>
                ))}
              </>
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
            <h2 className="text-xl font-bold text-neutral-800">Danh sách phiên bản</h2>

            {/* Bulk Action Bar */}
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-between text-white gap-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-black text-[10px] uppercase tracking-widest italic whitespace-nowrap">Đã chọn {selectedIds.length} mục</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedIds([])}
                      className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => setIsBulkConfirmOpen(true)}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa nhanh
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={variantSearchQuery}
                onChange={(e) => {
                  setVariantSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Lọc phiên bản..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <div className="p-0">
            {isLoadingVariants ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <Spin size="large" />
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest italic">Đang tải các phiên bản...</p>
              </div>
            ) : variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50/30 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      <th className="px-8 py-4 w-10">
                        <Checkbox
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          checked={variants.length > 0 && variants.every(v => selectedIds.includes(v.variantId))}
                          indeterminate={variants.some(v => selectedIds.includes(v.variantId)) && !variants.every(v => selectedIds.includes(v.variantId))}
                        />
                      </th>
                      <th className="px-8 py-4">Phiên bản</th>
                      <th className="px-6 py-4">Giá dự kiến</th>
                      <th className="px-6 py-4">Mã SKU</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-8 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <AnimatePresence mode="popLayout">
                      {variants.map((variant) => (
                        <motion.tr
                          key={variant.variantId}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`group hover:bg-neutral-50/50 transition-all ${selectedIds.includes(variant.variantId) ? 'bg-indigo-50/30' : ''}`}
                        >
                          <td className="px-8 py-5">
                            <Checkbox
                              checked={selectedIds.includes(variant.variantId)}
                              onChange={() => handleSelectItem(variant.variantId)}
                            />
                          </td>
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
                <div className="flex justify-center md:justify-end mt-6 pb-2 px-6">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalVariants}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50']}
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phiên bản`}
                    className="custom-pagination"
                  />
                </div>
              </div>
            ) : (
              <div className="p-24 text-center">
                <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-2">Không tìm thấy phiên bản nào</h3>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals & Drawers */}
      {isFormOpen && (
        <VariantForm
          isOpen={isFormOpen}
          onClose={handleCloseModals}
          onSuccess={() => {
            fetchVariants();
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
          onSuccess={() => fetchVariants()}
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

      {isBulkConfirmOpen && (
        <ConfirmationModal
          isOpen={isBulkConfirmOpen}
          onClose={() => setIsBulkConfirmOpen(false)}
          onConfirm={handleBulkDelete}
          title="Xác nhận xóa hàng loạt"
          message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} phiên bản đã chọn không? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
};

export default VariantManagementPage;
