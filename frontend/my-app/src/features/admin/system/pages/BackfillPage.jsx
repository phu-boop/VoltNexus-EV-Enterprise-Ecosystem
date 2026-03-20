import React, { useState, useEffect } from "react";
import {
  callBackfillDealers,
  callBackfillVehicles,
} from "../services/systemService";

// === STYLE NỘI TUYẾN ===
const pageStyle = {
  fontFamily: "Arial, sans-serif",
  padding: "24px",
  backgroundColor: "#f9fbfd",
  minHeight: "100vh",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  maxWidth: "800px",
  margin: "0 auto",
};

const titleStyle = {
  color: "#333",
  margin: "0 0 16px 0",
  borderBottom: "2px solid #eee",
  paddingBottom: "16px",
};

const descriptionStyle = {
  fontSize: "15px",
  color: "#555",
  lineHeight: "1.6",
  backgroundColor: "#fffbe6", // Màu vàng nhạt
  border: "1px solid #ffe58f", // Viền vàng
  padding: "16px",
  borderRadius: "6px",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "16px",
  marginTop: "24px",
};

// Style cơ bản cho nút
const buttonBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 20px",
  fontSize: "15px",
  fontWeight: "600",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  minWidth: "220px", // Đặt chiều rộng cố định
};

// Style cho nút "Dealers"
const dealerButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "#007bff", // Xanh dương
  color: "white",
};

// Style cho nút "Vehicles"
const vehicleButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "#28a745", // Xanh lá
  color: "white",
};

// Style khi nút bị vô hiệu hóa
const disabledButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "#cccccc",
  color: "#666666",
  cursor: "not-allowed",
};

// Style cho thông báo (thành công / thất bại)
const messageBoxBase = {
  padding: "16px",
  margin: "24px 0 0 0",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "500",
};

const successBoxStyle = {
  ...messageBoxBase,
  backgroundColor: "#e6ffed",
  border: "1px solid #b7ebc9",
  color: "#0d6a33",
};

const errorBoxStyle = {
  ...messageBoxBase,
  backgroundColor: "#fff0f0",
  border: "1px solid #ffb8b8",
  color: "#d8000c",
};
// === KẾT THÚC STYLE ===

// === COMPONENT SPINNER (CHO SINH ĐỘNG) ===
const LoadingSpinner = () => {
  // Style cho spinner
  const spinnerStyle = {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "10px",
  };

  // Thêm keyframes vào document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return <span style={spinnerStyle}></span>;
};
// === KẾT THÚC SPINNER ===

const BackfillPage = () => {
  const [loading, setLoading] = useState(null); // 'dealers', 'vehicles', or null
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

  // State để quản lý hover (cho style nội tuyến)
  const [isDealerHover, setDealerHover] = useState(false);
  const [isVehicleHover, setVehicleHover] = useState(false);

  const handleBackfill = async (type) => {
    setLoading(type);
    setMessage(null);

    try {
      let response;
      if (type === "dealers") {
        response = await callBackfillDealers();
      } else {
        response = await callBackfillVehicles();
      }

      setMessage({
        type: "success",
        text: `Backfill ${type} thành công! ${response.data}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Backfill ${type} thất bại: ${
          err.response?.data?.message || err.message
        }`,
      });
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  // Tính toán style động cho nút
  const getButtonStyle = (type, isLoading, isHover) => {
    if (isLoading) return disabledButtonStyle;

    let baseStyle = type === "dealers" ? dealerButtonStyle : vehicleButtonStyle;

    // Thêm hiệu ứng hover
    if (isHover) {
      return { ...baseStyle, opacity: 0.85 };
    }

    return baseStyle;
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>⚙️ Công cụ Đồng bộ Dữ liệu (Backfill)</h2>
        <p style={descriptionStyle}>
          Sử dụng chức năng này để đồng bộ dữ liệu (Đại lý, Xe) đã tồn tại từ
          các service khác sang Bảng Cache của Báo cáo.
          <br />
          <strong style={{ color: "#c70000" }}>
            CẢNH BÁO: Chỉ chạy khi cần thiết hoặc khi khởi tạo hệ thống.
          </strong>
        </p>

        <div style={buttonContainerStyle}>
          <button
            style={getButtonStyle(
              "dealers",
              loading === "dealers",
              isDealerHover
            )}
            onClick={() => handleBackfill("dealers")}
            disabled={loading !== null} // Vô hiệu hóa cả 2 nút khi 1 nút đang chạy
            onMouseEnter={() => setDealerHover(true)}
            onMouseLeave={() => setDealerHover(false)}
          >
            {loading === "dealers" ? (
              <>
                <LoadingSpinner />
                Đang đồng bộ...
              </>
            ) : (
              "1. Đồng bộ Đại lý (Dealers)"
            )}
          </button>

          <button
            style={getButtonStyle(
              "vehicles",
              loading === "vehicles",
              isVehicleHover
            )}
            onClick={() => handleBackfill("vehicles")}
            disabled={loading !== null} // Vô hiệu hóa cả 2 nút khi 1 nút đang chạy
            onMouseEnter={() => setVehicleHover(true)}
            onMouseLeave={() => setVehicleHover(false)}
          >
            {loading === "vehicles" ? (
              <>
                <LoadingSpinner />
                Đang đồng bộ...
              </>
            ) : (
              "2. Đồng bộ Xe (Vehicles)"
            )}
          </button>
        </div>

        {message && (
          <div
            style={message.type === "success" ? successBoxStyle : errorBoxStyle}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackfillPage;
