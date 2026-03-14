import { useState, useCallback } from "react";
import { getVehicleDetails } from "../services/availableVehicleService";

/**
 * Hook để quản lý trạng thái modal và fetch dữ liệu chi tiết xe
 */
export const useVehicleDetails = () => {
  const [variantDetails, setVariantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(async (variantId) => {
    setIsModalOpen(true);
    setIsLoading(true);
    setError(null);
    try {
      const res = await getVehicleDetails(variantId);
      setVariantDetails(res.data.data);
    } catch (err) {
      console.error("Failed to fetch variant details:", err);
      setError("Không thể tải thông số kỹ thuật.");
      // Cân nhắc đóng modal nếu lỗi
      // setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setVariantDetails(null); // Xóa dữ liệu cũ
    setError(null);
  }, []);

  return {
    variantDetails,
    isLoading,
    error,
    isModalOpen,
    openModal,
    closeModal,
  };
};
