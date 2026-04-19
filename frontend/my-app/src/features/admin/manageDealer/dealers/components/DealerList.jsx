import React from 'react';
import DealerCard from './DealerCard';
import DealerFilter from './DealerFilter';
import Skeleton from 'react-loading-skeleton';
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiInbox,
  FiEdit3,
  FiTrash2,
  FiSlash,
  FiPlay,
  FiMapPin,
  FiPhone,
  FiMail,
  FiActivity
} from 'react-icons/fi';

const DealerList = ({
  dealers,
  loading,
  error,
  viewType = 'card',
  filters,
  onFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onRefresh
}) => {
  // Enhanced skeleton loading component
  const SkeletonDealerCard = () => (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-slate-100 animate-pulse h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <Skeleton height={24} width="80%" className="mb-2 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton height={16} width="30%" className="rounded-md" />
            <Skeleton height={16} width="20%" className="rounded-md" />
          </div>
        </div>
        <Skeleton height={28} width={90} className="rounded-full" />
      </div>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton circle height={40} width={40} />
          <div className="flex-1">
            <Skeleton height={8} width="30%" className="mb-1" />
            <Skeleton height={14} width="90%" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Skeleton height={24} width={24} className="rounded-lg" />
            <Skeleton height={14} width="70%" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton height={24} width={24} className="rounded-lg" />
            <Skeleton height={14} width="70%" />
          </div>
        </div>
        <Skeleton height={48} width="100%" className="rounded-2xl mt-2" />
      </div>
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
        <Skeleton height={24} width={24} className="rounded-lg" />
        <div className="flex gap-2">
          <Skeleton height={36} width={70} className="rounded-xl" />
          <Skeleton height={36} width={70} className="rounded-xl" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const configs = {
      ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', text: 'Đang hoạt động' },
      SUSPENDED: { bg: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500', text: 'Tạm ngừng' },
      INACTIVE: { bg: 'bg-slate-50 text-slate-700 border-slate-100', dot: 'bg-slate-400', text: 'Không hoạt động' }
    };
    const config = configs[status] || configs.INACTIVE;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg}`}>
        <span className={`w-1 h-1 rounded-full ${config.dot}`} />
        {config.text}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-rose-100 p-12 text-center shadow-xl shadow-rose-50 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FiAlertTriangle size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Hệ thống đang gián đoạn</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
        <button
          onClick={onRefresh}
          className="px-8 py-3.5 bg-rose-500 text-white font-black text-xs rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 flex items-center gap-2 mx-auto active:scale-95 uppercase tracking-widest"
        >
          <FiRefreshCw size={16} />
          Thử kết nối lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DealerFilter
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <SkeletonDealerCard key={index} />
          ))}
        </div>
      ) : dealers.length === 0 ? (
        <div className="p-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center animate-in zoom-in-95 duration-500">
          <div className="text-slate-100 text-9xl mb-8 flex justify-center opacity-40">📦</div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sạch bóng đại lý</h3>
          <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto leading-relaxed italic">
            {filters.search || filters.city || filters.status
              ? 'Thử thay đổi tham số tìm kiếm để nhận dạng đúng đối tác.'
              : 'Dữ liệu đại lý đang trống. Hãy bắt đầu bằng cách kiến tạo mạng lưới mới.'}
          </p>
          {(filters.search || filters.city || filters.status) && (
            <button
              onClick={onClearFilters}
              className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-600 font-black text-[10px] rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              Thiết lập lại bộ lọc
            </button>
          )}
        </div>
      ) : viewType === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {dealers.map((dealer) => (
            <div key={dealer.dealerId} className="animate-in slide-in-from-bottom-4 duration-500">
              <DealerCard
                dealer={dealer}
                onEdit={onEdit}
                onDelete={onDelete}
                onSuspend={onSuspend}
                onActivate={onActivate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí & Liên hệ</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã số thuế</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dealers.map((dealer) => (
                  <tr key={dealer.dealerId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 shadow-sm">
                          {dealer.dealerName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{dealer.dealerName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{dealer.dealerCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-600">
                          <FiMapPin size={12} className="text-slate-400" />
                          <span className="text-xs font-medium">{dealer.city || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <FiPhone size={12} className="text-slate-400" />
                          <span className="text-xs font-bold tracking-tight">{dealer.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FiActivity size={12} className="text-amber-500" />
                        <span className="text-xs font-black font-mono tracking-tighter">{dealer.taxNumber || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(dealer.status)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {dealer.status === 'ACTIVE' ? (
                          <button
                            onClick={() => onSuspend(dealer.dealerId)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all"
                            title="Tạm ngừng"
                          >
                            <FiSlash size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onActivate(dealer.dealerId)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                            title="Kích hoạt"
                          >
                            <FiPlay size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(dealer)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                          title="Sửa"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(dealer.dealerId, dealer.dealerName)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerList;
