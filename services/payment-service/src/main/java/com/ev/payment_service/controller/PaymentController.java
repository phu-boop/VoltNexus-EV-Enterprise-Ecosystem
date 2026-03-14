//package com.ev.payment_service.controller;
//
//import com.ev.payment_service.service.PaymentService;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.IOException;
//import java.util.*;
//@RestController
//@RequestMapping("/payment")
//public class PaymentController {
//
//    private final PaymentService paymentService;
//
//    public PaymentController(PaymentService paymentService) {
//        this.paymentService = paymentService;
//    }
//
//    /**
//     * Tạo URL thanh toán VNPAY với returnUrl tùy chọn
//     */
//    @GetMapping("/pay-url")
//    public ResponseEntity<?> createPaymentUrl(
//            @RequestParam String orderId,
//            @RequestParam Long amount,
//            @RequestParam(required = false) String returnUrl,
//            HttpServletRequest request) {
//
//        try {
//
//            String paymentUrl = paymentService.createPaymentUrl(orderId, amount, request, returnUrl);
//
//            Map<String, String> response = new HashMap<>();
//            response.put("url", paymentUrl);
//            response.put("status", "success");
//            response.put("orderId", orderId);
//            response.put("amount", String.valueOf(amount));
//
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//
//            Map<String, String> errorResponse = new HashMap<>();
//            errorResponse.put("status", "error");
//            errorResponse.put("message", "Không thể tạo URL thanh toán");
//
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }
//
//    /**
//     * VNPAY callback return - trả về JSON cho frontend
//     */
//    @GetMapping("/return")
//    public ResponseEntity<Map<String, Object>> paymentReturn(@RequestParam Map<String, String> params) {
//
//
//        boolean validHash = paymentService.verifyVnpayHash(params);
//        String responseCode = params.get("vnp_ResponseCode");
//        boolean success = validHash && "00".equals(responseCode);
//
//        long amount = 0;
//        try {
//            amount = Long.parseLong(params.get("vnp_Amount")) / 100;
//        } catch (Exception e) {
//        }
//
//        String message;
//        if (!validHash) {
//            message = "Dữ liệu không hợp lệ";
//        } else if (!"00".equals(responseCode)) {
//            message = "Thanh toán thất bại, mã lỗi: " + responseCode;
//        } else {
//            message = "Thanh toán thành công";
//        }
//
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("success", success);
//        response.put("amount", amount);
//        response.put("message", message);
//        response.put("orderId", params.get("vnp_TxnRef"));
//        response.put("transactionNo", params.get("vnp_TransactionNo"));
//        response.put("bankCode", params.get("vnp_BankCode"));
//        response.put("payDate", params.get("vnp_PayDate"));
//        response.put("responseCode", responseCode);
//
//        return ResponseEntity.ok(response);
//    }
//}
