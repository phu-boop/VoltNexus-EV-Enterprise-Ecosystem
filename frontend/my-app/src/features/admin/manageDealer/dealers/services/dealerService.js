import apiConstDealerService from "../../../../../services/apiConstDealerService";
export const dealerService = {
  // Lấy tất cả dealers (có thể filter)
  getAll: (params = {}) => apiConstDealerService.get("api/dealers", { params }),

  // Lấy dealer theo ID
  getById: (id) => apiConstDealerService.get(`api/dealers/${id}`),

  // Tạo dealer mới
  create: (data) => apiConstDealerService.post("api/dealers", data),

  // Cập nhật dealer
  update: (id, data) => apiConstDealerService.put(`api/dealers/${id}`, data),

  // Xoá dealer vĩnh viễn
  delete: (id) => apiConstDealerService.delete(`api/dealers/${id}`),

  // Tạm ngưng hoạt động dealer (soft delete)
  suspend: (id) => apiConstDealerService.put(`api/dealers/${id}/suspend`),

  // Kích hoạt lại dealer
  activate: (id) => apiConstDealerService.put(`api/dealers/${id}/activate`),

  // Lấy danh sách rút gọn (ID + tên)
  getBasicList: () => apiConstDealerService.get("api/dealers/list-all"),
};

export default dealerService;