import apiConstVehicleService from "../../../../services/apiConstVehicleService.js";

export const fetchModelVehicle = {
  // Basic CRUD
  getAllModelVehicle: () =>
    apiConstVehicleService.get("/vehicle-catalog/models?size=1000"),
};

export default fetchModelVehicle;
