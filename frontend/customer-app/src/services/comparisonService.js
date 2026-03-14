import { compareVehicles as compareVehiclesAPI } from "./vehicleService";

/**
 * Comparison Service
 * API methods for vehicle comparison
 */

// Compare multiple vehicles by variant IDs
export const compareVehicles = (variantIds) => compareVehiclesAPI(variantIds);

export default {
  compareVehicles,
};
