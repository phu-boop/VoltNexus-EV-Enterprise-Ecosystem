import api from "./api.js";

/**
 * Dealer Service
 * Provides API methods for dealer operations
 */

// Get all dealers
export const getAllDealers = () =>
    api.get('/dealers/api/dealers').then((res) => res.data);

// Search dealers
export const searchDealers = (query) =>
    api.get('/dealers/api/dealers', { params: { search: query } }).then((res) => res.data);

// Get dealer by ID
export const getDealerById = (id) =>
    api.get(`/dealers/api/dealers/${id}`).then((res) => res.data);
