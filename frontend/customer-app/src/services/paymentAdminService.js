import api from './api';

/**
 * Payment Admin Service - APIs cho quản lý thanh toán B2C (Admin)
 */

// Lấy danh sách payment records với filter
export const filterPaymentRecords = async (params) => {
    try {
        const response = await api.get('/payments/api/v1/payments/customer/records', { params });
        return response.data;
    } catch (error) {
        console.error('Error filtering payment records:', error);
        throw error;
    }
};

// Lấy thống kê payment
export const getPaymentStatistics = async (startDate, endDate) => {
    try {
        const response = await api.get('/payments/api/v1/payments/customer/statistics', {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting payment statistics:', error);
        throw error;
    }
};

// Xác nhận thanh toán manual (từ dealer/admin)
export const confirmManualPayment = async (transactionId, notes, action = 'APPROVE') => {
    try {
        const response = await api.post(
            `/payments/api/v1/payments/customer/transactions/${transactionId}/confirm`,
            { notes, action }
        );
        return response.data;
    } catch (error) {
        console.error('Error confirming manual payment:', error);
        throw error;
    }
};

// Lấy payment history của một order
export const getPaymentHistory = async (orderId) => {
    try {
        const response = await api.get(`/payments/api/v1/payments/customer/orders/${orderId}/history`);
        return response.data;
    } catch (error) {
        console.error('Error getting payment history:', error);
        throw error;
    }
};

// Lấy pending cash payments (chờ xác nhận)
export const getPendingCashPayments = async (page = 0, size = 20) => {
    try {
        const response = await api.get('/payments/api/v1/payments/customer/pending-cash-payments-b2c', {
            params: { page, size, sort: 'transactionDate,desc' }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting pending cash payments:', error);
        throw error;
    }
};
