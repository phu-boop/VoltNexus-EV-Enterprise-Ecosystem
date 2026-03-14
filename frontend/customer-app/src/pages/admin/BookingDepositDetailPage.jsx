import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, User, MapPin, Calculator, Calendar, Clock, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import apiAdmin from '../../services/apiAdmin';
import { getVehicleById, getVariants } from '../../services/vehicleService';
import toast from 'react-hot-toast';

export default function BookingDepositDetailPage() {
    const { recordId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deposit, setDeposit] = useState(null);
    const [metadata, setMetadata] = useState({});

    useEffect(() => {
        loadData();
    }, [recordId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await apiAdmin.get(`/api/v1/payments/admin/payment-records/${recordId}`);
            if (response.data?.code === "1000") {
                const data = response.data.data;
                setDeposit(data);

                // Parse metadata
                if (data.metadata) {
                    try {
                        const meta = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
                        setMetadata(meta);

                        // If names are missing, fetch them
                        if (meta.modelId && !meta.modelName) {
                            try {
                                const vehicleRes = await getVehicleById(meta.modelId);
                                if (vehicleRes.code === "1000") {
                                    setMetadata(prev => ({ ...prev, modelName: vehicleRes.data.modelName }));
                                }
                            } catch (e) {
                                console.warn("Failed to fetch model name:", e);
                            }
                        }

                        if (meta.variantId && !meta.variantName) {
                            try {
                                const variantRes = await getVariants(meta.modelId || data.modelId);
                                if (variantRes.code === "1000") {
                                    const variant = variantRes.data.find(v => v.variantId === parseInt(meta.variantId));
                                    if (variant) {
                                        setMetadata(prev => ({ ...prev, variantName: variant.versionName }));
                                    }
                                }
                            } catch (e) {
                                console.warn("Failed to fetch variant name:", e);
                            }
                        }
                    } catch (e) {
                        console.error("Metadata parse error:", e);
                    }
                }
            } else {
                toast.error('Không tìm thấy thông tin đặt cọc');
            }
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING_DEPOSIT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING_DEPOSIT': return 'Chờ thanh toán / Xử lý';
            case 'COMPLETED': return 'Đã hoàn thành (Đã tạo đơn)';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600 font-medium">Đang tải chi tiết đặt cọc...</p>
            </div>
        );
    }

    if (!deposit) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 mt-6 max-w-2xl mx-auto">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy dữ liệu</h3>
                <p className="text-gray-600 mb-6">Thông tin đặt cọc bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                <button onClick={() => navigate('/admin/booking-deposits')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/booking-deposits')} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-800">Chi tiết Booking Deposit</h1>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(deposit.status)}`}>
                                {getStatusLabel(deposit.status)}
                            </span>
                        </div>
                        <p className="text-gray-500 font-mono text-sm mt-1">ID: {deposit.recordId}</p>
                    </div>
                </div>
                {deposit.status === 'PENDING_DEPOSIT' && (
                    <button
                        onClick={() => navigate(`/admin/orders/create-from-booking/${deposit.recordId}`)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        <ShieldCheck size={20} />
                        Tiến hành tạo đơn hàng
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-5 text-blue-600 font-bold border-b border-gray-50 pb-3">
                            <User size={22} className="text-blue-500" />
                            <span className="text-lg">Thông tin khách hàng</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Họ và tên</p>
                                <p className="text-base font-bold text-gray-800">{deposit.customerName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                                <p className="text-base font-bold text-gray-800">{deposit.customerPhone}</p>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                                <p className="text-base font-bold text-gray-800">{deposit.customerEmail || '(Chưa cung cấp)'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Vehicle/Order Detail */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-5 text-blue-600 font-bold border-b border-gray-50 pb-3">
                            <Car size={22} className="text-blue-500" />
                            <span className="text-lg">Cấu hình xe đã chọn</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mẫu xe</p>
                                <p className="text-base font-bold text-gray-800">{metadata.modelName || `ID: ${metadata.modelId}` || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phiên bản</p>
                                <p className="text-base font-bold text-gray-800">{metadata.variantName || `ID: ${metadata.variantId}` || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Màu ngoại thất</p>
                                <p className="text-base font-bold text-gray-800">{metadata.exteriorColor || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Màu nội thất</p>
                                <p className="text-base font-bold text-gray-800">{metadata.interiorColor || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
                            <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Địa điểm nhận xe (Showroom)</p>
                                <p className="text-base font-bold text-blue-900">{metadata.showroom || 'Chưa chỉ định địa điểm cụ thể'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Financial Summary Column */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-5 text-green-600 font-bold border-b border-gray-50 pb-3">
                            <CreditCard size={22} className="text-green-500" />
                            <span className="text-lg">Tình trạng tài chính</span>
                        </div>
                        <div className="space-y-5">
                            <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-3">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng giá xe dự kiến</p>
                                    <p className="text-xl font-extrabold text-gray-800">{formatPrice(deposit.totalAmount)}</p>
                                </div>
                                <Calculator className="text-gray-300" size={20} />
                            </div>

                            <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-3">
                                <div>
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Đã đặt cọc thanh toán</p>
                                    <p className="text-2xl font-extrabold text-green-600">{formatPrice(deposit.amountPaid)}</p>
                                </div>
                                <CheckCircle className="text-green-400" size={24} />
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Số tiền còn lại</p>
                                <p className="text-xl font-bold text-blue-600">{formatPrice(deposit.totalAmount - deposit.amountPaid)}</p>
                            </div>
                        </div>
                    </section>

                    {/* Transaction Metadata */}
                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={16} />
                            Lịch sử & Thời gian
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày tạo yêu cầu</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Calendar size={14} className="text-gray-400" />
                                    {formatDate(deposit.createdAt)}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cập nhật lần cuối</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Calendar size={14} className="text-gray-400" />
                                    {formatDate(deposit.updatedAt)}
                                </div>
                            </div>
                            {deposit.vnpayResponseCode && (
                                <div className="pt-2 border-t border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã kết quả VNPay</p>
                                    <p className="text-sm font-mono font-bold text-gray-600">{deposit.vnpayResponseCode}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Debug Info (Only in development/admin) */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <details className="text-xs text-gray-400 cursor-pointer opacity-30 hover:opacity-100 transition-opacity">
                    <summary>Debug Data (Thanh ẩn)</summary>
                    <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify({ deposit, metadata }, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}
