import apiConstDealerService from "../../../../services/apiConstDealerService";

export const adminFetchDealer = {
  // Basic CRUD
  getAllDealer: () =>
    apiConstDealerService.get("/api/dealers"),
};

export default adminFetchDealer;
