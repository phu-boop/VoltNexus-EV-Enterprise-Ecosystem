// features/customer/promotions/hooks/useCustomerPromotions.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { customerPromotionService } from "../services/apiConstSaleService";

export const useCustomerPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ACTIVE"); // Mặc định chỉ hiển thị ACTIVE
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load promotions, dealers, và models song song
      const [promotionsRes, dealersRes, modelsRes] = await Promise.all([
        customerPromotionService.getAllPromotions(),
        customerPromotionService.getAllDealers(),
        customerPromotionService.getAllModels(),
      ]);

      setPromotions(promotionsRes.data);
      setDealers(dealersRes.data.data);
      setModels(modelsRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi tải dữ liệu khuyến mãi";
      setError(errorMessage);
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter promotions based on current filter - chỉ hiển thị ACTIVE và UPCOMING
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => p.status === filter);
  }, [promotions, filter]);

  // Get promotions sorted by relevance
  const sortedPromotions = useMemo(() => {
    return [...filteredPromotions].sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }, [filteredPromotions]);

  // Get dealer information by IDs
  const getDealersByIds = useCallback(
    (dealerIdsJson) => {
      if (
        !dealerIdsJson ||
        dealerIdsJson === "null" ||
        dealerIdsJson === "[]"
      ) {
        return [];
      }
      try {
        const dealerIds = JSON.parse(dealerIdsJson);
        return dealers.filter((dealer) => dealerIds.includes(dealer.dealerId));
      } catch (error) {
        console.error("Error parsing dealer IDs:", error);
        return [];
      }
    },
    [dealers]
  );

  // Get model information by IDs
  const getModelsByIds = useCallback(
    (modelIdsJson) => {
      if (!modelIdsJson || modelIdsJson === "[]") {
        return [];
      }
      try {
        const modelIds = JSON.parse(modelIdsJson);
        return models.filter((model) => modelIds.includes(model.modelId));
      } catch (error) {
        console.error("Error parsing model IDs:", error);
        return [];
      }
    },
    [models]
  );

  // Get active promotions count
  const activePromotionsCount = useMemo(() => {
    return promotions.filter((p) => p.status === "ACTIVE").length;
  }, [promotions]);

  // Get upcoming promotions count
  const upcomingPromotionsCount = useMemo(() => {
    return promotions.filter((p) => p.status === "UPCOMING").length;
  }, [promotions]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadAllData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loading, loadAllData]);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Data
    promotions: sortedPromotions,
    allPromotions: promotions,
    dealers,
    models,
    filteredPromotions: sortedPromotions,

    // Helper functions
    getDealersByIds,
    getModelsByIds,

    // Counts and stats
    activePromotionsCount,
    upcomingPromotionsCount,
    totalCount: filteredPromotions.length,

    // State
    loading,
    error,
    filter,
    lastUpdated,

    // Actions
    setFilter,
    refresh: loadAllData,
    clearError: () => setError(null),

    // Status flags
    hasPromotions: promotions.length > 0,
    hasActivePromotions: activePromotionsCount > 0,
    hasUpcomingPromotions: upcomingPromotionsCount > 0,
  };
};

export default useCustomerPromotions;
