import React from "react";

const Alert = ({ type = "info", message, onClose }) => {
    if (!message) return null; // không hiển thị nếu message rỗng

    let bgColor = "";
    switch (type) {
        case "success":
            bgColor = "bg-green-100 text-green-800";
            break;
        case "error":
            bgColor = "bg-red-100 text-red-800";
            break;
        case "warning":
            bgColor = "bg-yellow-100 text-yellow-800";
            break;
        default:
            bgColor = "bg-blue-100 text-blue-800";
    }

    return (
        <div className={`p-4 rounded mb-4 flex justify-between items-center ${bgColor}`}>
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 font-bold text-xl leading-none"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default Alert;
