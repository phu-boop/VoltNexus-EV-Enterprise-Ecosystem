/**
 * Dashboard Service
 * Hàm constant để fetch tất cả dữ liệu cần thiết cho dashboard
 */
import apiConstSaleService from "../../../../services/apiConstSaleService";

const BASE_QUOTATION_URL = "/api/v1/quotations";
const BASE_ORDER_B2C_URL = "/api/v1/sales-orders/b2c";
const BASE_ORDER_B2B_URL = "/api/v1/sales-orders/my-orders"; // Controller có @RequestMapping("/api/v1/sales-orders")

/**
 * Hàm constant để fetch tất cả dữ liệu dashboard
 * @param {string} dealerId - ID của dealer
 * @param {Object} dateRange - { startDate, endDate } (optional)
 * @returns {Promise<Object>} Object chứa tất cả dữ liệu
 */
export const fetchDashboardData = async (dealerId, dateRange = null) => {
  try {
    // Tính toán date range nếu không có
    let startDate, endDate;
    if (!dateRange) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      startDate = firstDayOfMonth.toISOString().split("T")[0];
      endDate = lastDayOfMonth.toISOString().split("T")[0];
    } else {
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // Fetch tất cả dữ liệu song song
    // B2B orders có thể fail nếu không có quyền hoặc không có đơn, nên dùng Promise.allSettled
    const [quotationsResponse, ordersB2CResponse, ordersB2BResponse] =
      await Promise.allSettled([
        // Fetch quotations
        apiConstSaleService.get(`${BASE_QUOTATION_URL}/dealer/${dealerId}`, {
          params: {
            dateFrom: startDate,
            dateTo: endDate,
          },
        }),
        // Fetch B2C orders
        apiConstSaleService.get(`${BASE_ORDER_B2C_URL}/dealer/${dealerId}`),
        // Fetch B2B orders (sử dụng my-orders endpoint)
        apiConstSaleService.get(`${BASE_ORDER_B2B_URL}`, {
          params: {
            page: 0,
            size: 1000, // Lấy tất cả
          },
        }),
      ]);

    // Lấy dữ liệu từ response (xử lý Promise.allSettled)
    // Format: { code: "1000", data: [...], message: "..." }
    const quotations =
      quotationsResponse.status === "fulfilled"
        ? quotationsResponse.value.data?.data ||
          quotationsResponse.value.data ||
          []
        : [];

    const ordersB2C =
      ordersB2CResponse.status === "fulfilled"
        ? ordersB2CResponse.value.data?.data ||
          ordersB2CResponse.value.data ||
          []
        : [];

    // B2B orders có thể là Page hoặc List (hoặc có thể fail)
    let ordersB2B = [];
    if (ordersB2BResponse.status === "fulfilled") {
      const b2bData =
        ordersB2BResponse.value.data?.data || ordersB2BResponse.value.data;
      if (b2bData?.content) {
        // Nếu là Page
        ordersB2B = b2bData.content;
      } else if (Array.isArray(b2bData)) {
        // Nếu là List
        ordersB2B = b2bData;
      }
    } else {
      // Nếu B2B API fail, log warning nhưng không throw error
      console.warn(
        "⚠️ B2B orders API failed (may not have B2B orders):",
        ordersB2BResponse.reason?.message
      );
    }

    // Gộp B2C và B2B orders
    const allOrders = [...ordersB2C, ...ordersB2B];

    // Lọc orders theo date range
    let filteredOrders = allOrders.filter((order) => {
      if (!order.orderDate) {
        console.warn("Order missing orderDate:", order.orderId || order.id);
        return false;
      }

      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) {
        console.warn(
          "Invalid orderDate:",
          order.orderDate,
          "Order:",
          order.orderId || order.id
        );
        return false;
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return orderDate >= start && orderDate <= end;
    });

    // Tính toán dữ liệu tháng trước để so sánh
    const prevMonthStart = new Date(
      new Date(startDate).setMonth(new Date(startDate).getMonth() - 1)
    );
    const prevMonthEnd = new Date(
      new Date(endDate).setMonth(new Date(endDate).getMonth() - 1)
    );

    const [
      prevQuotationsResponse,
      prevOrdersB2CResponse,
      prevOrdersB2BResponse,
    ] = await Promise.allSettled([
      apiConstSaleService.get(`${BASE_QUOTATION_URL}/dealer/${dealerId}`, {
        params: {
          dateFrom: prevMonthStart.toISOString().split("T")[0],
          dateTo: prevMonthEnd.toISOString().split("T")[0],
        },
      }),
      apiConstSaleService.get(`${BASE_ORDER_B2C_URL}/dealer/${dealerId}`),
      apiConstSaleService.get(`${BASE_ORDER_B2B_URL}`, {
        params: {
          page: 0,
          size: 1000,
        },
      }),
    ]);

    const prevQuotations =
      prevQuotationsResponse.status === "fulfilled"
        ? prevQuotationsResponse.value.data?.data ||
          prevQuotationsResponse.value.data ||
          []
        : [];

    const prevOrdersB2C =
      prevOrdersB2CResponse.status === "fulfilled"
        ? prevOrdersB2CResponse.value.data?.data ||
          prevOrdersB2CResponse.value.data ||
          []
        : [];

    let prevOrdersB2B = [];
    if (prevOrdersB2BResponse.status === "fulfilled") {
      const prevB2bData =
        prevOrdersB2BResponse.value.data?.data ||
        prevOrdersB2BResponse.value.data;
      if (prevB2bData?.content) {
        prevOrdersB2B = prevB2bData.content;
      } else if (Array.isArray(prevB2bData)) {
        prevOrdersB2B = prevB2bData;
      }
    }

    const prevAllOrders = [...prevOrdersB2C, ...prevOrdersB2B];
    const prevFilteredOrders = prevAllOrders.filter((order) => {
      if (!order.orderDate) return false;

      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;

      const start = new Date(prevMonthStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(prevMonthEnd);
      end.setHours(23, 59, 59, 999);
      return orderDate >= start && orderDate <= end;
    });

    return {
      quotations,
      orders: filteredOrders,
      prevQuotations,
      prevOrders: prevFilteredOrders,
      dateRange: { startDate, endDate },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
