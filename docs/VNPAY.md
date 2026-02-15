# Tổng quan tích hợp VNPAY

Tài liệu này tổng hợp toàn bộ thành phần VNPAY trong EV Dealer Platform (gateway, backend payment-service, frontend React). Mục tiêu là giúp đội phát triển nắm rõ luồng B2C/B2B, vị trí mã nguồn và cách kiểm tra/khắc phục sự cố.

---

## 1. Cây thư mục các tệp liên quan

```text
ev-dealer-platform/
├── VNPAY.md                          # Tài liệu hiện tại
├── gateway/
│   ├── src/main/java/com/ev/gateway/config/JwtGlobalFilter.java
│   ├── src/main/java/com/ev/gateway/config/SecurityConfig.java
│   └── src/main/resources/.env       # tmnCode/hashSecret/url sandbox
├── services/
│   └── payment-service/
│       ├── src/main/java/com/ev/payment_service/config/VnpayConfig.java
│       ├── src/main/java/com/ev/payment_service/controller/
│       │   ├── VnpayGatewayController.java     # API gateway cho B2C & B2B
│       │   ├── CustomerPaymentController.java
│       │   └── DealerPaymentController.java
│       ├── src/main/java/com/ev/payment_service/service/Implementation/
│       │   ├── VnpayServiceImpl.java
│       │   ├── CustomerPaymentServiceImpl.java
│       │   └── DealerPaymentServiceImpl.java
│       ├── src/main/java/com/ev/payment_service/entity/
│       │   ├── Transaction.java
│       │   ├── DealerTransaction.java
│       │   ├── DealerInvoice.java
│       │   └── PaymentRecord.java
│       └── src/main/java/com/ev/payment_service/repository/
│           ├── TransactionRepository.java
│           ├── DealerTransactionRepository.java
│           └── PaymentRecordRepository.java
└── frontend/
    └── my-app/src/features/payments/
        ├── pages/
        │   ├── PayB2COrderPage.jsx
        │   ├── PaymentResultPage.jsx
        │   ├── PayInvoicePage.jsx
        │   └── DealerPaymentResultPage.jsx
        └── services/paymentService.js
```

---

## 2. Vai trò của các tệp chính

| Nhóm | Tệp | Vai trò |
| --- | --- | --- |
| Gateway | `.../JwtGlobalFilter.java` | Thêm header `X-User-*`, whitelist callback `vnpay-return` & `vnpay-ipn`. |
| Gateway | `.../SecurityConfig.java` | PermitAll route VNPAY, bật CORS từ frontend. |
| Gateway | `.env` | Nguồn tmnCode/hashSecret/url sandbox đồng bộ với backend. |
| Payment backend | `VnpayConfig.java` | Map `vnpay.*` sang bean cấu hình cho `VnpayServiceImpl`. |
| Payment backend | `VnpayGatewayController.java` | REST entrypoint: `/initiate-b2c`, `/callback/vnpay-return`, `/callback/vnpay-ipn`. |
| Payment backend | `VnpayServiceImpl.java` | Sinh URL thanh toán, ký HMAC, verify checksum, cập nhật `Transaction`/`DealerTransaction`. |
| Payment backend | `CustomerPaymentController/ServiceImpl` | Khởi tạo thanh toán B2C, quản lý `PaymentRecord`. |
| Payment backend | `DealerPaymentController/ServiceImpl` | Khởi tạo thanh toán hóa đơn B2B, cập nhật `DealerInvoice` và công nợ. |
| Frontend | `PayB2COrderPage.jsx` | Dealer Staff khởi tạo payment, gọi POST `/gateway/initiate-b2c`. |
| Frontend | `PaymentResultPage.jsx` | Nhận redirect B2C, gọi `/gateway/callback/vnpay-return` để lấy kết quả. |
| Frontend | `PayInvoicePage.jsx` | Dealer Manager khởi tạo VNPAY cho hóa đơn. |
| Frontend | `DealerPaymentResultPage.jsx` | Trang hiển thị kết quả B2B. |
| Frontend service | `paymentService.js` | Wrapper các REST API payment-service (bao gồm VNPAY). |

---

## 3. Luồng VNPAY B2C (Dealer Staff thu hộ khách hàng)

1. **Khởi tạo** – `PayB2COrderPage.jsx` gọi `POST http://localhost:8080/payments/api/v1/payments/gateway/initiate-b2c` với body:
   ```json
   {
     "orderId": "<uuid-order>",
     "customerId": "<uuid-customer>",
     "totalAmount": 70000000,
     "paymentAmount": 70000000,
     "returnUrl": "http://localhost:5173/payment/result"
   }
   ```
2. **Backend tạo URL** – `VnpayServiceImpl` lưu `Transaction` trạng thái `PENDING`, tạo URL bằng `createPaymentUrl` (HMAC SHA512), trả `{ "url": "https://sandbox..." }`.
3. **Redirect** – Frontend chuyển trình duyệt tới URL VNPAY.
4. **Return** – VNPAY redirect về `PaymentResultPage.jsx` kèm query string; trang này gọi `GET /payments/api/v1/payments/gateway/callback/vnpay-return`.
5. **Xử lý** – `processReturnResult` kiểm tra checksum, `handleCustomerReturnCallback` gắn `gatewayTransactionId`, giữ `PENDING` nếu mã `00/00`, hoặc chuyển `FAILED`.
6. **IPN** – VNPAY gọi `POST /payments/api/v1/payments/gateway/callback/vnpay-ipn`; `handleCustomerGatewayCallback` cập nhật `Transaction` sang `SUCCESS/FAILED` và điều chỉnh `PaymentRecord`.

