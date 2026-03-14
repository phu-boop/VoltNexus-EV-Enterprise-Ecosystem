import { useState, useEffect, useMemo, useCallback } from 'react';
import customerService from '../management/services/customerService';

export const useCustomers = (initialSearchTerm = '') => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load customers from API
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAllCustomers(searchTerm);
      setCustomers(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Lỗi khi tải danh sách khách hàng';
      setError(errorMessage);
      console.error('Customer loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    
    const lowerSearch = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.firstName?.toLowerCase().includes(lowerSearch) ||
      customer.lastName?.toLowerCase().includes(lowerSearch) ||
      customer.email?.toLowerCase().includes(lowerSearch) ||
      customer.phone?.toLowerCase().includes(lowerSearch)
    );
  }, [customers, searchTerm]);

  // Get customer by ID
  const getCustomerById = useCallback((id) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    try {
      await customerService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Không thể xóa khách hàng';
      console.error('Delete customer error:', err);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Retry loading with exponential backoff
  const retryWithBackoff = useCallback(async (maxRetries = 3) => {
    let retries = 0;
    
    const attemptLoad = async () => {
      try {
        await loadCustomers();
        return true;
      } catch (err) {
        retries++;
        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptLoad();
        }
        throw err;
      }
    };

    return attemptLoad();
  }, [loadCustomers]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update search term
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Load customers on mount and when search term changes
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    // Data
    customers: filteredCustomers,
    allCustomers: customers,
    
    // State
    loading,
    error,
    searchTerm,
    lastUpdated,
    
    // Actions
    setSearchTerm: updateSearchTerm,
    refresh: loadCustomers,
    retry: retryWithBackoff,
    clearError,
    getCustomerById,
    deleteCustomer,
    
    // Status flags
    hasCustomers: customers.length > 0,
    totalCount: filteredCustomers.length,
  };
};

export default useCustomers;
