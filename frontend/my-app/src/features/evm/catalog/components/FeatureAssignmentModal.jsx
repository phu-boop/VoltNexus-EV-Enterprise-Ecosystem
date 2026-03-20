// Đây là component UI Quản Lý Tính Năng. Nó sẽ hiển thị hai cột: một cột là các tính năng có sẵn, cột còn lại là các tính năng đã được gán
import React, { useState, useEffect } from "react";
import { FiX, FiArrowRight, FiTrash2, FiLoader } from "react-icons/fi";
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
          setIsLoading(true);
          setError("");
          const response = await getAllFeatures();
          setAllFeatures(response.data.data || []);
          // Lấy danh sách feature đã gán từ prop `variant`
          setAssignedFeatures(variant.features || []);
        } catch (err) {
          setError("Không thể tải danh sách tính năng.");
          console.error(err);
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
      isStandard: true, // Mặc định
      additionalCost: 0,
    };
    try {
      await assignFeatureToVariant(variant.variantId, featureData);
      // Cập nhật UI ngay lập tức
      setAssignedFeatures([
        ...assignedFeatures,
        { ...featureToAssign, ...featureData },
      ]);
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể gán tính năng.", "error");
    }
  };

  const handleUnassign = async (featureToUnassign) => {
    try {
      await unassignFeatureFromVariant(
        variant.variantId,
        featureToUnassign.featureId
      );
      // Cập nhật UI ngay lập tức
      setAssignedFeatures(
        assignedFeatures.filter(
          (f) => f.featureId !== featureToUnassign.featureId
        )
      );
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể bỏ gán tính năng.", "error");
    }
  };

  // Lọc ra các tính năng chưa được gán để hiển thị ở cột bên trái
  const availableFeatures = allFeatures.filter(
    (feature) =>
      !assignedFeatures.some(
        (assigned) => assigned.featureId === feature.featureId
      )
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý tính năng cho:{" "}
            <span className="text-blue-600">
              {variant.versionName} - {variant.color}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex-1 flex justify-center items-center text-red-500">
            {error}
          </div>
        ) : (
          <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            {/* Cột 1: Các tính năng có sẵn */}
            <div className="border rounded-lg p-4 flex flex-col">
              <h3 className="font-semibold text-lg mb-4">
                Các tính năng có sẵn
              </h3>
              <ul className="space-y-2 overflow-y-auto">
                {availableFeatures.map((feature) => (
                  <li
                    key={feature.featureId}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span>
                      {feature.featureName}{" "}
                      <em className="text-gray-500 text-sm">
                        ({feature.category})
                      </em>
                    </span>
                    <button
                      onClick={() => handleAssign(feature)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                      title="Gán"
                    >
                      <FiArrowRight />
                    </button>
                  </li>
                ))}
                {availableFeatures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Đã gán hết tính năng.
                  </p>
                )}
              </ul>
            </div>

            {/* Cột 2: Các tính năng đã gán */}
            <div className="border rounded-lg p-4 flex flex-col">
              <h3 className="font-semibold text-lg mb-4">
                Các tính năng đã gán
              </h3>
              <ul className="space-y-2 overflow-y-auto">
                {assignedFeatures.map((feature) => (
                  <li
                    key={feature.featureId}
                    className="flex justify-between items-center p-2 bg-blue-50 rounded"
                  >
                    <span>{feature.featureName}</span>
                    <button
                      onClick={() => handleUnassign(feature)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      title="Bỏ gán"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
                {assignedFeatures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có tính năng nào được gán.
                  </p>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAssignmentModal;
