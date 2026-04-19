import React from 'react';

export const InfoField = ({ label, value }) => (
    <div className="flex-1">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">{label}</label>
        <div className="bg-slate-50/50 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            {value || <span className="text-slate-400 italic">Chưa cập nhật</span>}
        </div>
    </div>
);

export default React.memo(InfoField);