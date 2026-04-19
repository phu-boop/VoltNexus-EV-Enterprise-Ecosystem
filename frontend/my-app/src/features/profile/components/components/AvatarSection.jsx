import React from 'react';

export const AvatarSection = ({ formData, handleChange }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative group">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-100/50">
                    <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
                        {formData.url ? (
                            <img
                                src={formData.url}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className={`w-full h-full rounded-full flex items-center justify-center bg-slate-100 font-black text-3xl text-slate-400 select-none ${formData.url ? 'hidden' : 'flex'
                            }`}>
                            {formData.name?.charAt(0)?.toUpperCase() ||
                                formData.fullName?.charAt(0)?.toUpperCase() ||
                                formData.email?.charAt(0)?.toUpperCase() ||
                                'U'}
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                </div>
            </div>

            <div className="flex-1 w-full space-y-4 text-center sm:text-left">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Ảnh đại diện</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sử dụng URL hình ảnh tuyệt vời nhất của bạn</p>
                </div>
                <div className="relative group">
                    <input
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium text-sm text-slate-600 shadow-sm group-hover:border-slate-200"
                        placeholder="https://example.com/your-stunning-avatar.jpg"
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(AvatarSection);