import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { getModels, deactivateModel } from "../services/vehicleCatalogService";
import ModelForm from "../components/ModelForm";
import ConfirmationModal from "../components/ConfirmationModal";

const VehicleCatalogPage = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState(null);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getModels();
      setModels(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh mục xe. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleOpenForm = (model = null) => {
    setSelectedModel(model);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedModel(null);
  };

  const handleOpenConfirmModal = (model, action) => {
    setSelectedModel(model);
    setActionToConfirm(() => action); // Pass the function to execute
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
      fetchModels(); // Refresh list after deactivating
    } catch (error) {
      console.error("Failed to deactivate model", error);
      Swal.fire("Lỗi!", "Có lỗi xảy ra khi ngừng sản xuất mẫu xe.", "error");
    }
  };

  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="animate-in fade-in-0 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Danh Mục Xe</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchModels()}
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
          {models.map((model) => (
            <div
              key={model.modelId}
              className="bg-white rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-xl relative group"
            >
              <div className="absolute top-4 right-4">
                {/* Dropdown Menu (optional) */}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {model.brand} {model.modelName}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">ID: {model.modelId}</p>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() =>
                    Swal.fire(
                      "Thông báo",
                      "Chức năng xem chi tiết đang được phát triển.",
                      "info"
                    )
                  }
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
                  onClick={() =>
                    handleOpenConfirmModal(model, () =>
                      handleDeactivate(model.modelId)
                    )
                  }
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

      {isFormOpen && (
        <ModelForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSuccess={fetchModels}
          model={selectedModel}
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
