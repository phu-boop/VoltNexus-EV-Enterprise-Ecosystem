import { useState, useEffect, useCallback } from "react";
import {
  getAvailableStock,
  getVariantDetailsByIds,
} from "../services/availableVehicleService";

/**
 * Hook để lấy và quản lý danh sách xe CÓ SẴN ĐỂ BÁN
 */
export const useAvailableVehicles = () => {
  const [vehicles, setVehicles] = useState([]); // Chỉ lưu xe có sẵn
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVehicles = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      // === BƯỚC 1: Lấy danh sách xe có sẵn (không có ảnh) ===
      const params = { search: query };
      const stockRes = await getAvailableStock(params);
      const allStock = stockRes.data.data || [];

      // Lọc xe có thể bán
      const availableStock = allStock.filter(
        (item) => item.availableQuantity > 0
      );

      if (availableStock.length === 0) {
        setVehicles([]);
        setIsLoading(false);
        return;
      }

      const variantIds = availableStock.map((item) => item.variantId);
      let enrichedVehicles = [];

      try {
        const detailsRes = await getVariantDetailsByIds(variantIds);
        const detailsList = detailsRes.data?.data || [];

        const detailsMap = new Map(
          detailsList.map((detail) => [detail.variantId, detail])
        );

        enrichedVehicles = availableStock.map((stockItem) => {
          const details = detailsMap.get(stockItem.variantId);
          return {
            ...stockItem,
            ...details,
          };
        });
      } catch (detailsError) {
        console.error("Lỗi khi lấy chi tiết (ảnh) cho xe:", detailsError);
        enrichedVehicles = availableStock;
      }

      setVehicles(enrichedVehicles);
    } catch (err) {
      console.error("Failed to fetch available stock:", err);
      setError("Không thể tải dữ liệu xe.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tự động fetch khi search query thay đổi (sau 300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchVehicles(searchQuery);
    }, 1000); // Debounce
    return () => clearTimeout(handler);
  }, [searchQuery, fetchVehicles]);

  // Hàm để gọi fetch thủ công (ví dụ: refresh)
  const refreshVehicles = () => {
    fetchVehicles(searchQuery);
  };

  return {
    vehicles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refreshVehicles,
  };
};
