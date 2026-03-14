import api from './api';

const reviewService = {
  /**
   * Create a new review
   */
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/customers/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  /**
   * Get all approved reviews for a vehicle model
   */
  getReviewsByModel: async (modelId) => {
    try {
      const response = await api.get(`/customers/api/reviews/model/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  /**
   * Get rating summary for a vehicle model
   */
  getRatingSummary: async (modelId) => {
    try {
      const response = await api.get(`/customers/api/reviews/model/${modelId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      throw error;
    }
  },

  /**
   * Get customer's own reviews
   */
  getCustomerReviews: async (customerId) => {
    try {
      const response = await api.get(`/customers/api/reviews/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      throw error;
    }
  },

  /**
   * Mark review as helpful
   */
  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/customers/api/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }
};

export default reviewService;
