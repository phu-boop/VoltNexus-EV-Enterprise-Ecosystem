import React from 'react';

export const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <div className="bg-white px-3 py-2 border border-slate-200 rounded-lg text-slate-800">
            {value || 'Chưa cập nhật'}
        </div>
    </div>
);

export default React.memo(InfoField);