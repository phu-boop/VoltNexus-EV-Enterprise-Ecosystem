import React from 'react';
import InputField from './InputField';
import { User, Mail } from 'lucide-react';

export const BasicInfoSection = ({ formData, errors, handleChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Thông tin cơ bản
            </h3>
            <div className="flex flex-col lg:flex-row gap-6">
                <InputField
                    label="Tên hiển thị"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Nhập tên hiển thị"
                    icon={User}
                    required
                />
                <InputField
                    label="Họ và tên đầy đủ"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    placeholder="Nhập họ và tên đầy đủ"
                    required
                />
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="your@email.com"
                    icon={Mail}
                    required
                    disabled={true} // Thêm disabled cho email
                />
            </div>
        </div>
    );
};

export default React.memo(BasicInfoSection);