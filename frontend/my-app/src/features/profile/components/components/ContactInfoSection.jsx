import React from 'react';
import InputField from './InputField';
import { Phone, Calendar } from 'lucide-react';

export const ContactInfoSection = ({ formData, errors, handleChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center uppercase tracking-widest italic">
                <Phone className="h-4 w-4 text-indigo-600 mr-2" />
                Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="Nhập số điện thoại"
                    icon={Phone}
                    required
                />
                <InputField
                    label="Ngày sinh"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                    placeholder=""
                    icon={Calendar}
                />
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Giới tính
                    </label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ContactInfoSection);