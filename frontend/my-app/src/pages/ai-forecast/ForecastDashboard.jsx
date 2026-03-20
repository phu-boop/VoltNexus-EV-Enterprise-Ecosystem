import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Calendar,
} from "lucide-react";
import forecastService from "../../services/ai/forecastService";
import {
  getSalesSummary,
  getInventoryVelocity,
} from "../../features/admin/reporting/services/reportingService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ForecastDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  // Detect if we're in admin or staff context from URL
  const basePath = location.pathname.includes("/evm/staff/")
    ? "/evm/staff/reports/forecast"
    : "/evm/admin/reports/forecast";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, [daysBack]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Gọi API từ Reporting Service để lấy dữ liệu thực
      const [salesResponse, inventoryResponse] = await Promise.all([
        getSalesSummary({}),
        getInventoryVelocity({}),
      ]);

      // Transform data để phù hợp với format dashboard
      const salesData = Array.isArray(salesResponse.data)
        ? salesResponse.data
        : [];
      const inventoryData = Array.isArray(inventoryResponse.data)
        ? inventoryResponse.data
        : [];

      // Tính toán sales metrics từ sales data
      const totalSales = salesData.reduce(
        (sum, item) => sum + (Number(item.totalUnitsSold) || 0),
        0
      );
      const totalRevenue = salesData.reduce(
        (sum, item) => sum + (Number(item.totalRevenue) || 0),
        0
      );
      const totalOrders = salesData.reduce(
        (sum, item) => sum + (Number(item.orderCount) || 0),
        0
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Tìm top selling variant
      const topVariant = salesData.reduce((top, item) => {
        const units = Number(item.totalUnitsSold) || 0;
        return units > (Number(top?.totalUnitsSold) || 0) ? item : top;
      }, null);

      // Tính toán regional performance từ cả sales và inventory data
      const regionMap = new Map();

      // Add sales data by region
      salesData.forEach((item) => {
        const region = item.region || "Unknown";
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            totalSales: 0,
            totalInventory: 0,
            trend: "STABLE",
          });
        }
        const regionData = regionMap.get(region);
        regionData.totalSales += Number(item.totalUnitsSold) || 0;
      });

      // Add inventory data by region
      inventoryData.forEach((item) => {
        const region = item.region || "Unknown";
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            totalSales: 0,
            totalInventory: 0,
            trend: "STABLE",
          });
        }
        const regionData = regionMap.get(region);
        regionData.totalInventory += Number(item.currentStock) || 0;

        // Determine trend based on velocity
        if (item.velocityLevel === "FAST") {
          regionData.trend = "INCREASING";
        } else if (item.velocityLevel === "SLOW") {
          regionData.trend = "DECREASING";
        }
      });

      const regionalPerformances = Array.from(regionMap.values());

      // Calculate total inventory
      const totalInventory = inventoryData.reduce(
        (sum, item) => sum + (Number(item.currentStock) || 0),
        0
      );
      const lowStockVariants = inventoryData.filter(
        (item) =>
          item.velocityLevel === "FAST" && Number(item.currentStock) < 10
      ).length;

      const dashboardData = {
        salesAnalytics: {
          totalSales: totalSales,
          totalRevenue: totalRevenue,
          totalOrders: totalOrders,
          averageOrderValue: averageOrderValue,
          topSellingVariant: topVariant
            ? `${topVariant.modelName} - ${topVariant.variantName}`
            : "N/A",
        },
        inventoryAnalytics: {
          totalInventory: totalInventory,
          lowStockVariants: lowStockVariants,
        },
        regionalPerformances: regionalPerformances,
      };

      setDashboard(dashboardData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">
          Không thể tải dữ liệu dashboard
        </div>
      </div>
    );
  }

  const { salesAnalytics, inventoryAnalytics, regionalPerformances } =
    dashboard;

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Dự Báo & Phân Tích</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi hiệu suất bán hàng và tồn kho theo thời gian thực
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`${basePath}/demand`)}
          className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div className="text-left">
            <h3 className="font-semibold text-blue-900">Dự Báo Nhu Cầu</h3>
            <p className="text-sm text-blue-700">
              Tạo dự báo cho sản phẩm & khu vực
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate(`${basePath}/production`)}
          className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
        >
          <Calendar className="h-8 w-8 text-green-600" />
          <div className="text-left">
            <h3 className="font-semibold text-green-900">Kế Hoạch Sản Xuất</h3>
            <p className="text-sm text-green-700">
              Lập kế hoạch dựa trên dự báo
            </p>
          </div>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Doanh Số
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesAnalytics?.totalSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">xe đã bán</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Doanh Thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesAnalytics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesAnalytics?.totalOrders || 0} đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tồn Kho
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryAnalytics?.totalInventory || 0}
            </div>
            <p className="text-xs text-muted-foreground">xe trong kho</p>
          </CardContent>
        </Card>

        {/* Low Stock Warning */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              Cảnh Báo Tồn Kho
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventoryAnalytics?.lowStockVariants || 0}
            </div>
            <p className="text-xs text-orange-600">variants tồn kho thấp</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Theo Khu Vực</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalPerformances || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSales" fill="#0088FE" name="Doanh số" />
                <Bar dataKey="totalInventory" fill="#00C49F" name="Tồn kho" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Doanh Số Theo Khu Vực</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalPerformances || []}
                  dataKey="totalSales"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(regionalPerformances || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Variant */}
      {salesAnalytics?.topSellingVariant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sản Phẩm Bán Chạy Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {salesAnalytics.topSellingVariant}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Giá trị đơn hàng trung bình:{" "}
              {formatCurrency(salesAnalytics.averageOrderValue || 0)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi Tiết Hiệu Suất Khu Vực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Khu Vực</th>
                  <th className="text-right p-2">Doanh Số</th>
                  <th className="text-right p-2">Tồn Kho</th>
                  <th className="text-center p-2">Xu Hướng</th>
                </tr>
              </thead>
              <tbody>
                {(regionalPerformances || []).map((region, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{region.region}</td>
                    <td className="text-right p-2">{region.totalSales}</td>
                    <td className="text-right p-2">{region.totalInventory}</td>
                    <td className="text-center p-2">
                      {region.trend === "INCREASING" && (
                        <span className="inline-flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          Tăng
                        </span>
                      )}
                      {region.trend === "DECREASING" && (
                        <span className="inline-flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          Giảm
                        </span>
                      )}
                      {region.trend === "STABLE" && (
                        <span className="text-gray-600">Ổn định</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
