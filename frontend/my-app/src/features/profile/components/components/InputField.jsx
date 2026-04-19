import React from 'react';

export const InputField = ({
    label,
    name,
    value,
    onChange,
    error,
    type = "text",
    placeholder,
    icon: Icon,
    required = false,
    disabled = false
}) => (
    <div className="flex-1 min-w-[280px]">
        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && (
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-indigo-600'
                    }`}>
                    <Icon size={18} />
                </div>
            )}
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 border-2 rounded-2xl transition-all duration-200 outline-none font-bold text-sm ${error
                        ? 'border-red-100 bg-red-50/30 text-red-900 focus:border-red-400'
                        : 'border-slate-100 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5'
                    } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-transparent' : ''
                    }`}
                placeholder={placeholder}
            />
        </div>
        {error ? (
            <p className="mt-1.5 text-[10px] font-bold text-red-500 px-1 uppercase tracking-tight italic">{error}</p>
        ) : disabled && type === "email" ? (
            <p className="mt-1.5 text-[10px] font-medium text-slate-400 px-1 italic">Tài khoản định danh không thể thay đổi</p>
        ) : null}
    </div>
);

export default React.memo(InputField);