import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiImage,
  FiCheckCircle
} from "react-icons/fi";
import {
  getModels,
  searchModels,
  deactivateModel,
  getModelDetails,
  deleteModelsBulk,
} from "../services/vehicleCatalogService";
import { Spin, Pagination, Checkbox } from "antd";
import ModelForm from "../components/ModelForm";
import ConfirmationModal from "../components/ConfirmationModal";
import ModelDetailsModal from "../components/ModelDetailsModal";

const VehicleCatalogPage = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const urlModelId = searchParams.get("modelId");

  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState(null);
  const [modelForDetails, setModelForDetails] = useState(null);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isCascadeConfirmOpen, setIsCascadeConfirmOpen] = useState(false);
  const [cascadeContext, setCascadeContext] = useState(null);

  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalElements, setTotalElements] = useState(0);

  const fetchModels = useCallback(async (page = 1, size = pageSize, query = searchQuery) => {
    try {
      setIsLoading(true);
      const params = { page: page - 1, size };
      if (query) params.keyword = query;

      const response = await searchModels(params);
      const responseData = response.data?.data;

      if (responseData?.content) {
        setModels(responseData.content);
        setTotalElements(responseData.totalElements);
      } else {
        setModels([]);
        setTotalElements(0);
      }
      setError(null);
    } catch (err) {
      setError("Không thể tải danh mục xe. Vui lòng thử lại.");
      console.error(err);
      setModels([]);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModels(currentPage, pageSize, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage, pageSize, fetchModels]);

  useEffect(() => {
    if (urlModelId && models.length > 0) {
      handleViewDetails(urlModelId);
    }
  }, [urlModelId, models.length > 0]);

  const handleOpenForm = async (modelToEdit = null) => {
    if (!modelToEdit) {
      setSelectedModel(null);
      setIsFormOpen(true);
      return;
    }

    setIsDetailLoading(true);
    try {
      const response = await getModelDetails(modelToEdit.modelId);
      setSelectedModel(response.data.data);
      setIsFormOpen(true);
    } catch (err) {
      setError("Không thể tải dữ liệu chi tiết của mẫu xe để chỉnh sửa.");
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedModel(null);
  };

  const handleViewDetails = async (modelId) => {
    setIsDetailLoading(true);
    try {
      const response = await getModelDetails(modelId);
      setModelForDetails(response.data.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      setError("Không thể tải dữ liệu chi tiết của mẫu xe.");
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setModelForDetails(null);
  };

  const handleOpenConfirmModal = (model) => {
    setSelectedModel(model);
    setActionToConfirm(() => async (force = false) => {
      try {
        await deactivateModel(model.modelId, force);
        fetchModels();
        setIsConfirmModalOpen(false);
        setIsCascadeConfirmOpen(false);
      } catch (err) {
        if (err.response?.data?.code === '8004') {
          setIsConfirmModalOpen(false);
          setCascadeContext({ type: 'single' });
          setIsCascadeConfirmOpen(true);
        } else {
          setError("Không thể ngừng sản xuất mẫu xe này.");
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedModel(null);
    setActionToConfirm(null);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIdsOnPage = models.map(m => m.modelId);
      setSelectedIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
    } else {
      const allIdsOnPage = models.map(m => m.modelId);
      setSelectedIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async (force = false) => {
    try {
      await deleteModelsBulk(selectedIds, force);
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      setIsCascadeConfirmOpen(false);
      fetchModels(currentPage, pageSize, searchQuery);
    } catch (err) {
      if (err.response?.data?.code === '8004') {
        setIsBulkConfirmOpen(false);
        setCascadeContext({ type: 'bulk' });
        setIsCascadeConfirmOpen(true);
      } else {
        setError("Không thể xóa các mẫu xe đã chọn. Một số có thể có phiên bản xe đang hoạt động.");
      }
    }
  };

  const filteredModels = models;

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const renderGridView = () => (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {filteredModels.map((model, index) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              duration: 0.4,
              delay: index * 0.03,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            key={model.modelId}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative"
          >
            <Checkbox
              checked={selectedIds.includes(model.modelId)}
              onChange={(e) => handleSelectItem(model.modelId)}
              className="absolute top-3 left-3 z-10 scale-125"
            />
            <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              {model.thumbnailUrl ? (
                <img
                  src={model.thumbnailUrl}
                  alt={model.modelName}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <FiImage className="w-8 h-8 mb-2 opacity-30" />
                  <span className="text-[9px] font-black uppercase tracking-tight">No Image</span>
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 right-3 shadow-md">
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full backdrop-blur-md shadow-sm border ${model.status === "IN_PRODUCTION" ? "bg-indigo-600/90 text-white border-indigo-400" :
                  model.status === "COMING_SOON" ? "bg-blue-500/90 text-white border-blue-400" :
                    "bg-slate-500/90 text-white border-slate-400"
                  }`}>
                  {model.status === "IN_PRODUCTION" ? "SẢN XUẤT" :
                    model.status === "COMING_SOON" ? "SẮP RA MẮT" : "DỪNG"}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{model.brand}</p>
                <h2 className="text-lg font-bold text-gray-900 leading-tight mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {model.modelName}
                </h2>
              </div>

              <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(model.modelId)}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer rounded-xl transition-all flex-1 flex justify-center items-center group/btn"
                  title="Xem chi tiết"
                >
                  <FiEye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleOpenForm(model)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer rounded-xl transition-all flex-1 flex justify-center items-center group/btn"
                  title="Chỉnh sửa"
                >
                  <FiEdit className="w-4 h-4 group-hover/btn:scale-105 transition-transform" />
                </button>
                <button
                  onClick={() => handleOpenConfirmModal(model)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-xl transition-all flex-1 flex justify-center items-center group/btn"
                  title="Ngừng sản xuất"
                >
                  <FiTrash2 className="w-4 h-4 group-hover/btn:scale-105 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const renderListView = () => (
    <motion.div
      layout
      className="flex flex-col gap-4"
    >
      <AnimatePresence mode="popLayout">
        {filteredModels.map((model, index) => (
          <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{
              duration: 0.3,
              delay: index * 0.03
            }}
            key={model.modelId}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex items-center p-3 gap-4"
          >
            <Checkbox
              checked={selectedIds.includes(model.modelId)}
              onChange={(e) => handleSelectItem(model.modelId)}
              className="ml-2 scale-110"
            />
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-50">
              {model.thumbnailUrl ? (
                <img src={model.thumbnailUrl} alt={model.modelName} className="w-full h-full object-cover transition-transform duration-500" />
              ) : (
                <FiImage className="text-gray-300 w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{model.brand}</p>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-full border ${model.status === "IN_PRODUCTION" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                  model.status === "COMING_SOON" ? "bg-blue-50 text-blue-600 border-blue-100" :
                    "bg-slate-50 text-slate-600 border-slate-100"
                  }`}>
                  {model.status === "IN_PRODUCTION" ? "SẢN XUẤT" :
                    model.status === "COMING_SOON" ? "SẮP RA MẮT" : "DỪNG"}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {model.modelName}
              </h2>
              <div className="flex gap-4 mt-2">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">PHẠM VI: <span className="text-gray-900">{model.baseRangeKm || "N/A"} KM</span></div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">CÔNG SUẤT: <span className="text-gray-900">{model.baseMotorPower || "N/A"} KW</span></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(model.modelId)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group/btn"
                title="Xem chi tiết"
              >
                <FiEye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleOpenForm(model)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group/btn"
                title="Chỉnh sửa"
              >
                <FiEdit className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleOpenConfirmModal(model)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group/btn"
                title="Ngừng sản xuất"
              >
                <FiTrash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold mb-1.5">
            <div className="w-6 h-0.5 bg-indigo-600 rounded-full"></div>
            <span className="uppercase tracking-widest text-[10px]">Phân hệ Sản xuất</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Danh mục <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">Xe điện</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium italic">Quản lý dòng xe và cấu hình kỹ thuật.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 pt-4"
        >
          <button
            onClick={fetchModels}
            disabled={isLoading}
            className="p-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-6 h-6 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl shadow-slate-100 hover:bg-black transition-all font-bold active:scale-95 text-sm"
          >
            <FiPlus className="w-4 h-4" /> Thêm mẫu mới
          </button>
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm mẫu xe..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10 font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 text-sm"
          />
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            title="Dạng danh sách"
          >
            <div className="flex items-center gap-2 px-1">
              <span className="w-5 h-5 flex items-center justify-center font-bold">L</span>
              {viewMode === "list" && <span className="text-xs font-bold pr-1">List</span>}
            </div>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            title="Dạng lưới"
          >
            <div className="flex items-center gap-2 px-1">
              <span className="w-5 h-5 flex items-center justify-center font-bold">G</span>
              {viewMode === "grid" && <span className="text-xs font-bold pr-1">Grid</span>}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <Checkbox
            onChange={(e) => handleSelectAll(e.target.checked)}
            checked={models.length > 0 && models.every(m => selectedIds.includes(m.modelId))}
            indeterminate={models.some(m => selectedIds.includes(m.modelId)) && !models.every(m => selectedIds.includes(m.modelId))}
          />
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Chọn tất cả</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
          {totalElements} XE PHẢN HỒI
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiCheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-widest italic">Đã chọn {selectedIds.length} mẫu xe</p>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-tighter">Sẵn sàng để xóa hàng loạt</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                Hủy chọn
              </button>
              <button
                onClick={() => setIsBulkConfirmOpen(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95 cursor-pointer"
              >
                <FiTrash2 className="w-4 h-4" /> Xóa hàng loạt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between font-bold"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
        </motion.div>
      )}

      {/* Global Actions Loading Overlay */}
      <AnimatePresence>
        {isDetailLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-3"
          >
            <Spin size="large" />
            <span className="font-bold text-[10px] uppercase tracking-widest text-indigo-600">Đang đồng bộ...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full flex flex-col gap-4 animate-pulse">
              <div className="w-full h-40 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2 mt-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <React.Fragment>
          {filteredModels.length > 0 ? (
            <div className="flex flex-col gap-6 w-full">
              {viewMode === "grid" ? renderGridView() : renderListView()}

              <div className="flex justify-center md:justify-end mt-8 w-[98%] max-w-[1550px] mx-auto bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalElements}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={['8', '12', '24', '48']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} xe`}
                  className="custom-pagination"
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gray-50 border border-gray-100 rounded-3xl py-20 px-6 shadow-inner"
            >
              <div className="w-20 h-20 bg-white shadow-sm text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <FiSearch className="w-10 h-10" />
              </div>
              <p className="text-xl font-bold text-gray-900">Không tìm thấy mẫu xe nào</p>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">Thử thay đổi từ khóa tìm kiếm hoặc làm mới lại danh sách.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="mt-8 px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                Xóa bộ lọc
              </button>
            </motion.div>
          )}
        </React.Fragment>
      )}

      {isFormOpen && (
        <ModelForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSuccess={fetchModels}
          model={selectedModel}
        />
      )}

      {isDetailsModalOpen && (
        <ModelDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          model={modelForDetails}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={actionToConfirm}
          title="Xác nhận hành động"
          message={`Bạn có chắc chắn muốn ngừng sản xuất mẫu xe "${selectedModel?.brand} ${selectedModel?.modelName}" không? Lịch sử và dữ liệu vẫn được giữ lại nhưng xe sẽ không còn mua được.`}
        />
      )}

      {isBulkConfirmOpen && (
        <ConfirmationModal
          isOpen={isBulkConfirmOpen}
          onClose={() => setIsBulkConfirmOpen(false)}
          onConfirm={() => handleBulkDelete(false)}
          title="Xác nhận xóa hàng loạt"
          message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} mẫu xe đã chọn không? Hành động này sẽ xóa vĩnh viễn dữ liệu nếu không có phiên bản xe nào đang hoạt động.`}
        />
      )}

      {isCascadeConfirmOpen && (
        <ConfirmationModal
          isOpen={isCascadeConfirmOpen}
          onClose={() => {
            setIsCascadeConfirmOpen(false);
            setCascadeContext(null);
          }}
          onConfirm={async () => {
            if (cascadeContext?.type === 'bulk') {
              await handleBulkDelete(true);
            } else if (cascadeContext?.type === 'single' && actionToConfirm) {
              await actionToConfirm(true);
            }
          }}
          title="Xác nhận xóa kèm phiên bản"
          message="Các mẫu xe này đang có phiên bản (variant) hoạt động. Bạn có muốn XÓA LUÔN TẤT CẢ các phiên bản liên quan không? Hành động này không thể hoàn tác."
        />
      )}
    </motion.div>
  );
};

export default VehicleCatalogPage;
