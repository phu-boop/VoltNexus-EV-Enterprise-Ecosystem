import api from './api';

/**
 * Customer Service - API calls for customer management
 */

// Get all customers with optional search
export const getAllCustomers = async (searchTerm = '') => {
  try {
    const params = searchTerm ? { search: searchTerm } : {};
    const response = await api.get('/customers', { params });
    return response.data.data || [];
  } catch (error) {
    console.error('[CustomerService] Error fetching customers:', error);
    throw error;
  }
};

// Get customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/customers/${customerId}`);
    return response.data.data;
  } catch (error) {
    console.error('[CustomerService] Error fetching customer:', error);
    throw error;
  }
};

// Create new customer
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data.data;
  } catch (error) {
    console.error('[CustomerService] Error creating customer:', error);
    throw error;
  }
};

// Update customer
export const updateCustomer = async (customerId, customerData) => {
  try {
    const userEmail = sessionStorage.getItem('email') || 'admin@vms.com';
    const response = await api.put(`/customers/${customerId}`, customerData, {
      headers: {
        'X-Modified-By': userEmail
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('[CustomerService] Error updating customer:', error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (customerId) => {
  try {
    const response = await api.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('[CustomerService] Error deleting customer:', error);
    throw error;
  }
};

// Get customer statuses enum
export const getCustomerStatuses = async () => {
  try {
    const response = await api.get('/customers/enums/statuses');
    return response.data.data || [];
  } catch (error) {
    console.error('[CustomerService] Error fetching statuses:', error);
    throw error;
  }
};

// Get customer types enum
export const getCustomerTypes = async () => {
  try {
    const response = await api.get('/customers/enums/types');
    return response.data.data || [];
  } catch (error) {
    console.error('[CustomerService] Error fetching types:', error);
    throw error;
  }
};

// Get statistics
export const getCustomerStatistics = async (customers) => {
  const stats = {
    total: customers.length,
    new: customers.filter(c => c.status === 'NEW').length,
    potential: customers.filter(c => c.status === 'POTENTIAL').length,
    purchased: customers.filter(c => c.status === 'PURCHASED').length,
    inactive: customers.filter(c => c.status === 'INACTIVE').length,
    individual: customers.filter(c => c.customerType === 'INDIVIDUAL').length,
    corporate: customers.filter(c => c.customerType === 'CORPORATE').length,
  };
  
  return stats;
};
