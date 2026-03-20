import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import {
  getModels,
  deactivateModel,
  getModelDetails,
} from "../services/vehicleCatalogService";
import ModelForm from "../components/ModelForm";
import ConfirmationModal from "../components/ConfirmationModal";
import ModelDetailsModal from "../components/ModelDetailsModal";

const VehicleCatalogPage = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState(null);
  const [modelForDetails, setModelForDetails] = useState(null);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getModels();
      // Ensure data is an array
      const responseData = response.data?.data;

      let modelsArray = [];
      if (Array.isArray(responseData)) {
        modelsArray = responseData;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        modelsArray = responseData.content;
      } else {
        console.warn("API did not return an array or paginated content:", responseData);
      }

      setModels(modelsArray);

      setError(null);
    } catch (err) {
      setError("Không thể tải danh mục xe. Vui lòng thử lại.");
      console.error(err);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // API để lấy dữ liệu chi tiết trước khi mở form
  const handleOpenForm = async (modelToEdit = null) => {
    // Nếu là tạo mới, chỉ cần mở form rỗng
    if (!modelToEdit) {
      setSelectedModel(null);
      setIsFormOpen(true);
      return;
    }

    // Nếu là chỉnh sửa, gọi API lấy dữ liệu chi tiết
    setIsDetailLoading(true);
    try {
      const response = await getModelDetails(modelToEdit.modelId);
      setSelectedModel(response.data.data); // Dùng dữ liệu chi tiết
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

  // HÀM MỚI: Xử lý xem chi tiết
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
    setActionToConfirm(() => () => handleDeactivate(model.modelId));
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedModel(null);
    setActionToConfirm(null);
  };

  const handleDeactivate = async (modelId) => {
    try {
      await deactivateModel(modelId);
      fetchModels();
      handleCloseConfirmModal(); // Đóng modal sau khi thành công
    } catch (error) {
      console.error("Failed to deactivate model", error);
      alert("Có lỗi xảy ra khi ngừng sản xuất mẫu xe.");
    }
  };

  const filteredModels = (Array.isArray(models) ? models : []).filter((model) => {
    // Chuẩn hóa từ khóa tìm kiếm: xóa hết dấu cách và chuyển sang chữ thường
    const query = searchQuery.toLowerCase().replace(/\s+/g, "");

    // Chuẩn hóa dữ liệu: gộp Tên và Hãng, xóa hết dấu cách, chuyển sang chữ thường
    const brand = model.brand || "";
    const modelName = model.modelName || "";

    const combinedData = (brand + modelName).toLowerCase().replace(/\s+/g, "");

    // So sánh hai chuỗi đã được chuẩn hóa
    return combinedData.includes(query);
  });

  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="animate-in fade-in-0 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Danh Mục Xe</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchModels}
            className="flex items-center justify-center p-3 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
            title="Làm mới danh sách"
            disabled={isLoading}
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            <span className="font-semibold">Thêm Mẫu Xe Mới</span>
          </button>
        </div>
      </div>

      {/* Ô tìm kiếm nằm bên dưới header */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên mẫu xe hoặc hãng..."
            className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isDetailLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Đang tải dữ liệu chi tiết...
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sử dụng filteredModels để render */}
          {filteredModels.map((model) => (
            <div
              key={model.modelId}
              className="bg-white rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-xl group"
            >
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                [{model.brand}] {model.modelName}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">ID: {model.modelId}</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleViewDetails(model.modelId)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition duration-300"
                  title="Xem chi tiết"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleOpenForm(model)}
                  className="p-3 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition duration-300"
                  title="Chỉnh sửa"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleOpenConfirmModal(model)}
                  className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition duration-300"
                  title="Ngừng sản xuất"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị thông báo nếu không có kết quả lọc */}
      {!isLoading && filteredModels.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">Không tìm thấy mẫu xe nào.</p>
          <p>Vui lòng thử lại với từ khóa khác.</p>
        </div>
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
          message={`Bạn có chắc chắn muốn ngừng sản xuất mẫu xe "${selectedModel?.brand} ${selectedModel?.modelName}" không? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
};

export default VehicleCatalogPage;
