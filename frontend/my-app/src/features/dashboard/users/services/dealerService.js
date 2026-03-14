import apiConstDealerService from "../../../../services/apiConstDealerService";
export const dealerService = {
  // Lấy tất cả dealers (có thể filter)
  getAll: (params = {}) => apiConstDealerService.get("api/dealers/list-all", { params }),
};

export default dealerService;