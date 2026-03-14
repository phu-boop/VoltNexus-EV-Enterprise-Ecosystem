import React from 'react';
import InputField from './InputField';
import { MapPin } from 'lucide-react';

export const AddressInfoSection = ({ formData, handleChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Thông tin địa chỉ
            </h3>
            <div className="flex flex-col lg:flex-row gap-6">
                <InputField
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    icon={MapPin}
                />
                <InputField
                    label="Thành phố"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Nhập thành phố"
                />
                <InputField
                    label="Quốc gia"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Nhập quốc gia"
                />
            </div>
        </div>
    );
};

export default React.memo(AddressInfoSection);