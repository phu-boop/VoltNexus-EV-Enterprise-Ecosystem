import { useState, useEffect } from 'react';
import { dealerService } from '../services/dealerService';

export const useDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDealers = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.getAll(params)).data;
      if (response.success) {
        setDealers(response.data);
      } else {
        setError(response.message || 'Failed to fetch dealers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const createDealer = async (dealerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.create(dealerData)).data;
      if (response.success) {
        await fetchDealers(); // Refresh list
        return response;
      } else {
        setError(response.message || 'Failed to create dealer');
        return response;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateDealer = async (id, dealerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.update(id, dealerData)).data;
      if (response.success) {
        await fetchDealers(); // Refresh list
        return response;
      } else {
        setError(response.message || 'Failed to update dealer');
        return response;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteDealer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.delete(id)).data;
      if (response.success) {
        await fetchDealers(); // Refresh list
        return response;
      } else {
        setError(response.message || 'Failed to delete dealer');
        return response;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const suspendDealer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.suspend(id)).data;
      if (response.success) {
        await fetchDealers(); // Refresh list
        return response;
      } else {
        setError(response.message || 'Failed to suspend dealer');
        return response;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const activateDealer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await dealerService.activate(id)).data;
      if (response.success) {
        await fetchDealers(); // Refresh list
        return response;
      } else {
        setError(response.message || 'Failed to activate dealer');
        return response;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  return {
    dealers,
    loading,
    error,
    fetchDealers,
    createDealer,
    updateDealer,
    deleteDealer,
    suspendDealer,
    activateDealer,
  };
};