> UI có thể hiển thị `PENDING` cho tới khi IPN thành công; người dùng nên tải lại lịch sử để thấy `SUCCESS`.

---

## 4. Luồng VNPAY B2B (Dealer Manager thanh toán hóa đơn)

1. **Khởi tạo** – `PayInvoicePage.jsx` gọi `paymentService.initiateDealerInvoiceVnpay(invoiceId)` (POST `/api/v1/payments/dealer/invoices/{invoiceId}/vnpay/initiate`).
2. **Backend** – `DealerPaymentController` xác thực dealerId, load invoice, `VnpayServiceImpl` lưu `DealerTransaction` trạng thái `PENDING_GATEWAY` và trả URL.
3. **Redirect** – Dealer được chuyển sang trang VNPAY để thanh toán.
4. **Return** – VNPAY redirect về `DealerPaymentResultPage.jsx`; trang này gọi `/payments/api/v1/payments/gateway/callback/vnpay-return`.
5. **Xử lý** – `handleDealerReturnCallback` đặt `PENDING_CONFIRMATION` khi mã `00/00`, hoặc `FAILED` nếu ngược lại.
6. **IPN** – `handleDealerGatewayCallback` chuyển `DealerTransaction` sang `SUCCESS`, cập nhật `DealerInvoice.amountPaid`, `DealerInvoice.status` và `DealerDebtRecord`.
7. **EVM Staff** – API `pending-cash-payments` hiển thị cả cash và gateway `PENDING_CONFIRMATION`; staff có thể duyệt nếu cần.

---

## 5. Trình tự tóm tắt

### B2C

```
PayB2COrderPage --POST initiate-b2c--> VnpayGatewayController --> VnpayServiceImpl (Transaction PENDING)
        \
         \--redirect--> VNPAY Sandbox --redirect--> PaymentResultPage --GET vnpay-return--> processReturnResult
                                                                   |
                                                                   \--status PENDING hoặc FAILED (UI)

VNPAY Sandbox --POST vnpay-ipn--> processIpnCallback --> handleCustomerGatewayCallback
                                         \--update Transaction + PaymentRecord (SUCCESS/FAILED)
```

### B2B

```
PayInvoicePage --POST .../vnpay/initiate--> DealerPaymentController --> VnpayServiceImpl (DealerTransaction PENDING_GATEWAY)
        \
         \--redirect--> VNPAY --> DealerPaymentResultPage --GET vnpay-return--> handleDealerReturnCallback (PENDING_CONFIRMATION/FAILED)

VNPAY --POST vnpay-ipn--> processIpnCallback --> handleDealerGatewayCallback
                               \--update DealerTransaction + DealerInvoice + DealerDebtRecord
```

---

## 6. Ví dụ payload/response

### 6.1 Khởi tạo B2C

```http
POST /payments/api/v1/payments/gateway/initiate-b2c HTTP/1.1
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "orderId": "6a837c8d-c10c-4906-b6ff-57d47bdca8da",
  "customerId": "6ee4b731-83a9-4af7-9219-32130c45df06",
  "totalAmount": 70000000,
  "paymentAmount": 70000000,
  "returnUrl": "http://localhost:5173/payment/result"
}
```

**Response**

```json
{
  "url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
}
```

### 6.2 Return API

```json
{
  "success": true,
  "transactionId": "e31ca1dc-223d-46db-8711-d905814596b1",
  "responseCode": "00",
  "transactionStatus": "00",
  "amount": 700000,
  "message": "Thanh toán thành công"
}
```

### 6.3 IPN (server-to-server)

```json
{
  "RspCode": "00",
  "Message": "Confirm Success"
}
```

---

## 7. Ghi chú cấu hình & kiểm thử

- **Env**: `vnpay.*` trong `services/payment-service/src/main/resources/application-*.properties` phải khớp với `.env` của gateway.
- **Gateway whitelist**: Nếu callback bị 401/403 hãy kiểm tra `JwtGlobalFilter.EXCLUDED_PATHS` và `SecurityConfig.pathMatchers`.
- **Frontend URL**: `returnUrl` phải là URL thật của ứng dụng React (`http://localhost:5173/...`).
- **Status mapping**:
  - B2C `Transaction.status`: `PENDING` -> `SUCCESS/FAILED` (IPN). Return chỉ chuyển `FAILED` khi code khác `00`.
  - B2B `DealerTransaction.status`: `PENDING_GATEWAY` -> `PENDING_CONFIRMATION` -> `SUCCESS/FAILED`.
- **Debug**: `PaymentResultPage.jsx` có xử lý fallback parse query param; dùng `console.log` để theo dõi.

---

## 8. Mở rộng / thực hành tốt

1. **Hỗ trợ domain khác**: Thay `returnUrl` bằng domain production; API giữ nguyên.
2. **Retry IPN**: VNPAY sẽ gọi lại nếu `RspCode` != `00`; xử lý idempotent theo `transactionId`.
3. **Logging**: Có thể nâng `VnpayServiceImpl` lên `DEBUG` trong `application.yml` khi cần.
4. **Bảo mật secret**: Lưu `hashSecret` trong property/KeyVault, tránh commit trực tiếp.

---

Tài liệu được lưu tại `VNPAY.md`. Khi cập nhật logic VNPAY (return URL, trạng thái, UI) hãy đồng thời chỉnh sửa file này.
