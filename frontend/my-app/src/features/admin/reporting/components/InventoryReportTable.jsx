import React from "react";

// Component này nhận dữ liệu (là mảng InventoryVelocityDTO)
const InventoryReportTable = ({ data }) => {
  // --- ĐỊNH NGHĨA STYLE NỘI TUYẾN ---
  // Chúng ta định nghĩa các style ở đây để tái sử dụng
  // và giữ cho JSX (bên dưới) được sạch sẽ.

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse", // Gộp viền
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  };

  const thStyle = {
    backgroundColor: "#f4f6f8",
    fontWeight: "600",
    padding: "12px 16px", // <-- Tạo giãn cách
    border: "1px solid #ddd", // Thêm viền
  };

  const tdStyle = {
    padding: "12px 16px", // <-- Tạo giãn cách
    border: "1px solid #ddd", // Thêm viền
  };

  // Style để căn lề (thay thế cho className)
  const textAlignLeft = { textAlign: "left" };
  const textAlignRight = { textAlign: "right" };

  // --- KẾT THÚC ĐỊNH NGHĨA STYLE ---

  if (!data || data.length === 0) {
    return <p>Không có dữ liệu để hiển thị.</p>;
  }

  // Hàm định dạng số
  const formatNumber = (num) => {
    // Kiểm tra xem num có phải là một số không
    if (typeof num !== "number" || isNaN(num)) {
      return "N/A"; // Hoặc '0.00', hoặc '---' tùy bạn
    }
    // Nếu là số, an toàn để gọi toFixed()
    return num.toFixed(2);
  };

  return (
    // Thêm style cho thẻ <table>
    <table style={tableStyle}>
      <thead>
        <tr>
          {/* Sử dụng '...' (spread operator) để gộp 2 style lại:
            style cơ bản (thStyle) và style căn lề (textAlignLeft)
          */}
          <th style={{ ...thStyle, ...textAlignLeft }}>Khu vực</th>
          <th style={{ ...thStyle, ...textAlignLeft }}>Mẫu xe</th>
          <th style={{ ...thStyle, ...textAlignLeft }}>Phiên bản</th>
          <th style={{ ...thStyle, ...textAlignRight }}>Tồn kho (Hiện tại)</th>
          <th style={{ ...thStyle, ...textAlignRight }}>Bán (30 ngày)</th>
          <th style={{ ...thStyle, ...textAlignRight }}>TB Bán/Ngày</th>
          <th style={{ ...thStyle, ...textAlignRight }}>
            Ngày hàng còn lại (Dự kiến)
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={`${row.region}-${row.variantId}`}>
            {/* Tương tự, gộp style cho các ô <td> */}
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.region}</td>
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.modelName}</td>
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.variantName}</td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {row.currentStock}
            </td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {row.salesLast30Days}
            </td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {formatNumber(row.averageDailySales)}
            </td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {formatNumber(row.daysOfSupply)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryReportTable;
