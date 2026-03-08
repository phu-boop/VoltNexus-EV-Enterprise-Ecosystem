import React from 'react';

const DealerCard = ({ dealer, onEdit, onDelete, onSuspend, onActivate }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50';
      case 'INACTIVE':
        return 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50';
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100/50';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'INACTIVE': return 'bg-slate-400';
      case 'SUSPENDED': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'SUSPENDED': return 'Tạm ngừng';
      default: return status;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-100 flex flex-col h-full overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6 flex-grow flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
              {dealer.dealerName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                {dealer.dealerCode}
              </span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border shadow-sm ${getStatusStyle(dealer.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(dealer.status)} ${dealer.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            {getStatusText(dealer.status)}
          </div>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="flex items-start gap-4 group/item">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-blue-200 group-hover/item:text-blue-500 group-hover/item:bg-blue-50 transition-colors">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">{dealer.address}, {dealer.city}</span>
          </div>

          {dealer.phone && (
            <div className="flex items-center gap-4 group/item">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-emerald-200 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 transition-colors">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm text-slate-700 font-medium">{dealer.phone}</span>
            </div>
          )}

          {dealer.email && (
            <div className="flex items-center gap-4 group/item">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-purple-200 group-hover/item:text-purple-500 group-hover/item:bg-purple-50 transition-colors">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-slate-600 truncate">{dealer.email}</span>
            </div>
          )}

          {dealer.taxNumber && (
            <div className="flex items-center gap-4 group/item">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:border-amber-200 group-hover/item:text-amber-500 group-hover/item:bg-amber-50 transition-colors">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Mã số thuế</span>
                <span className="text-sm text-slate-700 font-medium font-mono">{dealer.taxNumber}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 relative z-10 transition-colors">
        <div className="flex items-center">
          {dealer.status === 'ACTIVE' ? (
            <button
              onClick={() => onSuspend(dealer.dealerId)}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors group/btn relative"
              title="Tạm ngừng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">Tạm ngừng</span>
            </button>
          ) : (
            <button
              onClick={() => onActivate(dealer.dealerId)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors group/btn relative"
              title="Kích hoạt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">Kích hoạt</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(dealer)}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Sửa
          </button>

          <button
            onClick={() => onDelete(dealer.dealerId, dealer.dealerName)}
            className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealerCard;