import api from './api';

/**
 * Dashboard Service - Aggregate data for admin dashboard
 */

// Get dashboard statistics
export const getDashboardStats = async () => {
  const defaultStats = {
    totalVehicles: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockVehicles: 0,
    pendingTestDrives: 0,
    scheduledTestDrives: 0,
    pendingReviews: 0
  };

  try {
    // Fetch orders
    const ordersResponse = await api.get('/api/v1/sales-orders/b2c');
    const ordersList = ordersResponse.data?.data?.content || [];

    // Fetch vehicles
    const vehiclesResponse = await api.get('/vehicles/vehicle-catalog/variants/paginated', {
      params: { page: 0, size: 1000 }
    }).catch(() => ({ data: { data: { content: [] } } }));
    const vehiclesList = vehiclesResponse.data?.data?.content || [];

    // Fetch customers
    const customersResponse = await api.get('/customers').catch(() => ({ data: { data: [] } }));
    const customersList = customersResponse.data?.data || [];

    // Fetch all test drives (no status filter to get total count)
    const testDrivesResponse = await api.post('/customers/api/test-drives/filter', {
      statuses: null, // Get all statuses
      startDate: null,
      endDate: null
    }).catch(() => ({ data: { data: [] } }));
    const testDrivesList = testDrivesResponse.data?.data || [];

    // Calculate stats from orders
    const totalRevenue = ordersList.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);

    const pendingOrders = ordersList.filter(
      order => order.orderStatusB2C === 'PENDING' || order.orderStatusB2C === 'EDITED'
    ).length;

    // Count total test drives and pending ones
    const totalTestDrives = testDrivesList.length;
    const pendingTestDrives = testDrivesList.filter(
      td => td.status === 'SCHEDULED'
    ).length;

    return {
      totalVehicles: vehiclesList.length,
      totalOrders: ordersList.length,
      totalCustomers: customersList.length,
      totalRevenue: totalRevenue,
      pendingOrders: pendingOrders,
      lowStockVehicles: 0, // TODO: Add inventory API
      pendingTestDrives: totalTestDrives, // Show total count
      scheduledTestDrives: pendingTestDrives, // Keep track of scheduled ones for badge
      pendingReviews: 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return defaultStats;
  }
};

// Get revenue chart data (monthly)
export const getRevenueChartData = async () => {
  try {
    const response = await api.get('/api/v1/sales-orders/b2c');
    const orders = response.data?.data?.content || [];

    // Group orders by month
    const monthlyData = {};
    orders.forEach(order => {
      if (order.orderDate && order.totalAmount) {
        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            revenue: 0,
            orders: 0
          };
        }
        
        monthlyData[monthKey].revenue += parseFloat(order.totalAmount) || 0;
        monthlyData[monthKey].orders += 1;
      }
    });

    // Convert to array and sort by date
    const chartData = Object.keys(monthlyData)
      .sort()
      .slice(-12) // Last 12 months
      .map(key => {
        const [year, month] = key.split('-');
        return {
          month: `T${parseInt(month)}`,
          revenue: monthlyData[key].revenue,
          orders: monthlyData[key].orders
        };
      });

    return chartData.length > 0 ? chartData : [
      { month: 'T1', revenue: 0, orders: 0 }
    ];
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    return [{ month: 'T1', revenue: 0, orders: 0 }];
  }
};

// Get top selling vehicles
export const getTopVehicles = async () => {
  try {
    const response = await api.get('/api/v1/sales-orders/b2c');
    const orders = response.data?.data?.content || [];

    // Count sales by vehicle variant
    const vehicleSales = {};
    orders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const name = item.modelName || item.variantName || `Variant ${item.variantId}`;
          if (!vehicleSales[name]) {
            vehicleSales[name] = 0;
          }
          vehicleSales[name] += item.quantity || 1;
        });
      }
    });

    // Convert to array and sort
    const topVehicles = Object.keys(vehicleSales)
      .map(name => ({
        name,
        sales: vehicleSales[name]
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Add colors
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    return topVehicles.map((vehicle, index) => ({
      ...vehicle,
      color: colors[index] || '#6b7280'
    }));
  } catch (error) {
    console.error('Error fetching top vehicles:', error);
    return [];
  }
};

// Get order status distribution
export const getOrderStatusData = async () => {
  try {
    const response = await api.get('/api/v1/sales-orders/b2c');
    const orders = response.data?.data?.content || [];

    const statusCount = {
      'PENDING': 0,
      'EDITED': 0,
      'APPROVED': 0,
      'CONFIRMED': 0,
      'IN_PRODUCTION': 0,
      'READY_FOR_DELIVERY': 0,
      'DELIVERED': 0,
      'COMPLETED': 0,
      'CANCELLED': 0,
      'REJECTED': 0
    };

    orders.forEach(order => {
      const status = order.orderStatusB2C;
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    // Group into simplified categories
    const statusData = [
      {
        name: 'Chờ xác nhận',
        value: statusCount.PENDING + statusCount.EDITED,
        color: '#eab308'
      },
      {
        name: 'Đã xác nhận',
        value: statusCount.APPROVED + statusCount.CONFIRMED,
        color: '#3b82f6'
      },
      {
        name: 'Đang xử lý',
        value: statusCount.IN_PRODUCTION + statusCount.READY_FOR_DELIVERY,
        color: '#6366f1'
      },
      {
        name: 'Đã giao',
        value: statusCount.DELIVERED + statusCount.COMPLETED,
        color: '#10b981'
      },
      {
        name: 'Đã hủy',
        value: statusCount.CANCELLED + statusCount.REJECTED,
        color: '#ef4444'
      }
    ].filter(item => item.value > 0);

    return statusData.length > 0 ? statusData : [
      { name: 'Chưa có dữ liệu', value: 1, color: '#d1d5db' }
    ];
  } catch (error) {
    console.error('Error fetching order status data:', error);
    return [{ name: 'Chưa có dữ liệu', value: 1, color: '#d1d5db' }];
  }
};

export default {
  getDashboardStats,
  getRevenueChartData,
  getTopVehicles,
  getOrderStatusData
};
