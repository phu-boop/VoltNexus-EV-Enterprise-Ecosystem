import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    History,
    Clock,
    User,
    TrendingUp,
    TrendingDown,
    Info,
    Calendar,
    ShieldCheck,
    Tag,
    Activity
} from 'lucide-react';
import { getVariantAuditHistory, getVariantPriceHistory } from '../services/vehicleCatalogService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VariantHistoryDrawer = ({ isOpen, onClose, variantId, variantName }) => {
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'price'
    const [history, setHistory] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && variantId) {
            fetchHistory();
        }
    }, [isOpen, variantId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const [historyRes, priceRes] = await Promise.all([
                getVariantAuditHistory(variantId),
                getVariantPriceHistory(variantId)
            ]);
            setHistory(historyRes.data.data || []);
            setPriceHistory(priceRes.data.data || []);
        } catch (error) {
            console.error('Error fetching variant history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                    <History className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Nhật ký phiên bản</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{variantName || 'Vehicle Variant'}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-4 bg-slate-50/50">
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`flex-1 pb-3 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'audit' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Activity size={16} />
                                    Nhật ký Audit
                                </div>
                                {activeTab === 'audit' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('price')}
                                className={`flex-1 pb-3 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'price' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUp size={16} />
                                    Lịch sử Giá
                                </div>
                                {activeTab === 'price' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                                )}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                                </div>
                            ) : activeTab === 'audit' ? (
                                <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                    {history.length > 0 ? history.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative pl-12"
                                        >
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-0 top-1.5 w-9 h-9 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${item.action === 'CREATE' ? 'bg-emerald-500 text-white' :
                                                item.action === 'UPDATE' ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'
                                                }`}>
                                                {item.action === 'CREATE' ? <ShieldCheck size={14} /> :
                                                    item.action === 'UPDATE' ? <Activity size={14} /> : <X size={14} />}
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 transition-colors group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.action === 'UPDATE' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {item.action}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                        <Clock size={12} />
                                                        {format(new Date(item.actionDate), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                                                        <User size={14} className="text-slate-400" />
                                                        {item.changedBy || 'Hệ thống'}
                                                    </div>

                                                    {item.action === 'UPDATE' && (
                                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/60">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phiên bản</p>
                                                                <p className="text-xs font-black text-slate-700">{item.versionName}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá niên yết</p>
                                                                <p className="text-xs font-black text-indigo-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <EmptyState message="Chưa có nhật ký thay đổi" />
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                    {priceHistory.length > 0 ? priceHistory.map((item, idx) => (
                                        <motion.div
                                            key={item.priceId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative pl-12"
                                        >
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-0 top-1.5 w-9 h-9 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${item.newPrice >= item.oldPrice ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                                                }`}>
                                                {item.newPrice >= item.oldPrice ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            </div>

                                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        <Calendar size={12} />
                                                        {format(new Date(item.changeDate), 'dd MMMM, yyyy', { locale: vi })}
                                                    </div>
                                                    <div className="p-1 px-2 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                        <User size={10} />
                                                        {item.changedBy}
                                                    </div>
                                                </div>

                                                <div className="flex items-end justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thay đổi giá</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-slate-400 line-through">
                                                                {new Intl.NumberFormat('vi-VN').format(item.oldPrice)}
                                                            </span>
                                                            <div className="h-4 w-px bg-slate-200" />
                                                            <span className="text-lg font-black text-slate-900">
                                                                {new Intl.NumberFormat('vi-VN').format(item.newPrice)}
                                                                <span className="text-[10px] ml-1">₫</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-xs font-black ${item.newPrice >= item.oldPrice ? 'text-rose-500' : 'text-emerald-500'
                                                        }`}>
                                                        {item.newPrice >= item.oldPrice ? '+' : ''}
                                                        {(((item.newPrice - item.oldPrice) / item.oldPrice) * 100).toFixed(1)}%
                                                    </div>
                                                </div>

                                                {item.reason && (
                                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2">
                                                        <Info size={14} className="text-indigo-400 mt-0.5" />
                                                        <p className="text-xs text-slate-500 font-medium italic">"{item.reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <EmptyState message="Chưa có dữ liệu biến động giá" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                Đóng nhật ký
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

const EmptyState = ({ message }) => (
    <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
            <History className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
);

export default VariantHistoryDrawer;
