import api from "./api";

/**
 * Charging Station Service
 * API methods for charging station operations
 */

// Get all active charging stations
export const getAllStations = () =>
  api.get("/customers/api/charging-stations").then((res) => res.data);

// Get station by ID
export const getStationById = (stationId) =>
  api.get(`/customers/api/charging-stations/${stationId}`).then((res) => res.data);

// Find stations near a location
export const findNearbyStations = (latitude, longitude, radius = 50) =>
  api.get("/customers/api/charging-stations/nearby", {
    params: { latitude, longitude, radius }
  }).then((res) => res.data);

// Search stations by keyword
export const searchStations = (keyword) =>
  api.get("/customers/api/charging-stations/search", {
    params: { keyword }
  }).then((res) => res.data);

// Get stations by city
export const getStationsByCity = (city) =>
  api.get(`/customers/api/charging-stations/city/${city}`).then((res) => res.data);

// Get stations by province
export const getStationsByProvince = (province) =>
  api.get(`/customers/api/charging-stations/province/${province}`).then((res) => res.data);

export default {
  getAllStations,
  getStationById,
  findNearbyStations,
  searchStations,
  getStationsByCity,
  getStationsByProvince,
};
