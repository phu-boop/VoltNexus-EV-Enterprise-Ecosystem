# Báo Cáo Kịch Bản Kiểm Thử Tự Động (Playwright E2E Testing)

Tài liệu này tổng hợp các kịch bản kiểm thử (Test Scenarios) được triển khai trong dự án **VoltNexus EV Enterprise Ecosystem** sử dụng framework Playwright.

---

## 1. Cấu Trúc Tổng Quan (Test Projects)

Hệ thống kiểm thử được chia thành 5 Project chính tương ứng với các phân quyền và mục đích khác nhau:

| Project Name         | Đối Tượng Kiểm Thử | Mục Đích                                                                          |
| :------------------- | :----------------------- | :----------------------------------------------------------------------------------- |
| **setup**      | Authentication           | Tự động đăng nhập và lưu trạng thái (Storage State) cho các test sau.     |
| **public**     | Khách vãng lai         | Kiểm tra trang chủ, giao diện đăng nhập và các thông tin công khai.        |
| **e2e-admin**  | EVM Admin/Staff          | Kiểm tra toàn bộ luồng quản trị của hãng xe (EVM).                           |
| **e2e-dealer** | Dealer Manager/Staff     | Kiểm tra luồng nghiệp vụ tại Đại lý và chăm sóc khách hàng.             |
| **e2e-itc**    | Integrated Flows         | Kiểm tra các luồng tích hợp xuyên suốt (End-to-End) giữa các microservices. |

---

## 2. Chi Tiết Các Kịch Bản Kiểm Thử

### A. Nhóm Quản Trị Hãng Xe (E2E Admin - EVM)

Kiểm tra các tính năng cốt lõi của hệ thống quản trị trung tâm.

* **Quản lý danh mục (Catalog):** Thêm mới xe, cấu hình phiên bản (Variant), quản lý tính năng.
* **Phân phối (Distribution):** Quản lý tồn kho trung tâm, thực hiện lệnh cấp phát xe cho các đại lý.
* **Quản lý Đại lý:** Xem danh sách đại lý, quản lý tài khoản đại lý và hợp đồng B2B.
* **Báo cáo & AI:** Xem biểu đồ doanh số thời gian thực, báo cáo tồn kho khu vực và chạy dự báo sản xuất bằng AI.

### B. Nhóm Nghiệp Vụ Đại Lý (E2E Dealer)

Kiểm tra các hoạt động tương tác với khách hàng và vận hành tại đại lý.

* **Quản lý Khách hàng (CRM):** Tạo hồ sơ khách hàng, quản lý lịch lái thử (Test Drive).
* **Bán hàng (Sales):** Tạo báo giá (Quotation), quản lý danh sách hợp đồng B2C.
* **Thanh toán:** Quản lý hóa đơn từ hãng, thực hiện thanh toán công nợ và tích hợp VNPAY.
* **Kho đại lý:** Kiểm tra xe có sẵn, đặt đơn hàng B2B nhập xe từ hãng.

### C. Luồng Tích Hợp (Integrated Test Cases - ITC)

Các kịch bản quan trọng nhất thể hiện sự phối hợp của hệ thống Microservices.

1. **Luồng cung ứng:** Admin cấp phát xe -> Dealer nhận xe vào kho -> Dealer cập nhật trạng thái kho.
2. **Luồng bán hàng:** Khách hàng đăng ký lái thử -> Dealer chốt báo giá -> Tạo hợp đồng -> Thanh toán.
3. **Luồng tài chính:** Dealer tạo đơn hàng B2B -> Admin duyệt đơn & tạo Invoice -> Dealer thanh toán qua VNPAY -> Hệ thống cập nhật công nợ.

---

## 3. Bản Đồ Dịch Vụ Cần Thiết (Service Mapping)

Để các kịch bản chạy thành công, các Microservices tương ứng phải được kích hoạt:

| Kịch Bản              | Services Cần Thiết                                                              |
| :---------------------- | :-------------------------------------------------------------------------------- |
| **Login / Setup** | `user-service`, `gateway`                                                     |
| **Admin Flow**    | `vehicle-service`, `inventory-service`, `reporting-service`, `ai-service` |
| **Dealer Flow**   | `customer-service`, `dealer-service`, `sales-service`, `payment-service`  |
| **Full ITC**      | **Tất cả các Microservices** + `Kafka` + `Redis`                     |

---

## 4. Hệ thống Báo cáo Tự động (GitHub Pages Portal)

Dự án đã được cấu hình hệ thống **Report Portal** chuyên nghiệp. Mọi kết quả kiểm thử sẽ được tập trung tại một địa chỉ duy nhất.

* **Địa chỉ Portal:** `https://<tên-github>.github.io/VoltNexus-EV-Enterprise-Ecosystem/`
* **Các thành phần:**
  * **API Report (Newman):** Tự động cập nhật qua workflow `CI/CD Enterprise Pipeline`.
  * **E2E Report (Playwright):** Tự động cập nhật qua workflow `Playwright E2E Report`.

---

## 5. Hướng dẫn chạy & Chia sẻ

Bạn có 2 cách để vận hành và chia sẻ kết quả:

### Cách A: Chạy tự động trên GitHub (Ưu tiên)

1. Chỉ cần **Push code** vào thư mục `frontend/my-app`.
2. Truy cập tab **Actions** trên GitHub để theo dõi quá trình chạy.
3. Sau khi hoàn thành, báo cáo sẽ tự động hiển thị trên link **GitHub Pages**.

### Cách B: Chạy thủ công tại máy Local

* **Chạy toàn bộ & nén Zip:** `npm run test:full`
* **Xem báo cáo ngay:** `npm run test:report`
* **Chia sẻ nhanh:** Gửi file `playwright-report.zip` được tạo ra trong thư mục `frontend/my-app`.
* [https://phu-boop.github.io/VoltNexus-EV-Enterprise-Ecosystem/](https://phu-boop.github.io/VoltNexus-EV-Enterprise-Ecosystem/)
* **npx gh**-**pages **-**d playwright**-**report **--**dest e2e**-**report **--**add** app

---

*Tài liệu được cập nhật hệ thống Automation v2 - VoltNexus Project.*
