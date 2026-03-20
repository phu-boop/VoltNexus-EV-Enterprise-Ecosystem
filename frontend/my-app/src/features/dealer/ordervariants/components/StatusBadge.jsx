import React from "react";

const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status;

  switch (status) {
    case "PENDING":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Chờ duyệt";
      break;
    case "CONFIRMED":
      colorClasses = "bg-blue-100 text-blue-800";
      text = "Đã duyệt";
      break;
    case "IN_TRANSIT":
      colorClasses = "bg-cyan-100 text-cyan-800";
      text = "Đang giao";
      break;
    case "DELIVERED":
      colorClasses = "bg-green-100 text-green-800";
      text = "Đã nhận";
      break;
    case "CANCELLED":
      colorClasses = "bg-red-100 text-red-800";
      text = "Đã hủy";
      break;
    case "DISPUTED":
      colorClasses = "bg-orange-100 text-orange-800";
      text = "Đang khiếu nại";
      break;
    default:
      break;
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
