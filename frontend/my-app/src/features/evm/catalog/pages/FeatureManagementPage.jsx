import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Cpu,
  Tag,
  FileText,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Box,
  Eye,
} from "lucide-react";
import {
  getAllFeatures,
  deleteFeature,
} from "../services/vehicleCatalogService";
import { Spin } from "antd";
import FeatureFormModal from "../components/FeatureFormModal";
import ConfirmationModal from "../components/ConfirmationModal";
import FeatureVariantsModal from "../components/FeatureVariantsModal";

const FeatureManagementPage = () => {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [featureToEdit, setFeatureToEdit] = useState(null);
  const [featureToDelete, setFeatureToDelete] = useState(null);
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [selectedFeatureForVariants, setSelectedFeatureForVariants] = useState(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllFeatures();
      setFeatures(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Không thể tải thư viện tính năng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const handleOpenAddForm = () => {
    setFeatureToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (feature) => {
    setFeatureToEdit(feature);
    setIsFormOpen(true);
  };

  const handleOpenConfirmModal = (feature) => {
    setFeatureToDelete(feature);
    setIsConfirmOpen(true);
  };

  const handleCloseModals = () => {
    setFeatureToEdit(null);
    setFeatureToDelete(null);
    setIsVariantsOpen(false);
    setSelectedFeatureForVariants(null);
  };

  const handleOpenVariantsModal = (feature) => {
    setSelectedFeatureForVariants(feature);
    setIsVariantsOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!featureToDelete) return;
    try {
      await deleteFeature(featureToDelete.featureId);
      fetchFeatures();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Lỗi: Không thể xóa tính năng này. Có thể nó đang được sử dụng."
      );
    } finally {
      handleCloseModals();
    }
  };

  const filteredFeatures = features.filter((feature) => {
    const query = searchQuery.toLowerCase().trim();
    const name = (feature.featureName || "").toLowerCase();
    const category = (feature.category || "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  return (
    <div className="min-h-screen bg-neutral-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 m-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <Cpu className="w-6 h-6" />
            <span className="uppercase tracking-[0.3em] text-xs font-black italic">
              Hệ thống & Thành phần v2.0
            </span>
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Kho tính năng <span className="text-indigo-600 font-light italic -ml-1">Catalog</span>
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={fetchFeatures}
            disabled={isLoading}
            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 italic uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Khởi tạo ngay
          </button>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white mx-10 rounded-3xl shadow-sm border border-neutral-100 overflow-hidden"
      >
        {/* Search and Filters */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tính năng hoặc danh mục..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Box className="w-4 h-4" />
              <span>{features.length} Thành phần</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã xác thực</span>
            </div>
          </div>
        </div>

        {/* Table/List Area */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Spin size="large" />
              <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest italic">Đang đồng bộ hóa kho lưu trữ...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-bold mb-2">Đã xảy ra lỗi</p>
              <p className="text-neutral-500">{error}</p>
            </div>
          ) : filteredFeatures.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50/30 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  <th className="px-8 py-4">Chi tiết tính năng</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">ID hệ thống</th>
                  <th className="px-8 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <AnimatePresence mode="popLayout">
                  {filteredFeatures.map((feature) => (
                    <motion.tr
                      key={feature.featureId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/50 transition-all"
                    >
                      <td className="px-8 py-5">
                        <div
                          className="flex flex-col cursor-pointer group/name"
                          onClick={() => handleOpenVariantsModal(feature)}
                        >
                          <span className="font-bold text-neutral-800 text-base group-hover/name:text-indigo-600 transition-colors flex items-center gap-2">
                            {feature.featureName}
                            <Eye className="w-3 h-3 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                          </span>
                          <p className="text-sm text-neutral-500 mt-1 line-clamp-1 max-w-sm">
                            {feature.description || "Không có mô tả kỹ thuật."}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold border border-neutral-200">
                          <Tag className="w-3 h-3" />
                          {feature.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <code className="text-xs bg-neutral-50 text-neutral-400 px-2 py-1 rounded font-mono">
                          FT-{feature.featureId.toString().padStart(4, '0')}
                        </code>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenVariantsModal(feature)}
                            className="p-2.5 text-neutral-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                            title="Xem các biến thể"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(feature)}
                            className="p-2.5 text-neutral-500 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirmModal(feature)}
                            className="p-2.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                            title="Xóa"
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
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex p-6 bg-neutral-50 rounded-full mb-6">
                <Search className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-2">Không tìm thấy tính năng nào</h3>
              <p className="text-neutral-500">Kho lưu trữ không chứa thành phần nào khớp với tiêu chí của bạn.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      {isFormOpen && (
        <FeatureFormModal
          isOpen={isFormOpen}
          onClose={handleCloseModals}
          onSuccess={() => {
            fetchFeatures();
            handleCloseModals();
          }}
          feature={featureToEdit}
        />
      )}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={handleCloseModals}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa thành phần"
          message={`Bạn có chắc chắn muốn xóa vĩnh viễn "${featureToDelete?.featureName}" không? Thành phần này có thể được liên kết với các biến thể xe đang hoạt động.`}
        />
      )}
      {isVariantsOpen && (
        <FeatureVariantsModal
          isOpen={isVariantsOpen}
          onClose={handleCloseModals}
          feature={selectedFeatureForVariants}
        />
      )}
    </div>
  );
};

export default FeatureManagementPage;
