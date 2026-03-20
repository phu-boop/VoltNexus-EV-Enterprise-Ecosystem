// hooks/useQuotations.js
import { useState, useEffect, useCallback } from "react";
import {
  getQuotationsByDealer,
  getQuotationsByStaff,
  deleteQuotation as deleteQuotationApi,
  getQuotationDetail
} from "../services/quotationService.js";

export const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    customer: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const userRole = sessionStorage.getItem("roles");
  const profileId = sessionStorage.getItem("profileId");

  const fetchQuotations = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      let data;
      const mergedFilters = { ...filters, ...filterParams };

      if (userRole?.includes("DEALER_MANAGER") && profileId) {
        data = await getQuotationsByDealer(profileId, mergedFilters);
      } else if (userRole?.includes("DEALER_STAFF") && profileId) {
        data = await getQuotationsByStaff(profileId, mergedFilters);
      } else {
        throw new Error("Không có quyền truy cập");
      }

      setQuotations(data?.data || []);
    } catch (err) {
      console.error("Lỗi fetch quotations:", err);
      setError(err.message || "Không thể tải danh sách báo giá");
    } finally {
      setLoading(false);
    }
  }, [userRole, profileId, filters]);

  const fetchQuotationDetail = useCallback(async (quotationId) => {
    try {
      const response = await getQuotationDetail(quotationId);
      return response.data;
    } catch (err) {
      console.error("Lỗi fetch quotation detail:", err);
      throw err;
    }
  }, []);

  const deleteQuotation = useCallback(async (quotationId) => {
    try {
      await deleteQuotationApi(quotationId);
      setQuotations(prev => prev.filter(q => q.quotationId !== quotationId));
      return true;
    } catch (err) {
      console.error("Lỗi khi xóa báo giá:", err);
      return false;
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return { 
    quotations, 
    loading, 
    error, 
    filters,
    refetch: fetchQuotations, 
    deleteQuotation,
    fetchQuotationDetail,
    updateFilters
  };
};