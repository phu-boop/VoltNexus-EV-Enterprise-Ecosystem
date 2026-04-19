import { useState, useEffect } from 'react';
import { getPendingCashPayments, confirmManualPayment } from '../../../services/paymentAdminService';
import Loading from '../../ui/Loading';

export default function PaymentApprovalList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            // Default load page 0, size 50
            const response = await getPendingCashPayments(0, 50);
            setTransactions(response.content || []);
        } catch (error) {
            console.error('Error loading pending payments:', error);
            // setTransactions([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (transactionId, action) => {
        const isApprove = action === 'APPROVE';
        const message = isApprove
            ? 'Bạn có chắc chắn muốn DUYỆT yêu cầu thanh toán này?'
            : 'Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thanh toán này?';

        if (!window.confirm(message)) return;

        let notes = '';
        if (!isApprove) {
            notes = window.prompt('Nhập lý do từ chối (bắt buộc):');
            if (notes === null) return; // Cancel prompt
            if (!notes.trim()) {
                alert('Vui lòng nhập lý do từ chối');
                return;
            }
        } else {
            // Optional note for approval
            // notes = window.prompt('Ghi chú (tùy chọn):') || '';
        }

        try {
            setProcessingId(transactionId);
            await confirmManualPayment(transactionId, notes, action);
            // Update UI optimistic or reload
            // Remove item from list directly for better UX
            setTransactions(prev => prev.filter(t => t.transactionId !== transactionId));

            // alert(isApprove ? 'Đã duyệt thanh toán thành công!' : 'Đã từ chối thanh toán!');
        } catch (error) {
            console.error('Action failed:', error);
            alert('Có lỗi xảy ra: ' + (error.response?.data?.message || 'Không thể thực hiện hành động'));
            loadTransactions(); // Reload to sync state
        } finally {
            setProcessingId(null);
        }
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
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-900">Danh sách chờ duyệt</h3>
                <p className="text-sm text-gray-600">
                    Các giao dịch thanh toán tiền mặt hoặc chuyển khoản cần được xác nhận thủ công.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                        Yêu cầu thanh toán ({transactions.length})
                    </h3>
                    <button
                        onClick={loadTransactions}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Làm mới
                    </button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12">
                            <Loading message="Đang tải danh sách yêu cầu..." />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Không có yêu cầu thanh toán nào đang chờ duyệt
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã Giao Dịch</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phương Thức</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Số Tiền</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày Tạo</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ghi Chú</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((tx) => (
                                        <tr key={tx.transactionId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                                {tx.transactionId?.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {tx.paymentMethodName || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {formatDate(tx.transactionDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 italic">
                                                {tx.notes || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button
                                                    onClick={() => handleAction(tx.transactionId, 'APPROVE')}
                                                    disabled={processingId === tx.transactionId}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {processingId === tx.transactionId ? '...' : 'Duyệt'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(tx.transactionId, 'REJECT')}
                                                    disabled={processingId === tx.transactionId}
                                                    className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                                                >
                                                    Từ chối
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
