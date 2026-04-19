import { useState, useEffect } from 'react';
import { getPaymentStatistics } from '../../../services/paymentAdminService';
import Loading from '../../ui/Loading';

export default function PaymentStatistics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });

    useEffect(() => {
        loadStatistics();
    }, [dateRange]);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const startDate = dateRange.startDate ? `${dateRange.startDate}T00:00:00` : null;
            const endDate = dateRange.endDate ? `${dateRange.endDate}T23:59:59` : null;

            const data = await getPaymentStatistics(startDate, endDate);
            setStats(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const StatCard = ({ title, value, subtitle, color = 'blue' }) => (
        <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
            <p className={`text-${color}-600 text-sm font-medium mb-2`}>{title}</p>
            <p className={`text-3xl font-bold text-${color}-900`}>{value}</p>
            {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4 text-gray-900">Khoảng thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="date"
                        value={dateRange.startDate || ''}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Từ ngày"
                    />
                    <input
                        type="date"
                        value={dateRange.endDate || ''}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đến ngày"
                    />
                    <button
                        onClick={() => setDateRange({ startDate: null, endDate: null })}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-lg shadow p-12">
                    <Loading message="Đang tải thống kê..." />
                </div>
            ) : !stats ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">Không có dữ liệu thống kê</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Tổng doanh thu"
                            value={formatCurrency(stats.totalRevenue)}
                            color="blue"
                        />
                        <StatCard
                            title="Đơn hàng hoàn thành"
                            value={stats.completedOrders?.toString() || '0'}
                            subtitle={`${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% tổng số`}
                            color="green"
                        />
                        <StatCard
                            title="Đơn hàng chờ xử lý"
                            value={stats.pendingOrders?.toString() || '0'}
                            subtitle={formatCurrency(stats.pendingAmount)}
                            color="yellow"
                        />
                        <StatCard
                            title="Đơn hàng thất bại"
                            value={stats.failedOrders?.toString() || '0'}
                            color="red"
                        />
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Phân bố theo trạng thái</h3>
                        {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                                    const percentage = stats.totalOrders > 0
                                        ? ((count / stats.totalOrders) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <div key={status}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{status}</span>
                                                <span className="text-gray-600">{count} ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
                        )}
                    </div>

                    {/* Payment Method Distribution */}
                    {stats.revenueByMethod && Object.keys(stats.revenueByMethod).length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                Doanh thu theo phương thức thanh toán
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(stats.revenueByMethod).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                        <span className="font-medium text-gray-700">{method}</span>
                                        <span className="text-gray-900 font-semibold">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completion Rate */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Tỉ lệ hoàn thành</h3>
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-blue-600">
                                    {stats.completionRate?.toFixed(1) || 0}%
                                </div>
                                <p className="text-gray-600 mt-2">
                                    {stats.completedOrders} / {stats.totalOrders} đơn hàng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
