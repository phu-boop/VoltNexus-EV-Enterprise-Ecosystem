import React from "react";
import {
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiAlertTriangle,
  FiRotateCcw,
  FiHelpCircle
} from "react-icons/fi";

const StatusBadge = ({ status }) => {
  let config = {
    colorClasses: "bg-slate-100 text-slate-800 border-slate-200",
    text: status || "Không xác định",
    Icon: FiHelpCircle
  };

  switch (status) {
    case "PENDING":
      config = {
        colorClasses: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100",
        text: "Chờ Hãng duyệt",
        Icon: FiClock
      };
      break;
    case "CONFIRMED":
      config = {
        colorClasses: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100",
        text: "Hãng đã duyệt",
        Icon: FiCheckCircle
      };
      break;
    case "IN_TRANSIT":
      config = {
        colorClasses: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100 animate-pulse-slow",
        text: "Đang vận chuyển",
        Icon: FiTruck
      };
      break;
    case "DELIVERED":
      config = {
        colorClasses: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100",
        text: "Giao thành công",
        Icon: FiPackage
      };
      break;
    case "CANCELLED":
      config = {
        colorClasses: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100",
        text: "Đã hủy đơn",
        Icon: FiXCircle
      };
      break;
    case "DISPUTED":
      config = {
        colorClasses: "bg-orange-50 text-orange-700 border-orange-200 shadow-sm shadow-orange-100",
        text: "Đang khiếu nại",
        Icon: FiAlertTriangle
      };
      break;
    case "REORDER_REQUIRED":
      config = {
        colorClasses: "bg-purple-50 text-purple-700 border-purple-200 shadow-sm shadow-purple-100",
        text: "Cần đặt thêm",
        Icon: FiRotateCcw
      };
      break;
    default:
      break;
  }

  const { colorClasses, text, Icon } = config;

  return (
    <span
      className={`px-3 py-1.5 text-xs font-black rounded-xl border flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95 ${colorClasses}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="tracking-tight uppercase">{text}</span>
    </span>
  );
};

export default StatusBadge;
