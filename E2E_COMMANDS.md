# 🚀 Lịch trình & Lệnh Chạy Playwright E2E Test (VoltNexus)

Tài liệu này cung cấp các lệnh copy-paste để chạy kiểm thử tự động tùy theo phân hệ, kết nối thẳng vào hệ thống **Dashboard Report** mà chúng ta đã setup bằng file `scripts/run-e2e.js`.

---

## 1. Cú pháp cơ bản
Để chạy test, luôn sử dụng lệnh sau tại thư mục gốc của dự án:
```bash
node scripts/run-e2e.js <đường_dẫn_folder_test>
```
*Sau khi test chạy xong, hãy mở file `e2e-report/index.html` trong trình duyệt để xem kết quả!*

---

## 2. Lệnh chi tiết cho Phân hệ Admin Hãng (EVM)
*(Yêu cầu bật Dịch vụ Core + Các Service đi kèm tuỳ luồng test)*

### Catalog & Phân phối (Kho)
```bash
# Test Catalog & Sản phẩm (Cần Vehicle-Service)
node scripts/run-e2e.js tests/evm/catalog

# Test Phân phối (Cần Inventory, Vehicle-Service)
node scripts/run-e2e.js tests/evm/distribution

# Test Kho trung tâm (Cần Inventory, Vehicle-Service)
node scripts/run-e2e.js tests/evm/inventory
```

### Đơn hàng & Đại lý
```bash
# Test Đơn hàng B2B & Tài chính (Cần Sales, Inventory-Service)
node scripts/run-e2e.js tests/evm/orders

# Test Quản lý Đại lý (Cần Dealer-Service)
node scripts/run-e2e.js tests/evm/dealers
```

### Báo cáo
```bash
# Test Báo cáo EVM (Cần Reporting, Sales-Service)
node scripts/run-e2e.js tests/evm/reports
```

---

## 3. Lệnh chi tiết cho Phân hệ Đại lý (Dealer)
*(Yêu cầu bật Dịch vụ Core + Các Service đi kèm tuỳ luồng test)*

### Kho & CRM
```bash
# Test Kho & Nhập hàng của Đại lý (Cần Inventory, Sales-Service)
node scripts/run-e2e.js tests/dealer/inventory

# Test Khách hàng & CRM (Cần Sales, Customer-Service)
node scripts/run-e2e.js tests/dealer/crm
```

### Bán hàng & Thanh toán
```bash
# Test Bán hàng (Cần Sales, Customer-Service)
node scripts/run-e2e.js tests/dealer/sales

# Test Thanh toán / VNPay (Cần Payment, Sales-Service)
node scripts/run-e2e.js tests/dealer/payments
```

---

## 4. Lệnh chi tiết cho Setup & Public (Khách vãng lai)
*(Yêu cầu bật Dịch vụ Core + Vehicle-Service tùy luồng)*

### Tự động Thiết lập (Setup)
Khởi tạo session (trạng thái đăng nhập) tự động cho Admin / Dealer trước khi chạy các test khác.
```bash
node scripts/run-e2e.js tests/auth-setup
```

### Public & Khách vãng lai
Các luồng người dùng bên ngoài trang chủ (không cần đăng nhập).
```bash
node scripts/run-e2e.js tests/public
```

---

## 5. Chạy Toàn Bộ (Full Regression) & Smoke Test

Nếu bạn muốn test toàn bộ một nhánh phân hệ trước khi release:

```bash
# Chạy TOÀN BỘ luồng của Admin Hãng
node scripts/run-e2e.js tests/evm

# Chạy TOÀN BỘ luồng của Đại Lý
node scripts/run-e2e.js tests/dealer

# Chạy nhanh Smoke Test để kiểm tra sự sống còn của hệ thống (Pulse Check)
node scripts/run-e2e.js tests/e2e/itc/smoke
```

---
**💡 Mẹo QA:** Nếu có lỗi, trình duyệt ảo có thể nhảy lên, hoặc bạn cứ đợi lệnh chạy xong rối xem kỹ log Screenshot/Trace-viewer được lưu trữ sẵn trong `e2e-report/index.html`.
