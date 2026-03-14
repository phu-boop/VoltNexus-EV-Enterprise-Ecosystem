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
    disabled = false // Thêm prop disabled
}) => (
    <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-2">
            {label} {required && '*'}
        </label>
        <div className="relative">
            {Icon && (
                <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    disabled ? 'text-slate-300' : 'text-slate-400'
                }`}/>
            )}
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    error ? 'border-red-500' : 'border-slate-300'
                } ${
                    disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder={placeholder}
            />
        </div>
        {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {disabled && (
            <p className="mt-1 text-sm text-slate-500">Email không thể thay đổi</p>
        )}
    </div>
);

export default React.memo(InputField);