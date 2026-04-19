import React, { useState, useEffect, useMemo } from 'react';
import paymentService from '../services/paymentService';
import PaymentMethodForm from '../components/PaymentMethodForm';
import { toast } from 'react-toastify';
import {
  FiCreditCard,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiActivity,
  FiLayers,
  FiPlus,
  FiServer,
  FiZap
} from 'react-icons/fi';

const PaymentMethodsManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPaymentMethods();
      setPaymentMethods(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Gặp sự cố khi đồng bộ danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Dashboard Telemetry
  const stats = useMemo(() => {
    const active = paymentMethods.filter(m => m.isActive).length;
    const gateways = paymentMethods.filter(m => m.methodType === 'GATEWAY').length;
    const b2b = paymentMethods.filter(m => m.scope === 'B2B' || m.scope === 'ALL').length;
    return { total: paymentMethods.length, active, gateways, b2b };
  }, [paymentMethods]);

  const handleCreate = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleSave = async (methodData) => {
    try {
      if (editingMethod) {
        await paymentService.updatePaymentMethod(editingMethod.methodId, methodData);
        toast.success('Ghi đè cấu hình phương thức thanh toán thành công');
      } else {
        await paymentService.createPaymentMethod(methodData);
        toast.success('Mở luồng thanh toán mới thành công');
      }
      setShowForm(false);
      setEditingMethod(null);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi lưu trữ phương thức');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMethod(null);
  };

  const getScopeBadgeColor = (scope) => {
    switch (scope) {
      case 'ALL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'B2C': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'B2B': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'GATEWAY': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'MANUAL': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">
      {/* Dynamic Portal Form Layer */}
      {showForm && (
        <PaymentMethodForm
          method={editingMethod}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
            <FiCreditCard size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cấu Hình Thanh Toán</h1>
            <p className="text-slate-500 font-medium mt-0.5 max-w-lg line-clamp-1">Thiết lập tham số kỹ thuật và phân luồng cổng thanh toán lõi</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
        >
          <FiPlus size={18} /> Khởi Tạo Luồng Mới
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng Cổng Khả Dụng', value: stats.active, total: stats.total, icon: FiActivity, color: 'blue', sub: 'Active / Total Nodes' },
          { label: 'Cổng Hệ Thống Tự Động', value: stats.gateways, total: stats.total, icon: FiServer, color: 'indigo', sub: 'System API Gateways' },
          { label: 'Luồng Doanh Nghiệp (B2B)', value: stats.b2b, total: stats.total, icon: FiLayers, color: 'emerald', sub: 'Corporate Channels' },
          { label: 'Độ Trễ Phản Hồi', value: '< 10', total: 'ms', icon: FiZap, color: 'amber', sub: 'Network Latency' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group duration-300 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-400">/ {stat.total}</p>
                </div>
              </div>
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Methods Matrix */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full py-24">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
            <p className="text-blue-600 font-black animate-pulse tracking-widest uppercase text-xs">Đang nạp tham số cấu hình...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full py-24 animate-in zoom-in-95 duration-500">
            <div className="text-slate-100 text-8xl mb-8 flex justify-center drop-shadow-sm">⚙️</div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hệ Thống Rỗng</h3>
            <p className="text-slate-400 font-medium mt-2 max-w-md text-center leading-relaxed">Chưa có phương thức thanh toán nào được thiết lập. Hệ thống không thể tiếp nhận dòng tiền nếu thiếu Node đầu vào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.methodId}
                className="bg-slate-50/50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-between group hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${method.isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight line-clamp-1">{method.methodName}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {method.isActive ? (
                            <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span></>
                          ) : (
                            <><span className="w-2 h-2 rounded-full bg-red-400"></span> <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Offline</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2.5 text-slate-400 bg-white border border-slate-200 rounded-xl hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all active:scale-90"
                      title="Chỉnh sửa tham số kỹ thuật"
                    >
                      <FiEdit3 size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-widest border ${getScopeBadgeColor(method.scope)}`}>
                      Quy mô: {method.scope}
                    </span>
                    <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${getTypeBadgeColor(method.methodType)}`}>
                      <FiSettings size={10} /> {method.methodType}
                    </span>
                  </div>

                  {method.configJson && (
                    <div className="relative group/code">
                      <div className="absolute -top-3 left-4 px-2 bg-slate-50 group-hover:bg-white transition-colors text-[9px] font-black text-slate-400 uppercase tracking-widest z-10">
                        Payload JSON
                      </div>
                      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 group-hover/code:border-blue-200 transition-colors line-clamp-2">
                        <code className="text-xs font-mono text-slate-600 break-all leading-relaxed">
                          {typeof method.configJson === 'string'
                            ? method.configJson
                            : JSON.stringify(method.configJson)}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsManagement;
