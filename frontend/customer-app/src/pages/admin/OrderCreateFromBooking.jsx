import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, User, MapPin, Calculator, ShieldCheck } from 'lucide-react';
import apiAdmin from '../../services/api';
import { getVehicleById, getVariants } from '../../services/vehicleService';
import { getAllDealers } from '../../services/dealerService';
import toast from 'react-hot-toast';

export default function OrderCreateFromBooking() {
    const { recordId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deposit, setDeposit] = useState(null);
    const [dealers, setDealers] = useState([]);
    const [selectedDealerId, setSelectedDealerId] = useState('');
    const [metadata, setMetadata] = useState({});

    useEffect(() => {
        loadData();
    }, [recordId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Load Deposit Info
            const depositRes = await apiAdmin.get(`/api/v1/payments/admin/payment-records/${recordId}`);
            if (depositRes.data?.code === "1000") {
                const data = depositRes.data.data;
                setDeposit(data);

                // Parse metadata
                if (data.metadata) {
                    try {
                        const meta = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
                        setMetadata(meta);
                        if (meta.dealerId) setSelectedDealerId(meta.dealerId);

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
                                const variantRes = await getVariants(meta.modelId);
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
            }

            // 2. Load Dealers
            const dealerRes = await getAllDealers();
            let allDealers = [];
            if (dealerRes?.data) {
                allDealers = dealerRes.data;
                setDealers(allDealers);
            }

            // 3. Post-processing metadata for dealer selection
            if (data.metadata) {
                const meta = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;

                // If we have dealerId in metadata, it's already set in meta.dealerId
                // If not, try to find by showroom name
                if (!meta.dealerId && meta.showroom && allDealers.length > 0) {
                    const foundDealer = allDealers.find(d =>
                        d.dealerName === meta.showroom ||
                        d.dealerName.includes(meta.showroom) ||
                        meta.showroom.includes(d.dealerName)
                    );
                    if (foundDealer) {
                        setSelectedDealerId(foundDealer.dealerId);
                    }
                }
            }
        } catch (error) {
            toast.error('Không thể tải thông tin booking');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDealerId) {
            toast.error('Vui lòng chọn đại lý');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiAdmin.post('/api/v1/sales-orders/admin/from-booking-deposit', {
                recordId: deposit.recordId,
                customerId: deposit.customerId,
                totalAmount: deposit.totalAmount,
                depositAmount: deposit.amountPaid,
                dealerId: selectedDealerId
            });

            if (response.data?.code === "1000" || response.data?.data) {
                const orderId = response.data.data?.orderId || response.data.result?.orderId;
                toast.success('Tạo đơn hàng thành công!');

                // Update payment record status
                await apiAdmin.put(`/api/v1/payments/admin/payment-records/${deposit.recordId}`, {
                    orderId: orderId,
                    status: 'COMPLETED'
                });

                // Navigate to detail
                navigate(`/admin/orders/${orderId}`);
            }
        } catch (error) {
            toast.error('Không thể tạo đơn hàng');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };

    if (loading) {
        return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
    }

    if (!deposit) {
        return (
            <div className="p-8 text-center">
                <p>Không tìm thấy thông tin booking</p>
                <button onClick={() => navigate('/admin/booking-deposits')} className="text-blue-600 mt-2">Quay lại</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/booking-deposits')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Tạo đơn hàng từ Booking Deposit</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold border-b pb-2">
                        <User size={20} />
                        <span>Thông tin khách hàng</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Họ và tên</p>
                            <p className="font-medium">{deposit.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p className="font-medium">{deposit.customerPhone}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{deposit.customerEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold border-b pb-2">
                        <Car size={20} />
                        <span>Thông tin xe & Đặt cọc</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Mẫu xe / Phiên bản</p>
                            <p className="font-medium">
                                {metadata.modelName || (metadata.modelId ? `ID: ${metadata.modelId}` : 'N/A')} - {metadata.variantName || (metadata.variantId ? `ID: ${metadata.variantId}` : 'N/A')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Màu sắc</p>
                            <p className="font-medium">{metadata.exteriorColor} / {metadata.interiorColor}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-blue-600">Tổng giá trị</p>
                            <p className="text-xl font-bold text-blue-900">{formatPrice(deposit.totalAmount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600">Đã đặt cọc</p>
                            <p className="text-xl font-bold text-green-600">{formatPrice(deposit.amountPaid)}</p>
                        </div>
                    </div>
                </div>

                {/* Showroom Assignment */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold border-b pb-2">
                        <MapPin size={20} />
                        <span>Chỉ định Showroom / Đại lý</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn đại lý quản lý đơn hàng *</label>
                        <select
                            required
                            disabled={!!(metadata.dealerId || selectedDealerId)}
                            className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none ${!!(metadata.dealerId || selectedDealerId) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={selectedDealerId}
                            onChange={(e) => setSelectedDealerId(e.target.value)}
                        >
                            <option value="">-- Chọn đại lý --</option>
                            {dealers.map(d => (
                                <option key={d.dealerId} value={d.dealerId}>
                                    {d.dealerName} - {d.city}
                                </option>
                            ))}
                        </select>
                        {(metadata.showroom || metadata.dealerId) && (
                            <p className="text-xs text-blue-600 mt-2 italic font-medium">
                                Showroom khách đã chọn lúc booking: <strong>{metadata.showroom || dealers.find(d => d.dealerId === selectedDealerId)?.dealerName}</strong>
                            </p>
                        )}
                        {!!(metadata.dealerId || selectedDealerId) && (
                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                * Tự động khóa theo lựa chọn của khách hàng
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/booking-deposits')}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? 'Đang xử lý...' : (
                            <>
                                <ShieldCheck size={20} />
                                Xác nhận & Tạo đơn hàng
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
