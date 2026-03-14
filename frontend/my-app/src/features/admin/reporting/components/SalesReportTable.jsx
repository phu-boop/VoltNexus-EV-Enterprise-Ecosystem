import React from "react";

// Component này nhận dữ liệu (là mảng SalesSummaryByDealership)
const SalesReportTable = ({ data }) => {
  // --- ĐỊNH NGHĨA STYLE NỘI TUYẾN ---
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

  // Style để căn lề
  const textAlignLeft = { textAlign: "left" };
  const textAlignRight = { textAlign: "right" };
  // --- KẾT THÚC ĐỊNH NGHĨA STYLE ---

  if (!data || data.length === 0) {
    return <p>Không có dữ liệu để hiển thị.</p>;
  }

  // Hàm định dạng tiền tệ (tách ra cho sạch)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm định dạng ngày (tách ra cho sạch)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {/* Căn lề trái cho tiêu đề văn bản */}
          <th style={{ ...thStyle, ...textAlignLeft }}>Khu vực</th>
          <th style={{ ...thStyle, ...textAlignLeft }}>Tên Đại lý</th>
          <th style={{ ...thStyle, ...textAlignLeft }}>Mẫu xe</th>
          <th style={{ ...thStyle, ...textAlignLeft }}>Phiên bản</th>

          {/* Căn lề phải cho tiêu đề số liệu */}
          <th style={{ ...thStyle, ...textAlignRight }}>Số lượng bán</th>
          <th style={{ ...thStyle, ...textAlignRight }}>Tổng doanh thu</th>
          <th style={{ ...thStyle, ...textAlignRight }}>Ngày bán cuối</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={`${row.region}-${row.dealershipId}-${row.variantId}`}>
            {/* Căn lề trái cho nội dung văn bản */}
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.region}</td>
            <td style={{ ...tdStyle, ...textAlignLeft }}>
              {row.dealershipName}
            </td>
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.modelName}</td>
            <td style={{ ...tdStyle, ...textAlignLeft }}>{row.variantName}</td>

            {/* Căn lề phải cho nội dung số liệu */}
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {row.totalUnitsSold}
            </td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {formatCurrency(row.totalRevenue)}
            </td>
            <td style={{ ...tdStyle, ...textAlignRight }}>
              {formatDate(row.lastSaleAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SalesReportTable;
