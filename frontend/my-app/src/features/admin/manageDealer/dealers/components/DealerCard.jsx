import React from 'react';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiHash,
  FiEdit3,
  FiTrash2,
  FiSlash,
  FiPlay,
  FiMap,
  FiActivity
} from 'react-icons/fi';

const DealerCard = ({ dealer, onEdit, onDelete, onSuspend, onActivate }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-100',
          dot: 'bg-emerald-500',
          label: 'Đang hoạt động',
          pulse: true
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-100',
          dot: 'bg-rose-500',
          label: 'Tạm ngừng',
          pulse: false
        };
      case 'INACTIVE':
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-100',
          dot: 'bg-slate-400',
          label: 'Không hoạt động',
          pulse: false
        };
    }
  };

  const config = getStatusConfig(dealer.status);

  return (
    <div className="group relative bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-100 flex flex-col h-full overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-8 flex-grow flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
              {dealer.dealerName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                {dealer.dealerCode}
              </span>
              {dealer.region && (
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {dealer.region}
                </span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
            {config.label}
          </div>
        </div>

        <div className="space-y-5 flex-grow">
          {/* Address */}
          <div className="flex items-start gap-4 group/item">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-blue-200 group-hover/item:text-blue-500 group-hover/item:bg-blue-50 transition-all">
              <FiMapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vị trí</p>
              <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed">
                {dealer.address}{dealer.city ? `, ${dealer.city}` : ''}
              </p>
            </div>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-emerald-200 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 transition-all">
                <FiPhone size={14} />
              </div>
              <p className="text-xs text-slate-700 font-bold truncate">{dealer.phone || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-purple-200 group-hover/item:text-purple-500 group-hover/item:bg-purple-50 transition-all">
                <FiMail size={14} />
              </div>
              <p className="text-xs text-slate-600 font-medium truncate">{dealer.email || 'N/A'}</p>
            </div>
          </div>

          {/* Tax Number */}
          {dealer.taxNumber && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/item hover:border-amber-200 hover:bg-amber-50/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-amber-500 rounded-lg shadow-sm border border-slate-100">
                  <FiHash size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã số thuế</p>
                  <p className="text-xs text-slate-700 font-black font-mono tracking-tight">{dealer.taxNumber}</p>
                </div>
              </div>
              <div className="p-1 px-2 bg-amber-100 text-amber-700 rounded text-[9px] font-black opacity-0 group-hover/item:opacity-100 transition-opacity uppercase">
                Hợp lệ
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1">
          {dealer.status === 'ACTIVE' ? (
            <button
              onClick={() => onSuspend(dealer.dealerId)}
              className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all active:scale-90"
              title="Tạm ngừng hoạt động"
            >
              <FiSlash size={18} />
            </button>
          ) : (
            <button
              onClick={() => onActivate(dealer.dealerId)}
              className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all active:scale-90"
              title="Kích hoạt lại"
            >
              <FiPlay size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(dealer)}
            className="px-5 py-2.5 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center gap-2 uppercase tracking-tight"
          >
            <FiEdit3 size={14} />
            Sửa
          </button>

          <button
            onClick={() => onDelete(dealer.dealerId, dealer.dealerName)}
            className="px-5 py-2.5 text-xs font-black text-white bg-rose-500 rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-100 flex items-center gap-2 uppercase tracking-tight"
          >
            <FiTrash2 size={14} />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealerCard;