import { useState, useEffect } from 'react';
import { filterPaymentRecords } from '../../../services/paymentAdminService';
import Loading from '../../ui/Loading';
import PaymentDetailModal from './PaymentDetailModal';

const STATUS_COLORS = {
    PENDING_DEPOSIT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    PAID: 'bg-green-100 text-green-800 border-green-300',
    PARTIALLY_PAID: 'bg-orange-100 text-orange-800 border-orange-300',
    FAILED: 'bg-red-100 text-red-800 border-red-300',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300'
};

const STATUS_LABELS = {
    PENDING_DEPOSIT: 'Chờ đặt cọc',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    PAID: 'Đã thanh toán',
    PARTIALLY_PAID: 'Thanh toán một phần',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy'
};

export default function PaymentRecordsList() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        startDate: null,
        endDate: null,
        orderId: null,
        customerId: null
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadRecords();
    }, [filters, page]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page,
                size: 20,
                sort: 'createdAt,desc'
            };

            // Remove null/empty values and format dates
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            // Format dates for backend (LocalDateTime)
            if (params.startDate) {
                params.startDate = `${params.startDate}T00:00:00`;
            }
            if (params.endDate) {
                params.endDate = `${params.endDate}T23:59:59`;
            }

            const response = await filterPaymentRecords(params);
            setRecords(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error('Error loading payment records:', error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0); // Reset to first page when filter changes
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const filteredRecords = records.filter(record => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            record.orderId?.toString().toLowerCase().includes(search) ||
            record.customerName?.toLowerCase().includes(search) ||
            record.customerEmail?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4 text-gray-900">Bộ lọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm theo Order ID, khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING_DEPOSIT">Chờ đặt cọc</option>
                        <option value="PARTIALLY_PAID">Thanh toán một phần</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>

                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Từ ngày"
                    />

                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đến ngày"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                        Danh sách thanh toán ({filteredRecords.length})
                    </h3>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loading message="Đang tải danh sách thanh toán..." />
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không tìm thấy bản ghi thanh toán nào
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách hàng</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Tổng tiền</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Đã thanh toán</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Còn lại</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.recordId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                                {record.orderId?.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.customerName || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {record.customerEmail || ''}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                                {formatCurrency(record.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-green-600">
                                                {formatCurrency(record.amountPaid)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-orange-600">
                                                {formatCurrency(record.remainingAmount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[record.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                                                    }`}>
                                                    {STATUS_LABELS[record.status] || record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {formatDate(record.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedRecord(record)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setPage(prev => Math.max(0, prev - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Trang trước
                        </button>
                        <span className="text-sm text-gray-600">
                            Trang {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <PaymentDetailModal
                    recordId={selectedRecord.recordId}
                    orderId={selectedRecord.orderId}
                    onClose={() => setSelectedRecord(null)}
                    onRefresh={loadRecords}
                />
            )}
        </div>
    );
}
