import React, { useMemo } from "react";
import { FiDollarSign, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import StatCard from "../../../dealer/dashboard/components/StatCard";
import RevenueChart from "../../../dealer/dashboard/components/RevenueChart";

/**
 * Financial Reports Component
 * Hiển thị báo cáo tài chính: doanh thu theo khu vực, công nợ, thanh toán
 */
const FinancialReports = ({ 
  revenueByRegion = [],
  dealerDebt = [],
  orders = []
}) => {
  // Tính tổng công nợ
  const totalDebt = useMemo(() => {
    return dealerDebt.reduce((total, debt) => {
      return total + (parseFloat(debt.currentBalance) || parseFloat(debt.totalOwed) || 0);
    }, 0);
  }, [dealerDebt]);

  // Tính tổng thanh toán
  const totalPayments = useMemo(() => {
    return dealerDebt.reduce((total, debt) => {
      return total + (parseFloat(debt.totalPaid) || 0);
    }, 0);
  }, [dealerDebt]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Báo Cáo Tài Chính</h2>
        <p className="text-gray-600">Thống kê tài chính và thanh toán</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Công Nợ Đại Lý"
          value={formatCurrency(totalDebt)}
          subtitle={`${dealerDebt.length} đại lý có công nợ`}
          icon={FiTrendingDown}
          color="red"
        />
        <StatCard
          title="Tổng Thanh Toán"
          value={formatCurrency(totalPayments)}
          subtitle="Tổng số tiền đã thanh toán"
          icon={FiCreditCard}
          color="green"
        />
        <StatCard
          title="Số Đại Lý Có Nợ"
          value={dealerDebt.length.toString()}
          subtitle="Đại lý đang có công nợ"
          icon={FiDollarSign}
          color="orange"
        />
      </div>

      {/* Revenue by Region Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh Thu Theo Khu Vực</h3>
        {revenueByRegion.length > 0 ? (
          <div className="space-y-4">
            {revenueByRegion.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{region.region}</p>
                  <p className="text-sm text-gray-600">{region.orderCount} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(region.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu doanh thu theo khu vực</p>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xu Hướng Doanh Thu</h3>
        <RevenueChart orders={orders} />
      </div>
    </div>
  );
};

export default FinancialReports;

