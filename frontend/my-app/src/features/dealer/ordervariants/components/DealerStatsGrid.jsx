import React from "react";
import {
    FiPackage,
    FiAlertCircle,
    FiTruck,
    FiTrendingUp,
    FiZap
} from "react-icons/fi";

const StatCard = ({ label, value, icon: Icon, colorClass, delay }) => (
    <div
        className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 fill-mode-both`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`p-4 rounded-2xl ${colorClass} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const DealerStatsGrid = ({ stats }) => {
    const {
        totalUnits = 0,
        lowStock = 0,
        inTransit = 0,
        deliveredThisMonth = 0
    } = stats || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                label="Tổng tồn kho"
                value={totalUnits}
                icon={FiPackage}
                colorClass="bg-blue-50 text-blue-600"
                delay={0}
            />
            <StatCard
                label="Tồn kho thấp"
                value={lowStock}
                icon={FiAlertCircle}
                colorClass="bg-rose-50 text-rose-600"
                delay={100}
            />
            <StatCard
                label="Đang vận chuyển"
                value={inTransit}
                icon={FiTruck}
                colorClass="bg-indigo-50 text-indigo-600"
                delay={200}
            />
            <StatCard
                label="Đã nhận tháng này"
                value={deliveredThisMonth}
                icon={FiZap}
                colorClass="bg-emerald-50 text-emerald-600"
                delay={300}
            />
        </div>
    );
};

export default DealerStatsGrid;
