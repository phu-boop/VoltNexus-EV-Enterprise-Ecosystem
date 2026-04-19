import { useState, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for managing vehicle comparison
 * Handles adding/removing vehicles from comparison list
 */
export const useComparison = () => {
  const [compareList, setCompareList] = useState([]);
  const MAX_COMPARE = 3;

  // Load comparison list from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) {
      setCompareList(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const isInComparison = (variantId) => {
    return compareList.includes(variantId);
  };

  const addToComparison = (variantId) => {
    if (compareList.includes(variantId)) {
      toast.error("Xe này đã có trong danh sách so sánh");
      return false;
    }

    if (compareList.length >= MAX_COMPARE) {
      toast.error(`Chỉ có thể so sánh tối đa ${MAX_COMPARE} xe`);
      return false;
    }

    setCompareList([...compareList, variantId]);
    toast.success("Đã thêm vào danh sách so sánh");
    return true;
  };

  const removeFromComparison = (variantId) => {
    setCompareList(compareList.filter((id) => id !== variantId));
    toast.success("Đã xóa khỏi danh sách so sánh");
  };

  const toggleComparison = (variantId) => {
    if (isInComparison(variantId)) {
      removeFromComparison(variantId);
    } else {
      addToComparison(variantId);
    }
  };

  const clearComparison = () => {
    setCompareList([]);
    localStorage.removeItem("compareList");
    toast.success("Đã xóa tất cả so sánh");
  };

  return {
    compareList,
    isInComparison,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    clearComparison,
    count: compareList.length,
    maxReached: compareList.length >= MAX_COMPARE,
  };
};

export default useComparison;
