// ví dụ file /src/pages/evm/B2BOrderDetailsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ResolveDisputeModal from "../components/ResolveDisputeModal";
import { useB2BOrderDetails } from "../hooks/useStaffNotifications";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import {
  FiLoader,
  FiAlertTriangle,
  FiDollarSign,
  FiCalendar,
  FiBox,
  FiArrowLeft,
  FiHash,
  FiTruck,
  FiActivity,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiPackage
} from "react-icons/fi";

// Hàm định dạng tiền tệ (ví dụ: 10000000 -> 10.000.000 ₫)
const formatCurrency = (amount) => {
  if (typeof amount !== "number") {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm định dạng ngày (ví dụ: 2025-11-08T14:07:28.120005 -> 8/11/2025)
const formatDate = (isoString) => {
  if (!isoString) return "Không rõ";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    return "Ngày không hợp lệ";
  }
};

const B2BOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantMap, setVariantMap] = useState(new Map());

  const { data: order, isLoading, isError } = useB2BOrderDetails(orderId);

  // Fetch variant details when order loads
  useEffect(() => {
    if (order?.orderItems?.length > 0) {
      const variantIds = order.orderItems.map((item) => item.variantId);
      getVariantDetailsByIds(variantIds)
        .then((response) => {
          const map = new Map(
            response.data.data.map((detail) => [detail.variantId, detail])
          );
          setVariantMap(map);
        })
        .catch((err) => console.error("Failed to fetch variant details:", err));
    }
  }, [order]);

  const getVariantDisplayName = (variantId) => {
    const detail = variantMap.get(variantId);
    if (detail) {
      return detail.skuCode || detail.versionName || `Variant #${variantId}`;
    }
    return `Variant #${variantId}`;
  };

  const disputeReason = useMemo(() => {
    if (!order || !order.orderTrackings) return null;
    // Tìm tracking có status "ĐÃ BÁO CÁO SỰ CỐ"
    const disputeTracking = order.orderTrackings.find(
      (track) => track.status === "ĐÃ BÁO CÁO SỰ CỐ"
    );
    // Trích xuất "notes" (đây là lý do)
    return disputeTracking ? disputeTracking.notes : "Không tìm thấy lý do.";
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Đang tải chi tiết...</span>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg">
        <FiAlertTriangle className="w-10 h-10 text-red-600" />
        <span className="mt-3 text-lg text-red-700">
          Lỗi! Không thể tải chi tiết đơn hàng.
        </span>
      </div>
    );
  }

  const handleBack = () => {
    // Determine the most logical back path based on where we came from or roles
    const prefix = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';
    navigate(`${prefix}/orders`);
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { color: "amber", text: "Chờ duyệt", icon: FiClock },
      CONFIRMED: { color: "blue", text: "Đã xác nhận", icon: FiCheckCircle },
      IN_TRANSIT: { color: "purple", text: "Đang vận chuyển", icon: FiTruck },
      DELIVERED: { color: "emerald", text: "Đã giao", icon: FiCheckCircle },
      CANCELLED: { color: "red", text: "Đã hủy", icon: FiActivity },
      DISPUTED: { color: "orange", text: "Khiếu nại", icon: FiActivity }
    };

    const config = configs[status] || { color: "slate", text: status, icon: FiInfo };
    const { color, text, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm whitespace-nowrap`}>
        <Icon size={12} className={`text-${color}-500`} />
        {text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang truy xuất dữ liệu...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-red-50/50 rounded-[2rem] border border-dashed border-red-200">
        <FiAlertTriangle className="w-16 h-16 text-red-200 mb-4" />
        <h3 className="text-xl font-black text-slate-900">Không thể tải dữ liệu</h3>
        <p className="text-slate-500 font-medium mt-1 mb-6 text-center max-w-md">Vui lòng kiểm tra lại kết nối hoặc mã định danh đơn hàng.</p>
        <button onClick={handleBack} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">
      {/* Header & Back Action */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="group flex items-center text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all mb-6"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all mr-3">
            <FiArrowLeft size={16} />
          </div>
          Trở về danh sách đơn hàng
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FiBox size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chi tiết đơn hàng</h1>
                {getStatusBadge(order.orderStatus)}
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 italic">
                <FiHash size={14} /> #{orderId}
              </p>
            </div>
          </div>

          {order.orderStatus === "DISPUTED" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center gap-2 active:scale-95"
            >
              <FiActivity size={16} />
              Giải quyết Khiếu nại
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Table & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 text-slate-400">
              <FiPackage size={14} className="mb-0.5" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Danh mục sản phẩm đặt hàng</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đơn giá</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.orderItems?.map((item) => (
                    <tr key={item.orderItemId} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-900">{getVariantDisplayName(item.variantId)}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <FiHash size={10} /> {item.variantId}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-600 font-mono italic">
                        x{item.quantity}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-500 text-sm">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-8 py-5 text-right font-black text-blue-600">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị đơn hàng</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          {/* Dispute Context if any */}
          {order.orderStatus === "DISPUTED" && (
            <div className="bg-amber-50/50 rounded-[2.5rem] border border-amber-100 p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 border border-amber-100">
                  <FiAlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-2">Thông tin khiếu nại báo cáo</h3>
                  <p className="text-amber-800 font-medium leading-relaxed bg-white/50 p-4 rounded-xl border border-amber-50 shadow-sm">
                    {disputeReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary Cards */}
        <div className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Đặc tính kỹ thuật</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <FiCalendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày phát hành lệnh</p>
                  <p className="text-sm font-black text-slate-900">{formatDate(order.orderDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <FiUser size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý thực hiện</p>
                  <p className="text-sm font-black text-slate-900">Đại lý #{order.dealerId?.substring(0, 8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                  <FiDollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giao thức tiền tệ</p>
                  <p className="text-sm font-black text-slate-900">VNĐ (Việt Nam Đồng)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help / Info */}
          <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <FiInfo size={24} className="mb-4 text-blue-400" />
            <h4 className="text-sm font-black uppercase tracking-widest mb-3">Thông tin bảo lãnh</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Tất cả các đơn hàng B2B đều được hệ thống VoltNexus bảo mật và ghi nhận trong hồ sơ tài chính đại lý để phục vụ cho các báo cáo quyết toán chu kỳ quý.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ResolveDisputeModal
          orderId={orderId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default B2BOrderDetailsPage;
