package com.ev.common_lib.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    //
    SUCCESS("1000", "Thành công", HttpStatus.OK),

    // ===== 2xxx - Lỗi từ phía Client =====
    VALIDATION_ERROR("2001", "Xác thực dữ liệu thất bại", HttpStatus.BAD_REQUEST),
    BAD_REQUEST("2002", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED("2003", "Phương thức HTTP không được phép", HttpStatus.METHOD_NOT_ALLOWED),
    UNSUPPORTED_MEDIA_TYPE("2004", "Định dạng dữ liệu không được hỗ trợ", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    MISSING_REQUIRED_FIELD("2005", "Thiếu trường bắt buộc", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT("2006", "Định dạng email không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT("2007", "Mật khẩu phải có ít nhất 8 ký tự", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID_FORMAT("2008", "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            HttpStatus.BAD_REQUEST),
    AGE_TOO_YOUNG("2009", "Người dùng phải từ 18 tuổi trở lên", HttpStatus.BAD_REQUEST),
    PHONE_INVALID_FORMAT("2010", "Số điện thoại phải từ 10 đến 12 chữ số", HttpStatus.BAD_REQUEST),
    TOO_MANY_REQUESTS("2011", "Thực hiện quá nhiều yêu cầu trong thời gian ngắn", HttpStatus.TOO_MANY_REQUESTS),
    INVALID_DATE_FUTURE("2012", "Ngày phải nằm trong tương lai", HttpStatus.BAD_REQUEST),
    INVALID_DISCOUNT_RANGE("2013", "Mức giảm giá phải nằm trong khoảng từ 0 đến 100", HttpStatus.BAD_REQUEST),
    INVALID_PRICE("2014", "Giá phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    MISSING_TERMS_CONDITIONS("2015", "Thiếu điều khoản và điều kiện", HttpStatus.BAD_REQUEST),
    VALID_UNTIL_REQUIRED("2016", "Ngày hết hạn là bắt buộc", HttpStatus.BAD_REQUEST),
    VALID_UNTIL_FUTURE("2017", "Ngày hết hạn phải nằm trong tương lai", HttpStatus.BAD_REQUEST),
    TERMS_CONDITIONS_REQUIRED("2018", "Điều khoản và điều kiện là bắt buộc", HttpStatus.BAD_REQUEST),
    DEALER_ID_REQUIRED("2019", "Thiếu ID đại lý", HttpStatus.BAD_REQUEST),
    CUSTOMER_ID_REQUIRED("2020", "Thiếu ID khách hàng", HttpStatus.BAD_REQUEST),
    MODEL_ID_REQUIRED("2021", "Thiếu ID mẫu xe", HttpStatus.BAD_REQUEST),
    VARIANT_ID_REQUIRED("2022", "Thiếu ID phiên bản xe", HttpStatus.BAD_REQUEST),
    STAFF_ID_REQUIRED("2023", "Thiếu ID nhân viên", HttpStatus.BAD_REQUEST),
    BASE_PRICE_REQUIRED("2024", "Giá gốc là bắt buộc", HttpStatus.BAD_REQUEST),
    BASE_PRICE_POSITIVE("2025", "Giá gốc phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    DISCOUNT_RATE_MAX("2026", "Tỷ lệ giảm giá không được vượt quá 100%", HttpStatus.BAD_REQUEST),
    DISCOUNT_RATE_MIN("2027", "Tỷ lệ giảm giá không được âm", HttpStatus.BAD_REQUEST),
    INVALID_UUID_FORMAT("2028", "Định dạng UUID không hợp lệ", HttpStatus.BAD_REQUEST),
    // ----- 2xxx - Lỗi từ phía Client -----
    DEPARTMENT_MUST_NOT_BE_BLANK("2029", "Phòng ban không được để trống", HttpStatus.BAD_REQUEST),
    MANAGEMENT_LEVEL_MUST_NOT_BE_BLANK("2030", "Cấp quản lý không được để trống", HttpStatus.BAD_REQUEST),
    APPROVAL_LIMIT_IS_REQUIRED("2031", "Giới hạn phê duyệt là bắt buộc", HttpStatus.BAD_REQUEST),
    APPROVAL_LIMIT_INVALID_FORMAT("2032", "Giới hạn phê duyệt phải là số hợp lệ, tối đa 13 chữ số nguyên và 2 thập phân", HttpStatus.BAD_REQUEST),
    POSITION_MUST_NOT_BE_BLANK("2033", "Chức vụ không được để trống", HttpStatus.BAD_REQUEST),
    HIRE_DATE_IS_REQUIRED("2034", "Ngày nhận việc là bắt buộc", HttpStatus.BAD_REQUEST),
    HIRE_DATE_INVALID_FORMAT("2035", "Ngày nhận việc không đúng định dạng yyyy-MM-dd", HttpStatus.BAD_REQUEST),
    SALARY_IS_REQUIRED("2036", "Lương là bắt buộc", HttpStatus.BAD_REQUEST),
    SALARY_INVALID_FORMAT("2037", "Lương phải là số hợp lệ, tối đa 13 chữ số nguyên và 2 thập phân", HttpStatus.BAD_REQUEST),
    COMMISSION_RATE_IS_REQUIRED("2038", "Tỷ lệ hoa hồng là bắt buộc", HttpStatus.BAD_REQUEST),
    COMMISSION_RATE_INVALID_FORMAT("2039", "Tỷ lệ hoa hồng phải là số hợp lệ, tối đa 3 chữ số nguyên và 2 thập phân", HttpStatus.BAD_REQUEST),
    SPECIALIZATION_MUST_NOT_BE_BLANK("2040", "Chuyên môn không được để trống", HttpStatus.BAD_REQUEST),


    // ===== 3xxx - Lỗi hệ thống (Server) =====
    INTERNAL_ERROR("3001", "Lỗi hệ thống nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),

    SERVICE_UNAVAILABLE("3002", "Dịch vụ tạm thời không khả dụng", HttpStatus.SERVICE_UNAVAILABLE),

    TIMEOUT("3003", "Yêu cầu quá thời gian chờ", HttpStatus.REQUEST_TIMEOUT),

    DOWNSTREAM_SERVICE_UNAVAILABLE("3004", "Dịch vụ phụ thuộc đang tạm ngừng hoạt động", HttpStatus.SERVICE_UNAVAILABLE),

    // ===== 4xxx - Lỗi xác thực & phân quyền =====
    UNAUTHORIZED("4001", "Chưa xác thực", HttpStatus.UNAUTHORIZED),

    FORBIDDEN("4002", "Không có quyền truy cập", HttpStatus.FORBIDDEN),

    TOKEN_EXPIRED("4003", "Token đã hết hạn", HttpStatus.UNAUTHORIZED),

    TOKEN_INVALID("4004", "Token không hợp lệ", HttpStatus.UNAUTHORIZED),

    ACCOUNT_LOCKED("4005", "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),

    TOKEN_LOGGED_OUT("4006", "Token đã đăng xuất", HttpStatus.UNAUTHORIZED),

    INVALID_REFRESH_TOKEN("4007", "Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED),

    RECAPTCHA_FAILED("4008", "Xác minh reCAPTCHA thất bại", HttpStatus.FORBIDDEN),

    // ===== 5xxx - Lỗi dữ liệu & cơ sở dữ liệu =====
    USER_NOT_FOUND("5001", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),

    EMAIL_ALREADY_EXISTS("5002", "Email đã tồn tại", HttpStatus.CONFLICT),

    PHONE_ALREADY_EXISTS("5003", "Số điện thoại đã tồn tại", HttpStatus.CONFLICT),

    DATA_NOT_FOUND("5004", "Không tìm thấy dữ liệu", HttpStatus.NOT_FOUND),

    DATA_ALREADY_EXISTS("5005", "Dữ liệu đã tồn tại", HttpStatus.CONFLICT),

    DATABASE_ERROR("5006", "Lỗi cơ sở dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR),

    CONSTRAINT_VIOLATION("5007", "Vi phạm ràng buộc dữ liệu", HttpStatus.BAD_REQUEST),

    INVALID_PASSWORD("5008", "Mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),

    INVALID_JSON_FORMAT("5009", "Định dạng JSON không hợp lệ", HttpStatus.BAD_REQUEST),

    DEALER_MANAGER_ALREADY_EXISTS("5010", "Đại lý đã có quản lý", HttpStatus.BAD_REQUEST),

    QUOTATION_NOT_FOUND("5011", "Không tìm thấy báo giá", HttpStatus.NOT_FOUND),

    INVALID_QUOTATION_STATUS("5012", "Trạng thái báo giá không hợp lệ", HttpStatus.BAD_REQUEST),

    QUOTATION_NOT_CALCULATED("5013", "Báo giá phải được tính toán trước khi gửi", HttpStatus.BAD_REQUEST),

    SALES_ORDER_ALREADY_EXISTS("5014", "Đơn hàng đã tồn tại cho báo giá này", HttpStatus.CONFLICT),

    // ===== 6xxx - Lỗi nghiệp vụ =====
    PAYMENT_FAILED("6001", "Thanh toán thất bại", HttpStatus.BAD_REQUEST),

    INSUFFICIENT_BALANCE("6002", "Số dư không đủ", HttpStatus.BAD_REQUEST),

    PRODUCT_OUT_OF_STOCK("6004", "Sản phẩm đã hết hàng", HttpStatus.CONFLICT),

    ORDER_NOT_FOUND("6005", "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),

    INVALID_ORDER_TYPE("6006", "Loại đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),

    SALES_ORDER_NOT_FOUND("6007", "Không tìm thấy đơn bán hàng", HttpStatus.NOT_FOUND),

    INVALID_DATA("6008", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    INVALID_STATE("6009", "Trạng thái nghiệp vụ không hợp lệ", HttpStatus.BAD_REQUEST),

    PROMOTION_NOT_APPLICABLE("6010", "Khuyến mãi không áp dụng được", HttpStatus.BAD_REQUEST),

    QUOTATION_EXPIRED("6011", "Báo giá đã hết hạn", HttpStatus.BAD_REQUEST),

    SALE_ORDER_CALCULATED("6012", "Đơn hàng đã được tính toán không thể thêm", HttpStatus.BAD_REQUEST),

    // ===== 6xxx-2 - Lỗi OrderItem, Tracking, Contract =====
    ORDER_ITEM_NOT_FOUND("6020", "Không tìm thấy sản phẩm trong đơn hàng", HttpStatus.NOT_FOUND),

    ORDER_ITEM_ALREADY_EXISTS("6021", "Sản phẩm này đã tồn tại trong đơn hàng", HttpStatus.CONFLICT),

    ORDER_ITEMS_REQUIRED("6022", "Danh sách sản phẩm trong đơn hàng là bắt buộc", HttpStatus.BAD_REQUEST),

    ORDER_ID_REQUIRED("6023", "Thiếu ID đơn hàng", HttpStatus.BAD_REQUEST),

    QUANTITY_REQUIRED("6024", "Thiếu số lượng sản phẩm", HttpStatus.BAD_REQUEST),

    UNIT_PRICE_REQUIRED("6025", "Thiếu đơn giá", HttpStatus.BAD_REQUEST),

    INVALID_QUANTITY("6026", "Số lượng không hợp lệ", HttpStatus.BAD_REQUEST),

    INVALID_UNIT_PRICE("6027", "Đơn giá không hợp lệ", HttpStatus.BAD_REQUEST),

    ORDER_TRACKING_NOT_FOUND("6030", "Không tìm thấy lịch sử theo dõi đơn hàng", HttpStatus.NOT_FOUND),

    INVALID_TRACKING_OPERATION_STATE("6031", "Đơn hàng đã hoàng tất không được phép thao tác", HttpStatus.BAD_REQUEST),

    ORDER_ITEM_OPERATION_INVALID_STATE("6032", "Chỉ được phép thao tác khi chưa tính toán", HttpStatus.BAD_REQUEST),

    INVALID_CONTRACT_OPERATION_STATE("6033", "đơn hàng chưa được xác nhận hợp đồng  không được thao tác", HttpStatus.BAD_REQUEST),

    SALES_CONTRACT_NOT_FOUND("6040", "Không tìm thấy hợp đồng bán hàng", HttpStatus.NOT_FOUND),

    SALES_CONTRACT_ALREADY_EXISTS("6041", "Hợp đồng đã tồn tại cho đơn hàng này", HttpStatus.CONFLICT),

    INVALID_CONTRACT_STATUS("6042", "Trạng thái hợp đồng không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST),

    INVALID_CONTRACT_TERMS("6043", "Điều khoản hợp đồng không hợp lệ", HttpStatus.BAD_REQUEST),

    MISSING_DIGITAL_SIGNATURE("6044", "Thiếu chữ ký số cho hợp đồng đã ký", HttpStatus.BAD_REQUEST),

    // ===== 6xxx-3 - Đơn hàng B2C (Bán lẻ) =====
    INVALID_ORDER_STATUS("6050", "Trạng thái đơn hàng không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST),

    ORDER_ITEMS_REQUIRED_B2C("6051", "Danh sách sản phẩm không được để trống", HttpStatus.BAD_REQUEST),

    VARIANT_ID_REQUIRED_B2C("6052", "ID phiên bản xe là bắt buộc", HttpStatus.BAD_REQUEST),

    INVALID_QUANTITY_B2C("6053", "Số lượng phải lớn hơn 0", HttpStatus.BAD_REQUEST),

    INVALID_UNIT_PRICE_B2C("6054", "Đơn giá phải lớn hơn 0", HttpStatus.BAD_REQUEST),

    // ===== 7xxx - Lỗi dịch vụ xe =====
    VEHICLE_MODEL_NOT_FOUND("7001", "Không tìm thấy mẫu xe", HttpStatus.NOT_FOUND),

    VEHICLE_MODEL_ALREADY_EXISTS("7002", "Mẫu xe với tên và phiên bản này đã tồn tại", HttpStatus.CONFLICT),

    VEHICLE_VARIANT_NOT_FOUND("7003", "Không tìm thấy phiên bản xe", HttpStatus.NOT_FOUND),

    FEATURE_NOT_FOUND("7004", "Không tìm thấy tính năng", HttpStatus.NOT_FOUND),

    VEHICLE_VARIANT_SKU_ALREADY_EXISTS("7005", "Phiên bản xe với mã SKU này đã tồn tại", HttpStatus.CONFLICT),

    VARIANT_FEATURE_NOT_FOUND("7006", "Không tìm thấy tính năng của phiên bản xe", HttpStatus.NOT_FOUND),
    FEATURE_ALREADY_EXISTS("7007", "Tính năng với tên này đã tồn tại", HttpStatus.CONFLICT),
    FEATURE_IS_ASSIGNED("7008", "Không thể xóa. Tính năng đang được gán cho phiên bản", HttpStatus.BAD_REQUEST),

    // ===== 8xxx - Lỗi kho hàng =====
    INVENTORY_NOT_FOUND("8001", "Không tìm thấy dữ liệu tồn kho cho phiên bản này", HttpStatus.NOT_FOUND),

    INSUFFICIENT_STOCK("8002", "Số lượng tồn kho không đủ để thực hiện giao dịch", HttpStatus.BAD_REQUEST),

    ALLOCATION_NOT_FOUND("8003", "Không tìm thấy dữ liệu phân bổ cho đại lý và phiên bản này", HttpStatus.NOT_FOUND),

    // ===== 9xxx - Dịch vụ bên ngoài =====
    EMAIL_SENDING_FAILED("9001", "Gửi email thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    CUSTOMER_NOT_FOUND("9002", "Không tìm thấy khách hàng", HttpStatus.NOT_FOUND),

    // Cart errors
    CART_ITEM_NOT_FOUND("9003", "Không tìm thấy sản phẩm trong giỏ hàng", HttpStatus.NOT_FOUND),
    CART_EMPTY("9004", "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    INVALID_CART_QUANTITY("9005", "Số lượng trong giỏ hàng không hợp lệ", HttpStatus.BAD_REQUEST),

    CUSTOMER_SERVICE_UNAVAILABLE("9010", "Dịch vụ khách hàng tạm thời không khả dụng", HttpStatus.SERVICE_UNAVAILABLE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
