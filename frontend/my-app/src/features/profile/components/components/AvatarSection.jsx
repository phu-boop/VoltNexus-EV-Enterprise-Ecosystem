import React from 'react';

export const AvatarSection = ({ formData, handleChange }) => {
    return (
        <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
                <div className="w-20 mt-6 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {formData.url ? (
                        <img
                            src={formData.url}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 ${
                        formData.url ? 'hidden' : 'flex'
                    }`}>
                        {formData.name?.charAt(0)?.toUpperCase() || 
                         formData.fullName?.charAt(0)?.toUpperCase() || 
                         formData.email?.charAt(0)?.toUpperCase() || 
                         'U'}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg mb-3">Ảnh đại diện</h3>
                <div className="space-y-2">
                    <input
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-sm text-slate-500">
                        Nhập URL hình ảnh cho avatar của bạn
                    </p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AvatarSection);