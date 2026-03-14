// features/customer/promotions/services/customerPromotionService.js
import apiConstSaleService from '../../../../services/apiConstSaleService';
import apiConstDealerService from '../../../../services/apiConstDealerService';
import apiConstVehicleService from '../../../../services/apiConstVehicleService';
export const customerPromotionService = {
  // Chỉ lấy khuyến mãi đang hoạt động
  getActivePromotions: () => apiConstSaleService.get('/promotions/status/ACTIVE'),
  
  // Lấy tất cả khuyến mãi (nhưng chỉ hiển thị ACTIVE và UPCOMING)
  getAllPromotions: () => apiConstSaleService.get('/promotions'),
  
  // Lấy chi tiết 1 khuyến mãi
  getPromotionById: (id) => apiConstSaleService.get(`/promotions/${id}`),
  
  // Lọc theo trạng thái
  getPromotionsByStatus: (status) => apiConstSaleService.get(`/promotions/status/${status}`),

  getAllDealers: () => apiConstDealerService.get('/api/dealers'),
  getAllModels: () => apiConstVehicleService.get('/vehicle-catalog/models'),
};

export default customerPromotionService;