/**
 * Utility functions để chuẩn bị dữ liệu cho biểu đồ đơn hàng
 */

/**
 * Helper function để lấy status string từ order
 */
const getOrderStatusForChart = (order) => {
  let status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
  if (status && typeof status === 'object') {
    status = status.name || status.toString();
  }
  if (status) {
    status = String(status).toUpperCase().trim();
  }
  return status || '';
};

/**
 * Tính số lượng đơn hàng theo ngày
 */
export const calculateDailyOrders = (orders, periodType = 'day') => {
  if (!orders || orders.length === 0) return [];

  const orderMap = {};
  
  orders.forEach(order => {
    if (!order.orderDate) return;
    
    const orderDate = new Date(order.orderDate);
    if (isNaN(orderDate.getTime())) return;
    
    let key;
    if (periodType === 'day') {
      key = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (periodType === 'week') {
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay() + 1); // Monday
      key = `Week ${weekStart.toISOString().split('T')[0]}`;
    } else if (periodType === 'month') {
      key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (key) {
      if (!orderMap[key]) {
        orderMap[key] = {
          date: key,
          count: 0,
          confirmed: 0,
          delivered: 0,
          pending: 0
        };
      }
      orderMap[key].count += 1;
      
      const status = getOrderStatusForChart(order);
      if (['CONFIRMED', 'APPROVED'].includes(status)) {
        orderMap[key].confirmed += 1;
      } else if (status === 'DELIVERED') {
        orderMap[key].delivered += 1;
      } else if (['PENDING', 'CREATED'].includes(status)) {
        orderMap[key].pending += 1;
      }
    }
  });
  
  return Object.values(orderMap).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Tính số lượng đơn hàng theo tuần
 */
export const calculateWeeklyOrders = (orders) => {
  return calculateDailyOrders(orders, 'week');
};

/**
 * Tính số lượng đơn hàng theo tháng
 */
export const calculateMonthlyOrders = (orders) => {
  return calculateDailyOrders(orders, 'month');
};

