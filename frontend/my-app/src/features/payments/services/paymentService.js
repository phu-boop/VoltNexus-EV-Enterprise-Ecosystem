// Payment Service - API calls for Payment Service
import apiConstPaymentService from '../../../services/apiConstPaymentService';

/**
 * Payment Service
 * Tất cả API calls cho Payment Service
 */
const paymentService = {
  // ==============================
  // Phase 1: Payment Methods Management
  // ==============================
  
  /**
   * Lấy tất cả payment methods (ADMIN, EVM_STAFF)
   */
  getAllPaymentMethods: () => 
    apiConstPaymentService.get('/api/v1/payments/methods'),

  /**
   * Lấy active payment methods (PUBLIC)
   */
  getActivePaymentMethods: () => 
    apiConstPaymentService.get('/api/v1/payments/methods/active-public'),

  /**
   * Lấy active payment methods cho B2B (DEALER_MANAGER, ADMIN, EVM_STAFF)
   */
  getActiveB2BMethods: () => 
    apiConstPaymentService.get('/api/v1/payments/methods/active-b2b'),

  /**
   * Lấy chi tiết payment method theo ID
   */
  getPaymentMethodById: (methodId) => 
    apiConstPaymentService.get(`/api/v1/payments/methods/${methodId}`),

  /**
   * Tạo payment method (ADMIN)
   */
  createPaymentMethod: (data) => 
    apiConstPaymentService.post('/api/v1/payments/methods', data),

  /**
   * Cập nhật payment method (ADMIN)
   */
  updatePaymentMethod: (methodId, data) => 
    apiConstPaymentService.put(`/api/v1/payments/methods/${methodId}`, data),

  // ==============================
  // Phase 2: B2C Payment Flow
  // ==============================

  /**
   * Khởi tạo thanh toán (Customer, Dealer Staff, Dealer Manager)
   */
  initiatePayment: (orderId, data) => 
    apiConstPaymentService.post(`/api/v1/payments/customer/orders/${orderId}/pay`, data),

  /**
   * Xác nhận thanh toán thủ công (Dealer Staff, Dealer Manager)
   */
  confirmManualPayment: (transactionId, data = {}) => 
    apiConstPaymentService.post(`/api/v1/payments/customer/transactions/${transactionId}/confirm`, data),

  /**
   * Lấy lịch sử thanh toán của một đơn hàng
   */
  getPaymentHistory: (orderId) => 
    apiConstPaymentService.get(`/api/v1/payments/customer/orders/${orderId}/history`),

  /**
   * Lấy tổng công nợ của một khách hàng
   */
  getCustomerTotalDebt: (customerId) => 
    apiConstPaymentService.get(`/api/v1/payments/customer/${customerId}/debt`),

  /**
   * Lấy danh sách thanh toán tiền mặt chờ duyệt (B2C orders) - Dealer Manager
   */
  getPendingCashPaymentsB2C: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiConstPaymentService.get(`/api/v1/payments/customer/pending-cash-payments-b2c${queryParams ? '?' + queryParams : ''}`);
  },

  // ==============================
  // Phase 3: B2B Payment Flow
  // ==============================

  /**
   * Tạo hóa đơn công nợ cho Đại lý (EVM Staff)
   */
  createDealerInvoice: (data) => 
    apiConstPaymentService.post('/api/v1/payments/dealer/invoices', data),

  /**
   * Thanh toán hóa đơn (Dealer Manager)
   */
  payDealerInvoice: (invoiceId, data) => 
    apiConstPaymentService.post(`/api/v1/payments/dealer/invoices/${invoiceId}/pay`, data),

  /**
   * Khởi tạo thanh toán VNPAY cho hóa đơn B2B (Dealer Manager)
   */
  initiateDealerInvoiceVnpay: (invoiceId, data) => 
    apiConstPaymentService.post(`/api/v1/payments/dealer/invoices/${invoiceId}/vnpay/initiate`, data),

  /**
   * Xác nhận thanh toán từ Đại lý (EVM Staff)
   */
  confirmDealerTransaction: (transactionId, data) => 
    apiConstPaymentService.post(`/api/v1/payments/dealer/transactions/${transactionId}/confirm`, data),

  /**
   * Lấy danh sách hóa đơn của một Đại lý
   */
  getDealerInvoices: (dealerId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiConstPaymentService.get(`/api/v1/payments/dealer/${dealerId}/invoices${queryParams ? '?' + queryParams : ''}`);
  },

  /**
   * Lấy chi tiết hóa đơn theo ID
   */
  getDealerInvoiceById: (dealerId, invoiceId) => 
    apiConstPaymentService.get(`/api/v1/payments/dealer/${dealerId}/invoices/${invoiceId}`),

  /**
   * Lấy chi tiết hóa đơn theo ID (alternative - không cần dealerId)
   */
  getDealerInvoiceByIdAlternative: (invoiceId) => 
    apiConstPaymentService.get(`/api/v1/payments/dealer/invoices/${invoiceId}`),

  /**
   * Lấy tổng hợp công nợ của tất cả Đại lý (EVM Staff)
   */
  getDealerDebtSummary: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiConstPaymentService.get(`/api/v1/payments/dealer/debt-summary${queryParams ? '?' + queryParams : ''}`);
  },

  /**
   * Kiểm tra xem đơn hàng đã có hóa đơn chưa
   */
  checkOrderHasInvoice: (orderId) =>
    apiConstPaymentService.get(`/api/v1/payments/dealer/orders/${orderId}/has-invoice`),

  /**
   * Lấy danh sách thanh toán tiền mặt chờ duyệt (EVM Staff)
   */
  getPendingCashPayments: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiConstPaymentService.get(`/api/v1/payments/dealer/pending-cash-payments${queryParams ? '?' + queryParams : ''}`);
  },

  // ==============================
  // Phase 4: Reporting APIs
  // ==============================

  /**
   * Lấy doanh thu theo đại lý
   */
  getRevenueByDealer: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiConstPaymentService.get(`/api/v1/payments/reports/revenue-by-dealer?${params.toString()}`);
  },

  /**
   * Lấy tổng hợp công nợ khách hàng
   */
  getCustomerDebtSummary: () => 
    apiConstPaymentService.get('/api/v1/payments/reports/customer-debt-summary'),

  /**
   * Lấy báo cáo công nợ đại lý theo độ tuổi (aging)
   */
  getDealerDebtAging: () => 
    apiConstPaymentService.get('/api/v1/payments/reports/dealer-debt-aging'),

  // ==============================
  // VNPAY Gateway
  // ==============================

  /**
   * VNPAY Return URL handler
   */
  vnpayReturn: (params) => {
    // Convert params object to URLSearchParams
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      queryParams.append(key, params[key]);
    });
    return apiConstPaymentService.get(`/api/v1/payments/gateway/callback/vnpay-return?${queryParams.toString()}`);
  },
};

export default paymentService;

