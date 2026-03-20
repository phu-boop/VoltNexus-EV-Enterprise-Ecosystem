import { useState, useEffect, useCallback } from 'react';
import { salesContractService } from '../services/salesContractService';
import { showSuccess, showError } from '../../../../../utils/notification';

export const useSalesContracts = (orderId) => {
  const [contracts, setContracts] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Sửa: Memoize tất cả functions với useCallback

  // Fetch contract by ID
  const fetchContractById = useCallback(async (contractId) => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getById(contractId)).data;
      setContract(response.data || response);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contract by order ID
  const fetchContractByOrderId = useCallback(async (orderId) => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getByOrderId(orderId)).data;
      setContract(response.data || response);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contracts by status
  const fetchContractsByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getByStatus(status)).data;
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all contracts
  const fetchAllContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getAll()).data;
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải tất cả hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch expiring contracts
  const fetchExpiringContracts = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getExpiring(days)).data;
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải danh sách hợp đồng sắp hết hạn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search contracts
  const searchContracts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.search(params)).data;
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tìm kiếm hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create contract
  const createContract = useCallback(async (contractData) => {
    try {
      const response = (await salesContractService.create(contractData)).data;
      showSuccess('Tạo hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError(err.response.data.message);
      throw err;
    }
  }, []);

  // Update contract
  const updateContract = useCallback(async (contractId, contractData) => {
    try {
      const response = (await salesContractService.update(contractId, contractData)).data;
      showSuccess('Cập nhật hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi cập nhật hợp đồng');
      throw err;
    }
  }, []);

  // Sign contract
  const signContract = useCallback(async (contractId, digitalSignature) => {
    try {
      const response = (await salesContractService.sign(contractId, digitalSignature)).data;
      showSuccess('Ký hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi ký hợp đồng');
      throw err;
    }
  }, []);

  // Update contract status
  const updateContractStatus = useCallback(async (contractId, status) => {
    try {
      const response = (await salesContractService.updateStatus(contractId, status)).data;
      showSuccess('Cập nhật trạng thái hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi cập nhật trạng thái hợp đồng');
      throw err;
    }
  }, []);

  // Generate from template
  const generateFromTemplate = useCallback(async (orderId) => {
    try {
      const response = (await salesContractService.generateFromTemplate(orderId)).data;
      showSuccess('Tạo hợp đồng từ mẫu thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi tạo hợp đồng từ mẫu');
      throw err;
    }
  }, []);

  // Validate contract
  const validateContract = useCallback(async (contractId) => {
    try {
      const response = (await salesContractService.validate(contractId)).data;
      showSuccess('Hợp đồng hợp lệ');
      return response.data;
    } catch (err) {
      showError('Hợp đồng không hợp lệ');
      throw err;
    }
  }, []);

  // Delete contract
  const deleteContract = useCallback(async (contractId) => {
    try {
      const response = (await salesContractService.delete(contractId)).data;
      showSuccess('Xóa hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi xóa hợp đồng');
      throw err;
    }
  }, []);

  // Canlcel contract
  const cancelContract = useCallback(async (contractId) => {
    try {
      const response = (await salesContractService.cancel(contractId)).data;
      showSuccess('Xóa hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi xóa hợp đồng');
      throw err;
    }
  }, []);

  // ✅ Sửa: Sử dụng useCallback cho fetchContractByOrderId trong useEffect
  useEffect(() => {
    if (orderId) {
      fetchContractByOrderId(orderId);
    }
  }, [orderId, fetchContractByOrderId]);

  return {
    // State
    contract,
    contracts,
    loading,
    error,
    
    // Methods - Fetch
    fetchContractById,
    fetchContractByOrderId,
    fetchContractsByStatus,
    fetchAllContracts,
    fetchExpiringContracts,
    searchContracts,
    
    // Methods - CRUD
    createContract,
    updateContract,
    signContract,
    updateContractStatus,
    generateFromTemplate,
    validateContract,
    deleteContract,
    cancelContract,
  };
};