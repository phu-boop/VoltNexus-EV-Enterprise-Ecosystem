import React from 'react';
import InputField from './InputField';
import { MapPin } from 'lucide-react';

export const AddressInfoSection = ({ formData, handleChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                Thông tin địa chỉ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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