import React from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiPackage,
  FiTruck,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiXCircle,
  FiSettings,
  FiFileText,
  FiInfo,
  FiHash,
  FiCreditCard
} from "react-icons/fi";

const StatusBadge = ({ status }) => {
  const configs = {
    PENDING: { color: "amber", text: "Chờ duyệt", icon: FiClock },
    CONFIRMED: { color: "blue", text: "Chờ xuất kho", icon: FiCheckCircle },
    IN_TRANSIT: { color: "cyan", text: "Đang giao", icon: FiTrendingUp },
    DELIVERED: { color: "green", text: "Đã giao", icon: FiCheckCircle },
    CANCELLED: { color: "red", text: "Đã hủy", icon: FiXCircle },
  };

  const config = configs[status] || { color: "slate", text: status, icon: FiSettings };
  const { color, text, icon: Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm`}>
      <Icon size={14} className={`text-${color}-500`} />
      {text}
    </span>
  );
};

const B2BOrderDetailsModal = ({ isOpen, onClose, order, dealerMap }) => {
  if (!isOpen || !order) return null;

  const dealerName = dealerMap?.get(order.dealerId) || `Đại lý (ID: ${order.dealerId.substring(0, 8)}...)`;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl shadow-blue-900/20 flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 uppercase-label-system">

        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-[0.03] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg ring-4 ring-blue-50">
              <FiFileText size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết Lệnh điều phối</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mã định danh hệ thống:</span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#{order.orderId}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:rotate-90"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative z-10">

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                <FiUser size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">Đại lý thụ hưởng</span>
              </div>
              <p className="font-bold text-slate-900 text-lg leading-tight">{dealerName}</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                <FiCalendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">Thời gian khởi tạo</span>
              </div>
              <p className="font-bold text-slate-900 text-lg leading-tight">
                {new Date(order.orderDate).toLocaleDateString("vi-VN", { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                <FiInfo size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">Trạng thái hiện tại</span>
              </div>
              <div>
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FiPackage className="text-blue-600" size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Danh mục hàng hóa điều phối</h3>
            </div>

            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm shadow-slate-100/50">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thông tin biến thể xe</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Số lượng</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Đơn giá định mức</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thành tiền tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.orderItems.map((item) => (
                    <tr key={item.orderItemId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-slate-900">{item.versionName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">{item.color}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono italic">
                              <FiHash size={10} />
                              {item.skuCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center font-black text-blue-600 bg-blue-50 w-8 h-8 rounded-xl border border-blue-100">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-600 text-sm">
                        {Number(item.unitPrice).toLocaleString("vi-VN")} <span className="text-[10px] text-slate-400">VNĐ</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-black text-slate-900">
                          {Number(item.totalPrice).toLocaleString("vi-VN")}
                        </span>
                        <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">VNĐ</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Notes & Total */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">
            <div className="lg:col-span-3">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl h-full space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <FiClock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Chỉ dẫn & Ghi chú xử lý</span>
                </div>
                {order.notes ? (
                  <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                    "{order.notes}"
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic">Hệ thống ghi nhận không có ghi chú đính kèm.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="p-8 bg-blue-500 rounded-3xl shadow-xl shadow-blue-200 text-white space-y-4 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 opacity-80">
                  <FiCreditCard size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tổng giá trị quyết toán</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">
                    {Number(order.totalAmount).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-sm font-bold opacity-80 tracking-widest">VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Đóng bảng chi tiết
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default B2BOrderDetailsModal;
