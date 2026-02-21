import { useState, useEffect } from 'react';
import { getPaymentHistory } from '../../../services/paymentAdminService';
import Loading from '../../ui/Loading';

export default function PaymentDetailModal({ recordId, orderId, onClose, onRefresh }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            loadTransactions();
        }
    }, [orderId]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await getPaymentHistory(orderId);
            setTransactions(response || []);
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const STATUS_COLORS = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        SUCCESS: 'bg-green-100 text-green-800 border-green-300',
        FAILED: 'bg-red-100 text-red-800 border-red-300',
        CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const STATUS_LABELS = {
        PENDING: 'Chờ xử lý',
        SUCCESS: 'Thành công',
        FAILED: 'Thất bại',
        CANCELLED: 'Đã hủy'
    };

    // Inline styles cho overlay
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        padding: '1rem'
    };

    const modalStyle = {
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 50
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Chi tiết thanh toán</h2>
                        <p className="text-gray-500 mt-1 font-mono text-sm">
                            Order: {orderId?.substring(0, 13)}...
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-normal leading-none transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loading message="Đang tải lịch sử giao dịch..." />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Lịch sử giao dịch ({transactions.length})
                            </h3>

                            {/* Transaction Timeline */}
                            <div className="space-y-4">
                                {transactions.map((transaction, index) => (
                                    <div
                                        key={transaction.transactionId}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        Giao dịch #{index + 1}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[transaction.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                                                        }`}>
                                                        {STATUS_LABELS[transaction.status] || transaction.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {formatDateTime(transaction.transactionDate)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {transaction.paymentMethodName || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {transaction.notes && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Ghi chú:</span> {transaction.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
