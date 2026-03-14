import apiConstSaleService from "../../../../../services/apiConstSaleService";

export const salesContractService = {
  create: (data) =>
    apiConstSaleService.post("/api/v1/sales-contracts", data),

  update: (contractId, data) =>
    apiConstSaleService.put(`/api/v1/sales-contracts/${contractId}`, data),

  getById: (contractId) =>
    apiConstSaleService.get(`/api/v1/sales-contracts/${contractId}`),

  getByOrderId: (orderId) =>
    apiConstSaleService.get(`/api/v1/sales-contracts/order/${orderId}`),

  getByStatus: (status) =>
    apiConstSaleService.get(`/api/v1/sales-contracts/status/${status}`),

  sign: (contractId, digitalSignature) =>
    apiConstSaleService.put(`/api/v1/sales-contracts/${contractId}/sign`, null, {
      params: { digitalSignature },
    }),

  updateStatus: (contractId, status) =>
    apiConstSaleService.put(`/api/v1/sales-contracts/${contractId}/status`, null, {
      params: { status },
    }),

  generateFromTemplate: (orderId) =>
    apiConstSaleService.post(`/api/v1/sales-contracts/order/${orderId}/generate`),

  validate: (contractId) =>
    apiConstSaleService.post(`/api/v1/sales-contracts/${contractId}/validate`),

  getExpiring: (days) =>
    apiConstSaleService.get(`/api/v1/sales-contracts/expiring`, {
      params: { days },
    }),

  getAll: () =>
    apiConstSaleService.get(`/api/v1/sales-contracts`),

  delete: (contractId) =>
    apiConstSaleService.delete(`/api/v1/sales-contracts/${contractId}`),

  search: (customerId, status) =>
    apiConstSaleService.get(`/api/v1/sales-contracts/search`, {
      params: { customerId, status },
    }),
  cancel: (contractId) =>
    apiConstSaleService.post(`/api/v1/sales-contracts/${contractId}`),
};