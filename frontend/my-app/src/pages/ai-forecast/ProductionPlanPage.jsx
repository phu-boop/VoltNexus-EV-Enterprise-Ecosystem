import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import Button from "../../components/ui/Button";
import {
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Swal from "sweetalert2";
import forecastService from "../../services/ai/forecastService";

export default function ProductionPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes("/evm/staff/")
    ? "/evm/staff/reports/forecast"
    : "/evm/admin/reports/forecast";
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    // Set default month to current month
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`;
    setSelectedMonth(defaultMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadPlans();
    }
  }, [selectedMonth]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await forecastService.getProductionPlans(selectedMonth);
      setPlans(response.data || []);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await forecastService.generateProductionPlan(
        selectedMonth
      );
      setPlans(response.data || []);
      Swal.fire(
        "Thành công!",
        "Kế hoạch sản xuất đã được tạo thành công!",
        "success"
      );
    } catch (error) {
      console.error("Error generating plan:", error);
      Swal.fire("Lỗi!", "Lỗi khi tạo kế hoạch. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (planId) => {
    try {
      await forecastService.approveProductionPlan(planId);
      Swal.fire("Thành công!", "Kế hoạch đã được phê duyệt!", "success");
      loadPlans();
    } catch (error) {
      console.error("Error approving plan:", error);
      Swal.fire("Lỗi!", "Lỗi khi phê duyệt kế hoạch.", "error");
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      HIGH: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: "🔴",
        label: "Ưu Tiên Cao",
      },
      MEDIUM: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "🟡",
        label: "Ưu Tiên TB",
      },
      LOW: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "🟢",
        label: "Ưu Tiên Thấp",
      },
    };

    const badge = badges[priority] || badges.LOW;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
      >
        {badge.icon} {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800",
        icon: <Clock className="h-3 w-3" />,
        label: "Nháp",
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3" />,
        label: "Đã Duyệt",
      },
      EXECUTED: {
        color: "bg-blue-100 text-blue-800",
        icon: <Factory className="h-3 w-3" />,
        label: "Đang SX",
      },
    };

    const badge = badges[status] || badges.DRAFT;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const totalStats = plans.reduce(
    (acc, plan) => {
      return {
        totalProduction:
          acc.totalProduction + (plan.recommendedProduction || 0),
        totalDemand: acc.totalDemand + (plan.predictedDemand || 0),
        totalGap: acc.totalGap + (plan.productionGap || 0),
        highPriority: acc.highPriority + (plan.priority === "HIGH" ? 1 : 0),
      };
    },
    { totalProduction: 0, totalDemand: 0, totalGap: 0, highPriority: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏭 Kế Hoạch Sản Xuất</h1>
          <p className="text-muted-foreground mt-2">
            Lập kế hoạch sản xuất dựa trên dự báo nhu cầu từ AI
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
            onClick={() => navigate(`${basePath}/demand`)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dự Báo
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tạo Kế Hoạch Sản Xuất</CardTitle>
          <CardDescription>
            Chọn tháng và tạo kế hoạch sản xuất tự động
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Tháng Kế Hoạch
              </label>
              <input
                type="month"
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedMonth ? selectedMonth.substring(0, 7) : ""}
                onChange={(e) => setSelectedMonth(`${e.target.value}-01`)}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedMonth}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang tạo..." : "🚀 Tạo Kế Hoạch"}
            </Button>

            <Button
              onClick={loadPlans}
              disabled={loading || !selectedMonth}
              variant="outline"
            >
              🔄 Tải Lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Sản Lượng Đề Xuất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats.totalProduction}
              </div>
              <p className="text-xs text-muted-foreground">
                đơn vị cần sản xuất
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Nhu Cầu Dự Báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalDemand}</div>
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
                {totalStats.totalGap}
              </div>
              <p className="text-xs text-orange-600">production gap</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Ưu Tiên Cao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalStats.highPriority}
              </div>
              <p className="text-xs text-red-600">variants cần xử lý gấp</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Production Plans Table */}
      {plans.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Danh Sách Kế Hoạch Sản Xuất</CardTitle>
            <CardDescription>
              Được sắp xếp theo mức độ ưu tiên và chênh lệch sản xuất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg">
                            {plan.variantName}
                          </h3>
                          {getPriorityBadge(plan.priority)}
                          {getStatusBadge(plan.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Đề Xuất SX
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {plan.recommendedProduction}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Nhu Cầu DT
                            </div>
                            <div className="text-lg font-semibold">
                              {plan.predictedDemand}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Tồn Kho
                            </div>
                            <div className="text-lg font-semibold">
                              {plan.currentInventory}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Gap
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              {plan.productionGap}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            💡 Gợi Ý:
                          </div>
                          <div className="text-sm">{plan.recommendations}</div>
                        </div>
                      </div>

                      {plan.status === "DRAFT" && (
                        <div className="ml-4">
                          <Button
                            onClick={() => handleApprove(plan.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Phê Duyệt
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Factory className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  📋 Chưa Có Kế Hoạch
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Chọn tháng và nhấn "Tạo Kế Hoạch" để AI tự động tạo kế hoạch
                  sản xuất dựa trên dự báo nhu cầu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
