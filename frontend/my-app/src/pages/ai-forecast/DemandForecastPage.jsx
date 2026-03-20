import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import Button from "../../components/ui/Button";
import Swal from "sweetalert2";
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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Package,
  AlertCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import forecastService from "../../services/ai/forecastService";

export default function DemandForecastPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes("/evm/staff/")
    ? "/evm/staff/reports/forecast"
    : "/evm/admin/reports/forecast";
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [formData, setFormData] = useState({
    variantId: "",
    daysToForecast: 30,
    forecastMethod: "AUTO",
    region: "",
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const request = {
        variantId: formData.variantId ? Number(formData.variantId) : null,
        daysToForecast: formData.daysToForecast,
        forecastMethod: formData.forecastMethod,
        region: formData.region || null,
      };

      const response = await forecastService.generateForecast(request);

      if (
        !response.data ||
        !response.data.forecasts ||
        response.data.forecasts.length === 0
      ) {
        Swal.fire({
          title: "⚠️ Không có dữ liệu dự báo!",
          html: '<p><strong>Nguyên nhân:</strong> Chưa có dữ liệu bán hàng/tồn kho thực tế trong hệ thống.</p><p><strong>Giải pháp:</strong></p><ol style="text-align: left; margin-left: 20px;"><li>Tạo đơn hàng (Sales) từ Dealer Portal</li><li>Cập nhật tồn kho (Inventory) từ EVM Portal</li><li>Đợi AI Service thu thập dữ liệu qua Kafka (real-time)</li></ol>',
          icon: "warning",
          confirmButtonText: "Đã hiểu",
        });
        return;
      }

      setForecastData(response.data);
    } catch (error) {
      console.error("Error generating forecast:", error);
      Swal.fire(
        "Lỗi!",
        "Lỗi khi tạo dự báo: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "INCREASING":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "DECREASING":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "VOLATILE":
        return <Activity className="h-4 w-4 text-orange-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Dự Báo Nhu Cầu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo dự báo nhu cầu cho sản phẩm và khu vực
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(basePath)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`${basePath}/production`)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Kế Hoạch SX
          </Button>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mt-2">
          Dự báo nhu cầu sử dụng AI/ML để lập kế hoạch sản xuất và phân phối
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tạo Dự Báo Mới</CardTitle>
          <CardDescription>
            Nhập thông tin để tạo dự báo nhu cầu cho sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Variant ID (Tùy chọn)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Bỏ trống để dự báo tất cả"
                value={formData.variantId}
                onChange={(e) =>
                  setFormData({ ...formData, variantId: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Số Ngày Dự Báo
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.daysToForecast}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daysToForecast: Number(e.target.value),
                  })
                }
              >
                <option value={7}>7 ngày</option>
                <option value={15}>15 ngày</option>
                <option value={30}>30 ngày</option>
                <option value={60}>60 ngày</option>
                <option value={90}>90 ngày</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phương Pháp
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.forecastMethod}
                onChange={(e) =>
                  setFormData({ ...formData, forecastMethod: e.target.value })
                }
              >
                <option value="OPENAI">🤖 OpenAI (Khuyến nghị)</option>
                <option value="AUTO">AUTO (Tự động)</option>
                <option value="MOVING_AVERAGE">Moving Average</option>
                <option value="LINEAR_REGRESSION">Linear Regression</option>
                <option value="WEIGHTED_AVERAGE">Weighted Average</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Khu Vực (Tùy chọn)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Miền Bắc, Miền Nam..."
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Đang tạo dự báo..." : "🚀 Tạo Dự Báo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {forecastData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng Nhu Cầu Dự Báo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forecastData.summary.totalPredictedDemand}
                </div>
                <p className="text-xs text-muted-foreground">đơn vị</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tồn Kho Hiện Tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forecastData.summary.totalCurrentInventory}
                </div>
                <p className="text-xs text-muted-foreground">đơn vị</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600">
                  Chênh Lệch Sản Xuất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {forecastData.summary.productionGap}
                </div>
                <p className="text-xs text-orange-600">cần sản xuất thêm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Độ Tin Cậy TB
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(forecastData.summary.averageConfidence * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  confidence score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu Đồ Dự Báo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData.forecasts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="variantName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="predictedDemand" fill="#0088FE" name="Dự báo" />
                  <Bar
                    dataKey="currentInventory"
                    fill="#00C49F"
                    name="Tồn kho"
                  />
                  <Bar
                    dataKey="historicalAverage"
                    fill="#FFBB28"
                    name="TB lịch sử"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Chi Tiết Dự Báo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Sản Phẩm</th>
                      <th className="text-right p-2">Dự Báo</th>
                      <th className="text-right p-2">Tồn Kho</th>
                      <th className="text-right p-2">Đề Xuất</th>
                      <th className="text-center p-2">Xu Hướng</th>
                      <th className="text-center p-2">Độ Tin Cậy</th>
                      <th className="text-center p-2">Phương Pháp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.forecasts.map((forecast, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">
                            {forecast.variantName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {forecast.modelName}
                          </div>
                        </td>
                        <td className="text-right p-2 font-semibold">
                          {forecast.predictedDemand}
                        </td>
                        <td className="text-right p-2">
                          {forecast.currentInventory}
                        </td>
                        <td className="text-right p-2 text-orange-600 font-medium">
                          {forecast.recommendedStock}
                        </td>
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            {getTrendIcon(forecast.trend)}
                            <span className="text-xs">{forecast.trend}</span>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                              forecast.confidenceScore
                            )}`}
                          >
                            {(forecast.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="text-center p-2 text-xs">
                          {forecast.forecastMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {forecastData.summary.lowStockVariants > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      ⚠️ Cảnh Báo Tồn Kho Thấp
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Có{" "}
                      <strong>{forecastData.summary.lowStockVariants}</strong>{" "}
                      variants có tồn kho thấp hơn 50% nhu cầu dự báo. Cần lên
                      kế hoạch sản xuất ngay!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Info Card */}
      {!forecastData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  💡 Hướng Dẫn Sử Dụng
                </h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Để dự báo cho tất cả variants, bỏ trống Variant ID</li>
                  <li>AUTO mode sẽ tự động chọn thuật toán tốt nhất</li>
                  <li>Confidence score cao hơn = dự báo chính xác hơn</li>
                  <li>
                    Production Gap = Predicted Demand + Safety Stock - Current
                    Inventory
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
