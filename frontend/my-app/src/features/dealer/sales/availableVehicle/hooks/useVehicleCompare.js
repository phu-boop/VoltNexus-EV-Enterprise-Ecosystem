import { useState, useCallback } from "react";
// Đảm bảo đường dẫn này trỏ đúng đến file service của bạn
import { getComparisonDetails } from "../services/availableVehicleService.js";
import { useAuthContext } from "../../../../auth/AuthProvider";
import Swal from "sweetalert2";

export const useVehicleCompare = () => {
  const { userData } = useAuthContext();

  const [selectedItems, setSelectedItems] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Thêm hoặc bớt một xe khỏi danh sách so sánh
   * @param {object} vehicle - Đối tượng xe (đã được đơn giản hóa)
   */
  const handleCompareToggle = useCallback((vehicle) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some(
        (item) => item.variantId === vehicle.variantId
      );
      if (isSelected) {
        // Bỏ chọn
        return prev.filter((item) => item.variantId !== vehicle.variantId);
      } else {
        // Thêm vào
        // *** ĐÃ THAY ĐỔI ALERT THÀNH CONSOLE.WARN ***
        if (prev.length >= 3) {
          console.warn(
            "Đã đạt giới hạn so sánh: Bạn chỉ có thể so sánh tối đa 3 xe."
          );
          return prev; // Không thêm xe mới
        }
        return [...prev, vehicle];
      }
    });
  }, []);

  /**
   * Xóa một xe khỏi khay so sánh
   */
  const handleRemoveFromTray = useCallback((vehicle) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.variantId !== vehicle.variantId)
    );
  }, []);

  /**
   * Gửi yêu cầu lấy dữ liệu so sánh và mở Modal
   */
  const handleSubmitCompare = useCallback(async () => {
    if (selectedItems.length < 2) {
      Swal.fire("Thông báo", "Bạn cần chọn ít nhất 2 xe để so sánh.", "info");
      return;
    }

    const dealerId = userData?.id;

    if (!dealerId) {
      setError("Không thể xác định ID Đại lý. Vui lòng đăng nhập lại.");
      console.error("Không tìm thấy 'profileId' trong userData:", userData);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const variantIds = selectedItems.map((item) => item.variantId);
      const res = await getComparisonDetails(variantIds, dealerId);
      setCompareData(res.data.data || []);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu so sánh:", err);
      setError("Không thể tải dữ liệu so sánh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedItems, userData]);

  /**
   * Đóng modal so sánh
   */
  const handleCloseCompareModal = useCallback(() => {
    setIsModalOpen(false);
    setCompareData([]); // Xóa dữ liệu cũ
  }, []);

  /**
   * Hàm tiện ích để kiểm tra xem xe đã được chọn chưa
   */
  const isCompared = useCallback(
    (variantId) => {
      return selectedItems.some((item) => item.variantId === variantId);
    },
    [selectedItems]
  );

  return {
    selectedItems,
    compareData,
    isCompareModalOpen: isModalOpen,
    isCompareLoading: isLoading,
    compareError: error,
    handleCompareToggle,
    handleRemoveFromTray,
    handleSubmitCompare,
    handleCloseCompareModal,
    isCompared,
  };
};
