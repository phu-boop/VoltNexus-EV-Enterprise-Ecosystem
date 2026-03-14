import api from './api';

const testDriveService = {
  /**
   * Create a new test drive appointment
   */
  createAppointment: async (appointmentData) => {
    try {
      // Transform to match backend TestDriveRequest format
      const requestData = {
        customerId: appointmentData.customerId,
        dealerId: appointmentData.dealerId,
        modelId: appointmentData.modelId,
        variantId: appointmentData.variantId,
        vehicleModelName: appointmentData.vehicleModelName,
        vehicleVariantName: appointmentData.vehicleVariantName,
        staffId: appointmentData.staffId || null,
        staffName: appointmentData.staffName || null,
        appointmentDate: appointmentData.appointmentDate,
        durationMinutes: appointmentData.durationMinutes || 60,
        testDriveLocation: appointmentData.testDriveLocation,
        customerNotes: appointmentData.customerNotes,
        createdBy: appointmentData.createdBy || 'customer'
      };
      
      const response = await api.post('/customers/api/test-drives', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating test drive appointment:', error);
      throw error;
    }
  },

  /**
   * Get appointment by ID
   */
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/customers/api/test-drives/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  /**
   * Get all appointments for the current customer
   */
  getMyAppointments: async (customerId) => {
    try {
      const response = await api.get(`/customers/api/test-drives/profile/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer appointments:', error);
      throw error;
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId, reason, cancelledBy) => {
    try {
      const response = await api.put(
        `/customers/api/test-drives/${appointmentId}/cancel`,
        {
          cancellationReason: reason,
          cancelledBy: cancelledBy
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  /**
   * Confirm an appointment
   */
  confirmAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/customers/api/test-drives/${appointmentId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  },

  /**
   * Get available test drive slots for a dealer
   */
  getAvailableSlots: async (dealerId, date) => {
    try {
      const response = await api.get(`/customers/api/test-drives/dealer/${dealerId}/available-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }
};

export default testDriveService;
