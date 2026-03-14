/**
 * Định dạng một số hoặc chuỗi số thành định dạng tiền tệ VNĐ.
 * * @param {number | string | null | undefined} value - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "1.500.000 ₫")
 */
export const formatCurrency = (value) => {
    const numberValue = Number(value);

    // Trả về giá trị mặc định nếu đầu vào không phải là số
    if (isNaN(numberValue)) {
        return "0 ₫";
    }

    // Sử dụng Intl.NumberFormat để định dạng tiền tệ chuẩn vi-VN
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0, // Không hiển thị số lẻ (ví dụ: ,00)
    }).format(numberValue);
};
