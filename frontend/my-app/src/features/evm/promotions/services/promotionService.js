import apiConstSaleService from "../../../../services/apiConstSaleService.js";

// export const promotionService = {
//   getAll: () => apiConstSaleService.get('/promotions'),
//   getById: (id) => apiConstSaleService.get(`/promotions/${id}`),
//   create: (data) => apiConstSaleService.post('/promotions', data),
//   update: (id, data) => apiConstSaleService.put(`/promotions/${id}`, data),
//   delete: (id) => apiConstSaleService.delete(`/promotions/${id}`),
//   getByStatus: (status) => apiConstSaleService.get(`/promotions/status/${status}`)
// };

// export default promotionService;

export const promotionService = {
  getAll: () => apiConstSaleService.get("/promotions"),
  getById: (id) => apiConstSaleService.get(`/promotions/${id}`),
  create: (data) => apiConstSaleService.post('/promotions', data),
  update: (id, data) => apiConstSaleService.put(`/promotions/${id}`, data),
  delete: (id) => apiConstSaleService.delete(`/promotions/${id}`),
  getByStatus: (status) =>
    apiConstSaleService.get(`/promotions/status/${status}`),
  authenticPromotion: (id) =>
    apiConstSaleService.put(`/promotions/authentic/${id}`),
};

export default promotionService;
