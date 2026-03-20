import apiConstDealerService from "../../../../services/apiConstDealerService";

export const fetchDealer = {
  // Basic CRUD
  getAllDealer: () =>
    apiConstDealerService.get("/api/dealers"),
};

export default fetchDealer;
