# Bản đồ Toàn diện: Kịch bản Test & Microservices (Bản chuẩn)

Để chạy thành công toàn bộ hoặc từng phần của bộ test Playwright, bạn cần khởi chạy cụm dịch vụ Core và các dịch vụ nghiệp vụ tương ứng.

> [!IMPORTANT]
> **Cụm dịch vụ Core (Bắt buộc cho mọi bài test):**
> - **Gateway**: Cổng giao tiếp chính.
> - **User-Service**: Xử lý đăng nhập và phân quyền.
> - **Frontend**: Ứng dụng React (`http://localhost:5173`).

---

## 1. Phân hệ Admin Hãng (EVM)

| Nhóm Test | File Cụ thể | Microservices cần bật | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Catalog & Sản phẩm** | `evm/catalog/*.spec.ts` | `vehicle-service` | Quản lý Model, Variant, Features, Promotions |
| **Phân phối & Kho** | `evm/distribution/*.spec.ts`<br>`evm/inventory/*.spec.ts` | `inventory-service`, `vehicle-service` | Tồn kho trung tâm, Phân bổ xe, Lịch sử phân phối |
| **Đơn hàng & Tài chính** | `evm/orders/*.spec.ts` | `sales-service`, `inventory-service` | Đơn B2B, Hóa đơn, Nợ đại lý, Phương thức thanh toán, Sổ quỹ |
| **Quản lý Đại lý** | `evm/dealers/*.spec.ts` | `dealer-service` | Mạng lưới đại lý, Tài khoản đại lý, Hợp đồng |
| **Báo cáo & Phân tích** | `evm/reports/*.spec.ts` | `reporting-service`, `sales-service` | Doanh số, Dự báo, Báo cáo tồn kho |
| **Hệ thống & Dashboard** | `evm/system/*.spec.ts`<br>`evm/staff/*.spec.ts`<br>`evm/admin/*.spec.ts` | `user-service`, `vehicle-service` | Quản lý user, Backfill dữ liệu, Dashboard tổng |

---

## 2. Phân hệ Đại lý (Dealer)

| Nhóm Test | File Cụ thể | Microservices cần bật | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Kho & Nhập hàng** | `dealer/inventory/*.spec.ts` | `inventory-service`, `sales-service` | Xem tồn kho, Đặt hàng lên Hãng (B2B) |
| **Bán hàng & Khách hàng** | `dealer/sales/*.spec.ts`<br>`dealer/crm/*.spec.ts` | `sales-service`, `customer-service` | Báo giá, Hợp đồng B2C, CRM, Test drive, Phản hồi |
| **Tài chính & Thanh toán** | `dealer/payments/*.spec.ts`<br>`dealer/reports/debt-report.spec.ts` | `payment-service`, `sales-service` | Thu nợ khách lẻ, Trả nợ Hãng, VNPay, Báo cáo nợ |
| **Nhân sự & Dashboard** | `dealer/system/staff-management.spec.ts`<br>`dealer/dashboard/*.spec.ts` | `user-service` | Quản lý nhân viên, KPI, Dashboard |

---

## 3. Các thành phần Kỹ thuật & Smoke Tests

| Nhóm Test | File Cụ thể | Ghi chú |
| :--- | :--- | :--- |
| **Smoke Tests (ITC)** | `e2e/itc/smoke/*.spec.ts` | Kiểm tra nhanh khả năng truy cập API và Auth cơ bản |
| **Dữ liệu & Đồng bộ** | `admin/backfill.spec.ts`<br>`admin/sync.spec.ts` | Các script dành cho dev để đồng bộ cache/dữ liệu |
| **Tự động Setup** | `auth-setup/*.setup.ts` | Khởi tạo session đăng nhập tự động cho Admin/Dealer |

---

## 4. Bảng Tra cứu Nhanh theo Dịch vụ (Quick Search)

- **Chỉ bật `Vehicle-Service`**: Chạy được `public/home.spec.ts`, `evm/catalog/*.spec.ts`.
- **Chỉ bật `Sales-Service`**: Chạy được `evm/orders/*.spec.ts`, `dealer/sales/*.spec.ts`.
- **Chỉ bật `Inventory-Service`**: Chạy được `evm/distribution/*.spec.ts`, `dealer/inventory/stock-view.spec.ts`.
- **Chỉ bật `Customer-Service`**: Chạy được `dealer/crm/*.spec.ts`.
- **Chỉ bật `Payment-Service`**: Chạy được `dealer/payments/vnpay-integration.spec.ts`.

---

> [!TIP]
> **Chạy test nhanh cho một thư mục cụ thể:**
> ```bash
> npx playwright test tests/dealer/sales --headed
> ```
