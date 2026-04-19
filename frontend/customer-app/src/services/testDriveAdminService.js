import api from './api';

/**
 * Test Drive Admin Service
 * API methods for admin test drive management
 */

// Filter test drives with criteria
export const filterTestDrives = async (filterRequest) => {
  try {
    const response = await api.post('/customers/api/test-drives/filter', filterRequest);
    return response.data;
  } catch (error) {
    console.error('Error filtering test drives:', error);
    throw error;
  }
};

// Get test drive by ID
export const getTestDriveById = async (id) => {
  try {
    const response = await api.get(`/customers/api/test-drives/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test drive:', error);
    throw error;
  }
};

// Get calendar view
export const getCalendarView = async (dealerId, year, month) => {
  try {
    const params = { year, month };
    if (dealerId) params.dealerId = dealerId; // Only add if not null
    
    const response = await api.get('/customers/api/test-drives/calendar', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
};

// Get statistics
export const getStatistics = async (dealerId, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (dealerId) params.dealerId = dealerId; // Only add if not null
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/customers/api/test-drives/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// Confirm test drive
export const confirmTestDrive = async (id) => {
  try {
    const response = await api.put(`/customers/api/test-drives/${id}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error confirming test drive:', error);
    throw error;
  }
};

// Cancel test drive
export const cancelTestDrive = async (id, reason) => {
  try {
    const response = await api.put(`/customers/api/test-drives/${id}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling test drive:', error);
    throw error;
  }
};

// Complete test drive
export const completeTestDrive = async (id) => {
  try {
    const response = await api.put(`/customers/api/test-drives/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing test drive:', error);
    throw error;
  }
};
