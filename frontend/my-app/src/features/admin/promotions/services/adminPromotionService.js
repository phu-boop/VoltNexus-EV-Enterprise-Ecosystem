// features/admin/promotions/services/adminPromotionService.js
import apiConstSaleService from '../../../../services/apiConstSaleService.js';

export const adminPromotionService = {
  // Basic CRUD
  getAll: () => apiConstSaleService.get('/promotions'),
  getById: (id) => apiConstSaleService.get(`/promotions/${id}`),
  create: (data) => apiConstSaleService.post('/promotions', data),
  update: (id, data) => apiConstSaleService.put(`/promotions/${id}`, data),
  delete: (id) => apiConstSaleService.delete(`/promotions/${id}`),
  getByStatus: (status) => apiConstSaleService.get(`/promotions/status/${status}`),
  
  // Admin specific endpoints
  authenticPromotion: (id) => apiConstSaleService.put(`/promotions/authentic/${id}`),
  
  // Bulk operations
  approveMultiple: (ids) => Promise.all(ids.map(id => apiConstSaleService.put(`/promotions/authentic/${id}`))),
  deleteMultiple: (ids) => Promise.all(ids.map(id => apiConstSaleService.delete(`/promotions/${id}`))),
};

export default adminPromotionService;
