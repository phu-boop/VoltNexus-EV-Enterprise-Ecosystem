//package com.ev.payment_service.service;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import jakarta.servlet.http.HttpServletRequest;
//
//import javax.crypto.Mac;
//import javax.crypto.spec.SecretKeySpec;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.text.SimpleDateFormat;
//import java.util.*;
//
//@Service
//public class PaymentService {
//
//    private final String tmnCode;
//    private final String hashSecret;
//    private final String paymentUrl;
//    private final String defaultReturnUrl;
//
//    public PaymentService(
//            @Value("${vnpay.tmnCode}") String tmnCode,
//            @Value("${vnpay.hashSecret}") String hashSecret,
//            @Value("${vnpay.paymentUrl}") String paymentUrl,
//            @Value("${vnpay.returnUrl}") String defaultReturnUrl
//    ) {
//        this.tmnCode = tmnCode;
//        this.hashSecret = hashSecret;
//        this.paymentUrl = paymentUrl;
//        this.defaultReturnUrl = defaultReturnUrl;
//    }
//
//    /**
//     * Tạo URL thanh toán VNPAY với returnUrl tùy chọn
//     */
//    public String createPaymentUrl(String orderId, Long amount, HttpServletRequest request, String customReturnUrl) {
//        Map<String, String> params = new HashMap<>();
//        params.put("vnp_Version", "2.1.0");
//        params.put("vnp_Command", "pay");
//        params.put("vnp_TmnCode", tmnCode);
//        params.put("vnp_Amount", String.valueOf(amount * 100)); // nhân 100
//        params.put("vnp_CurrCode", "VND");
//        params.put("vnp_TxnRef", orderId);
//        params.put("vnp_OrderInfo", "ThanhToanDonHang_" + orderId);
//        params.put("vnp_OrderType", "other");
//
//        // Sử dụng customReturnUrl nếu có, không thì dùng default
//        String returnUrlToUse = (customReturnUrl != null && !customReturnUrl.trim().isEmpty())
//            ? customReturnUrl
//            : defaultReturnUrl;
//        params.put("vnp_ReturnUrl", returnUrlToUse);
//
//        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
//        params.put("vnp_IpAddr", getClientIpAddr(request));
//        params.put("vnp_Locale", "vn");
//
//        // Tạo query string và hash data
//        String queryString = buildQueryString(params, false); // false = for URL
//        String hashData = buildQueryString(params, true);     // true = for hash
//
//        // Tạo vnp_SecureHash
//        String vnp_SecureHash = hmacSHA512(hashSecret, hashData);
//
//        // Tạo URL cuối cùng
//        String finalUrl = paymentUrl + "?" + queryString
//                + "&vnp_SecureHash=" + vnp_SecureHash;
//
//        // Log debug
//
//        return finalUrl;
//    }
//
//    /**
//     * Overload method cho backward compatibility
//     */
//    public String createPaymentUrl(String orderId, Long amount, HttpServletRequest request) {
//        return createPaymentUrl(orderId, amount, request, null);
//    }
//
//    /**
//     * Xây dựng query string
//     * @param forHash: true = cho hash data, false = cho URL
//     */
//    private String buildQueryString(Map<String, String> params, boolean forHash) {
//        List<String> keys = new ArrayList<>(params.keySet());
//        Collections.sort(keys);
//
//        StringBuilder sb = new StringBuilder();
//        for (String key : keys) {
//            String value = params.get(key);
//            if (value != null && !value.isEmpty()) {
//                if (sb.length() > 0) {
//                    sb.append("&");
//                }
//
//                if (forHash) {
//                    // Cho hash data: chỉ encode vnp_ReturnUrl
//                    if ("vnp_ReturnUrl".equals(key)) {
//                        sb.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
//                    } else {
//                        sb.append(key).append("=").append(value);
//                    }
//                } else {
//                    // Cho URL: encode tất cả values
//                    sb.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
//                }
//            }
//        }
//        return sb.toString();
//    }
//
//    /**
//     * HMAC-SHA512
//     */
//    public String hmacSHA512(String key, String data) {
//        try {
//            Mac hmac = Mac.getInstance("HmacSHA512");
//            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
//            hmac.init(secretKey);
//            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
//            StringBuilder hash = new StringBuilder();
//            for (byte b : bytes) {
//                String hex = Integer.toHexString(0xff & b);
//                if (hex.length() == 1) hash.append('0');
//                hash.append(hex);
//            }
//            return hash.toString();
//        } catch (Exception e) {
//            throw new RuntimeException("Error calculating HMAC", e);
//        }
//    }
//
//    /**
//     * Lấy IP client
//     */
//    private String getClientIpAddr(HttpServletRequest request) {
//        String ip = request.getHeader("X-Forwarded-For");
//        if (ip != null && !ip.isEmpty()) {
//            ip = ip.split(",")[0].trim();
//            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
//            return ip;
//        }
//
//        ip = request.getHeader("X-Real-IP");
//        if (ip != null && !ip.isEmpty()) {
//            if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
//            return ip;
//        }
//
//        ip = request.getRemoteAddr();
//        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) ip = "127.0.0.1";
//        return ip;
//    }
//
//    /**
//     * Verify chữ ký callback từ VNPAY
//     */
//    public boolean verifyVnpayHash(Map<String, String> params) {
//        String vnp_SecureHash = params.get("vnp_SecureHash");
//        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
//            return false;
//        }
//
//        Map<String, String> data = new HashMap<>(params);
//        data.remove("vnp_SecureHash");
//        data.remove("vnp_SecureHashType");
//
//        // Xây dựng hash data string (giống khi tạo URL)
//        List<String> keys = new ArrayList<>(data.keySet());
//        Collections.sort(keys);
//
//        StringBuilder hashData = new StringBuilder();
//        for (String key : keys) {
//            String value = data.get(key);
//            if (value != null && !value.isEmpty()) {
//                if (hashData.length() > 0) {
//                    hashData.append("&");
//                }
//                // Chỉ encode vnp_ReturnUrl khi verify hash
//                if ("vnp_ReturnUrl".equals(key)) {
//                    hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
//                } else {
//                    hashData.append(key).append("=").append(value);
//                }
//            }
//        }
//
//        String hashDataStr = hashData.toString();
//        String checkHash = hmacSHA512(hashSecret, hashDataStr);
//
//
//        return checkHash.equalsIgnoreCase(vnp_SecureHash);
//    }
//}