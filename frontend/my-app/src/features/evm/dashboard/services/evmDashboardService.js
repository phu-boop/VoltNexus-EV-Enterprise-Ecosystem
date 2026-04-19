/**
 * EVM Staff Dashboard Service
 * Hàm constant để fetch tất cả dữ liệu cần thiết cho EVM Staff dashboard
 */
import apiConstSaleService from "../../../../services/apiConstSaleService";
import apiConstInventoryService from "../../../../services/apiConstInventoryService";
import { getB2BOrders } from "../../inventory/services/evmSalesService";
import { getAllInventory } from "../../inventory/services/inventoryService";

const BASE_ORDER_B2B_URL = "/api/v1/sales-orders/b2b";

/**
 * Hàm constant để fetch tất cả dữ liệu EVM Staff dashboard
 * @param {string} staffId - ID của staff (optional, để filter orders processed by this staff)
 * @returns {Promise<Object>} Object chứa tất cả dữ liệu
 */
export const fetchEvmStaffDashboardData = async (staffId = null) => {
  try {
    // Tính toán date range (tháng hiện tại và tháng trước)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Tháng trước
    const firstDayOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthStart = firstDayOfMonth.toISOString().split("T")[0];
    const currentMonthEnd = lastDayOfMonth.toISOString().split("T")[0];
    const prevMonthStart = firstDayOfPrevMonth.toISOString().split("T")[0];
    const prevMonthEnd = lastDayOfPrevMonth.toISOString().split("T")[0];

    // Hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Fetch tất cả dữ liệu song song
    const [
      pendingOrdersResponse,
      allB2BOrdersResponse,
      inventoryResponse,
      allInventoryResponse,
    ] = await Promise.allSettled([
      // Fetch đơn hàng B2B chờ duyệt
      getB2BOrders({ status: "PENDING", page: 0, size: 1000 }),
      // Fetch tất cả đơn hàng B2B (để tính toán đã hoàn thành)
      getB2BOrders({ page: 0, size: 1000 }),
      // Fetch inventory với status IN_STOCK để lấy tổng số xe trong kho
      getAllInventory({ status: "IN_STOCK", page: 0, size: 1000 }),
      // Fetch tất cả inventory để tính toán
      getAllInventory({ page: 0, size: 1000 }),
    ]);

    // Xử lý đơn hàng chờ duyệt
    let pendingOrders = [];
    if (pendingOrdersResponse.status === "fulfilled") {
      const data = pendingOrdersResponse.value.data?.data;
      if (data?.content) {
        pendingOrders = data.content;
      } else if (Array.isArray(data)) {
        pendingOrders = data;
      }
    }

    // Xử lý tất cả đơn hàng B2B
    let allB2BOrders = [];
    if (allB2BOrdersResponse.status === "fulfilled") {
      const data = allB2BOrdersResponse.value.data?.data;
      if (data?.content) {
        allB2BOrders = data.content;
      } else if (Array.isArray(data)) {
        allB2BOrders = data;
      }
    }

    // Lọc đơn hàng đã hoàn thành (tháng này và tháng trước)
    const getOrderStatus = (order) => {
      let status = order.orderStatus;
      if (status && typeof status === "object") {
        status = status.name || status.toString();
      }
      return String(status || "")
        .toUpperCase()
        .trim();
    };

    const completedStatuses = ["CONFIRMED", "DELIVERED", "APPROVED"];

    const completedOrdersThisMonth = allB2BOrders.filter((order) => {
      const status = getOrderStatus(order);
      if (!completedStatuses.includes(status)) return false;

      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;

      const orderDateStr = orderDate.toISOString().split("T")[0];
      return (
        orderDateStr >= currentMonthStart && orderDateStr <= currentMonthEnd
      );
    });

    const completedOrdersPrevMonth = allB2BOrders.filter((order) => {
      const status = getOrderStatus(order);
      if (!completedStatuses.includes(status)) return false;

      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;

      const orderDateStr = orderDate.toISOString().split("T")[0];
      return orderDateStr >= prevMonthStart && orderDateStr <= prevMonthEnd;
    });

    // Tính tổng giá trị đơn hàng đã hoàn thành
    const totalRevenueThisMonth = completedOrdersThisMonth.reduce(
      (sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      },
      0
    );

    const totalRevenuePrevMonth = completedOrdersPrevMonth.reduce(
      (sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      },
      0
    );

    // Tính % thay đổi
    const revenueChangePercent =
      prevMonthStart > 0
        ? ((totalRevenueThisMonth - totalRevenuePrevMonth) /
            totalRevenuePrevMonth) *
          100
        : 0;

    // Xử lý inventory
    let inventoryData = [];
    if (inventoryResponse.status === "fulfilled") {
      const data = inventoryResponse.value.data?.data;
      if (data?.content) {
        inventoryData = data.content;
      } else if (Array.isArray(data)) {
        inventoryData = data;
      }
    }

    let allInventoryData = [];
    if (allInventoryResponse.status === "fulfilled") {
      const data = allInventoryResponse.value.data?.data;
      if (data?.content) {
        allInventoryData = data.content;
      } else if (Array.isArray(data)) {
        allInventoryData = data;
      }
    }

    // Tính tổng số xe trong kho trung tâm
    const totalVehiclesInWarehouse = inventoryData.reduce((sum, inv) => {
      return sum + (parseInt(inv.availableQuantity) || 0);
    }, 0);

    // Tính số xe đang điều phối (ALLOCATED)
    const vehiclesInTransit = allInventoryData.reduce((sum, inv) => {
      return sum + (parseInt(inv.allocatedQuantity) || 0);
    }, 0);

    // Tính số xe đã xuất kho hôm nay (từ đơn hàng đã ship hôm nay)
    const shippedOrdersToday = allB2BOrders.filter((order) => {
      const status = getOrderStatus(order);
      if (status !== "IN_TRANSIT" && status !== "DELIVERED") return false;

      // Kiểm tra nếu có shippedDate hoặc updatedDate hôm nay
      const checkDate =
        order.shippedDate || order.updatedDate || order.orderDate;
      if (!checkDate) return false;

      const date = new Date(checkDate);
      if (isNaN(date.getTime())) return false;

      const dateStr = date.toISOString().split("T")[0];
      return dateStr === todayStr;
    });

    // Đếm số xe đã xuất kho hôm nay (từ order items)
    const vehiclesShippedToday = shippedOrdersToday.reduce((sum, order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        return (
          sum +
          order.orderItems.reduce((itemSum, item) => {
            return itemSum + (parseInt(item.quantity) || 0);
          }, 0)
        );
      }
      return sum;
    }, 0);

    // Tính toán đơn hàng đã xử lý (có thể filter theo staffId nếu có)
    // Tạm thời lấy tất cả đơn hàng đã hoàn thành
    const processedOrders = completedOrdersThisMonth;

    // Tính top đại lý đã hỗ trợ (số đơn hàng đã xử lý cho từng đại lý)
    const dealerOrderCount = {};
    processedOrders.forEach((order) => {
      const dealerId = order.dealerId;
      if (dealerId) {
        if (!dealerOrderCount[dealerId]) {
          dealerOrderCount[dealerId] = {
            dealerId,
            orderCount: 0,
            totalRevenue: 0,
          };
        }
        dealerOrderCount[dealerId].orderCount += 1;
        dealerOrderCount[dealerId].totalRevenue +=
          parseFloat(order.totalAmount) || 0;
      }
    });

    const topDealers = Object.values(dealerOrderCount)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    return {
      pendingOrders,
      completedOrdersThisMonth,
      completedOrdersPrevMonth,
      totalRevenueThisMonth,
      totalRevenuePrevMonth,
      revenueChangePercent,
      totalVehiclesInWarehouse,
      vehiclesInTransit,
      vehiclesShippedToday,
      processedOrders,
      allB2BOrders,
      topDealers,
      dateRanges: {
        currentMonth: { start: currentMonthStart, end: currentMonthEnd },
        prevMonth: { start: prevMonthStart, end: prevMonthEnd },
        today: todayStr,
      },
    };
  } catch (error) {
    console.error("Error fetching EVM Staff dashboard data:", error);
    throw error;
  }
};
