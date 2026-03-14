import apiConstVehicleService from "../../../../services/apiConstVehicleService.js";

export const adminFetchModelVehicle = {
  // Basic CRUD
  getAllModelVehicle: () =>
    apiConstVehicleService.get("/vehicle-catalog/models"),
};

export default adminFetchModelVehicle;
