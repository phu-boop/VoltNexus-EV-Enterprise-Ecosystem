/**
 * Định dạng một chuỗi ngày (ISO string) sang định dạng ngày/tháng/năm giờ:phút của VN.
 * * @param {string | null | undefined} dateString - Chuỗi ngày ISO (ví dụ: "2025-10-31T17:00:00Z")
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "31/10/2025, 17:00")
 */
export const formatDate = (dateString) => {
    if (!dateString) {
        return "N/A"; // Trả về nếu không có ngày
    }

    try {
        const date = new Date(dateString);

        // Kiểm tra xem date có hợp lệ không
        if (isNaN(date.getTime())) {
            return "Ngày không hợp lệ";
        }

        // Sử dụng Intl.DateTimeFormat để định dạng chuẩn vi-VN
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Dùng 24h
        }).format(date);
    } catch (error) {
        console.error("Lỗi format ngày:", error);
        return "Ngày lỗi";
    }
};
