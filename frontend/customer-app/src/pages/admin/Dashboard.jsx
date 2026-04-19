import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  Star
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dashboardService from '../../services/dashboardService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingTestDrives: 0,
    lowStockVehicles: 0,
    pendingReviews: 0
  });

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
    refetchInterval: 60000,
    retry: false,
    onError: (error) => {
      console.error('Error loading dashboard stats:', error);
    }
  });

  // Fetch revenue chart data
  const { data: revenueData = [] } = useQuery({
    queryKey: ['revenueChart'],
    queryFn: dashboardService.getRevenueChartData,
    refetchInterval: 300000,
    retry: false
  });

  // Fetch top vehicles data
  const { data: topVehiclesData = [] } = useQuery({
    queryKey: ['topVehicles'],
    queryFn: dashboardService.getTopVehicles,
    refetchInterval: 300000,
    retry: false
  });

  // Fetch order status data
  const { data: orderStatusData = [] } = useQuery({
    queryKey: ['orderStatus'],
    queryFn: dashboardService.getOrderStatusData,
    refetchInterval: 60000,
    retry: false
  });

  // Update stats when data is loaded
  useEffect(() => {
    if (dashboardStats) {
      setStats(dashboardStats);
    }
  }, [dashboardStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Calculate growth rate
  const calculateGrowth = () => {
    if (revenueData.length < 2) return '+0%';
    const lastMonth = revenueData[revenueData.length - 1];
    const prevMonth = revenueData[revenueData.length - 2];
    if (!prevMonth || prevMonth.revenue === 0) return '+0%';
    
    const growth = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1);
    return growth > 0 ? `+${growth}%` : `${growth}%`;
  };

  const statCards = [
    {
      icon: Car,
      label: 'Tổng số xe',
      value: stats.totalVehicles,
      color: 'blue',
      link: '/admin/vehicles'
    },
    {
      icon: ShoppingCart,
      label: 'Đơn hàng',
      value: stats.totalOrders,
      color: 'green',
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} chờ xử lý` : null,
      link: '/admin/orders'
    },
    {
      icon: Users,
      label: 'Khách hàng',
      value: stats.totalCustomers,
      color: 'purple',
      link: '/admin/customers'
    },
    {
      icon: DollarSign,
      label: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      color: 'yellow',
      link: '/admin/reports'
    },
    {
      icon: Calendar,
      label: 'Lịch lái thử',
      value: stats.pendingTestDrives,
      color: 'indigo',
      badge: stats.scheduledTestDrives > 0 ? `${stats.scheduledTestDrives} chờ xác nhận` : null,
      link: '/admin/test-drives'
    },
    {
      icon: Package,
      label: 'Xe sắp hết',
      value: stats.lowStockVehicles,
      color: 'red',
      badge: 'cần nhập thêm',
      link: '/admin/vehicles'
    },
    {
      icon: Star,
      label: 'Đánh giá',
      value: stats.pendingReviews,
      color: 'orange',
      badge: 'chờ duyệt',
      link: '/admin/reviews'
    },
    {
      icon: TrendingUp,
      label: 'Tăng trưởng',
      value: calculateGrowth(),
      color: 'teal',
      badge: 'so với tháng trước',
      link: '/admin/reports'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600'
  };

  // Show loading state
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Chào mừng đến với trang quản trị VinPhust</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {card.value}
                  </p>
                  {card.badge && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/vehicles/new"
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-center"
          >
            <Car className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="font-medium">Thêm xe mới</p>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition text-center"
          >
            <ShoppingCart className="mx-auto mb-2 text-green-600" size={32} />
            <p className="font-medium">Xử lý đơn hàng</p>
          </Link>
          <Link
            to="/admin/promotions/new"
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-center"
          >
            <DollarSign className="mx-auto mb-2 text-purple-600" size={32} />
            <p className="font-medium">Tạo khuyến mãi</p>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Doanh thu theo tháng</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#1f2937' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu"
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ xe bán chạy */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top xe bán chạy</h2>
          {topVehiclesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVehiclesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Số lượng bán" radius={[8, 8, 0, 0]}>
                  {topVehiclesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ trạng thái đơn hàng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ số đơn hàng theo tháng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Số lượng đơn hàng</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="orders" 
                  name="Đơn hàng" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
