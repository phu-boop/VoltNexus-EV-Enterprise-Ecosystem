# Kế hoạch Kiểm Thử Boundary Value Analysis (BVA) - VoltNexus Ecosystem

Dựa trên kết quả quét mã nguồn trong các microservices, tôi đã tổng hợp được các class DTO (Data Transfer Object) có sử dụng các annotations validation định nghĩa ràng buộc biên giới (`@Min`, `@Max`, `@Size`, `@Length`). 

Đây là danh sách chi tiết các điểm cần áp dụng kỹ thuật Phân tích giá trị biên (BVA) và kế hoạch phân công công việc cho 6 thành viên trong đội.

## Quy tắc BVA áp dụng chung
- **Đối với số (`@Min`, `@Max`)**: Test các giá trị `Min-1`, `Min`, `Min+1`, và `Max-1`, `Max`, `Max+1`.
- **Đối với chuỗi (`@Size(min, max)`)**: Test độ dài chuỗi bằng `Min-1`, `Min`, `Min+1` và `Max-1`, `Max`, `Max+1`.

---

## Phân công công việc (6 Thành viên)

### 🧑‍💻 Thành viên 1: Quản lý Hồ sơ & Tài khoản Khách hàng
**Phạm vi:** `user-service`, một phần `customer-service`
**Các DTO cần test BVA:**
1. **`CustomerRegistrationRequest`** (`user-service`)
   - `Password`: Độ dài tối thiểu 8 ký tự (`@Size(min = 8)`). Biên: chuỗi 7, 8, 9 ký tự.
2. **`CustomerRequest`** (`customer-service`)
   - `FirstName`, `LastName`, `Email`: Max 100 ký tự. Biên: 99, 100, 101 ký tự.
   - `Phone`: Max 20 ký tự. Biên: 19, 20, 21.
   - `Address`: Max 500 ký tự.
   - `ID number`: Max 50 ký tự.
   - `Profile ID`: Max 36 ký tự.

### 🧑‍💻 Thành viên 2: Quản lý Trải nghiệm Khách hàng (Lái thử & Đánh giá)
**Phạm vi:** `customer-service` (Test Drive, Reviews)
**Các DTO cần test BVA:**
1. **`PublicTestDriveRequest`** & **`TestDriveRequest`** & **`UpdateTestDriveRequest`**
   - `Duration`: Phải >= 15 và <= 240 phút (`@Min(15)`, `@Max(240)`). Biên: 14, 15, 16 và 239, 240, 241 phút.
   - `Name`: Độ dài từ 2 đến 100 ký tự. Biên độ dài: 1, 2, 3 và 99, 100, 101.
2. **`VehicleReviewRequest`** & **`TestDriveFeedbackRequest`**
   - `Rating`, `Performance`, `Comfort`, `Design`, `Value`: Giá trị từ 1 đến 5 (`@Min(1)`, `@Max(5)`). Biên: 0, 1, 2 và 4, 5, 6.
   - `Title`: Max 200 ký tự.
   - `ReviewText`: Độ dài 10 - 2000 ký tự. Biên độ dài: 9, 10, 11 và 1999, 2000, 2001.
3. **`ChargingStationRequest`**
   - Các trường `Name` (200), `Address` (500), `City`/`Province` (100).

### 🧑‍💻 Thành viên 3: Quản lý Đối tác/Đại lý (Dealer Management)
**Phạm vi:** `dealer-service`
**Các DTO cần test BVA:**
1. **`DealerRequest`**
   - `DealerCode`, `TaxNumber`: Max 50 ký tự.
   - `DealerName`: Max 200 ký tự.
   - `Address`: Max 500 ký tự.
   - `City`, `Region`, `Email`: Max 100 ký tự.
   - `Phone`: Max 20 ký tự.
2. **`DealerContractRequest`**
   - `ContractNumber`: Max 100 ký tự.
   - `ContractStatus`: Max 20 ký tự.

### 🧑‍💻 Thành viên 4: Quản lý Thông tin Sản phẩm (Vehicle Catalog)
**Phạm vi:** `vehicle-service`
**Các DTO cần test BVA:**
1. **`CreateVariantRequest`** & **`UpdateVariantRequest`**
   - `Price`: Không được âm (`@Min(0)`). Biên: -1, 0, 1.
   - `WholesalePrice`: Không được âm (`@Min(0)`). Biên: -1, 0, 1.

### 🧑‍💻 Thành viên 5: Quản lý Kho bãi & Giao dịch (Inventory Logistics)
**Phạm vi:** `inventory-service`
**Các DTO cần test BVA:**
1. **`UpdateReorderLevelRequest`**
   - `ReorderLevel`: Không được âm (`@Min(0)`). Biên: -1, 0, 1.
2. **`TransactionRequestDto`**
   - Số lượng (Quantity) / Tham số giao dịch: Phải >= 1 (`@Min(1)`). Biên: 0, 1, 2.
3. **`CreateTransferRequestDto`**
   - Số lượng điều chuyển: Phải >= 1 (`@Min(1)`). Biên: 0, 1, 2.

### 🧑‍💻 Thành viên 6: Quản lý Bán hàng & Giỏ hàng (Sales & Orders)
**Phạm vi:** `sales-service`, một phần `customer-service`
**Các DTO cần test BVA:**
1. **`CreateB2BOrderRequest`** (`sales-service`)
   - `Quantity` (Số lượng đặt): Phải > 0 (`@Min(1)`). Biên: 0, 1, 2.
2. **`AddToCartRequest`** & **`UpdateCartItemRequest`** (`customer-service`)
   - `Quantity`: Phải >= 1 (`@Min(1)`). Biên: 0, 1, 2.

---
## Các bước thực hiện cho Team
1. Mỗi thành viên xem class DTO thuộc phần mình được phân công để hình dung tham số API tương ứng.
2. Thiết kế Test Cases bằng file Excel hoặc trên hệ thống Test Management (như Jira/Zephyr), trong đó nêu rõ:
   - Tên API/Function
   - Thuộc tính cần test biên
   - Các giá trị test (vd: `Min-1`, `Min`, `Min+1`)
   - Expected Result (Trả về `400 Bad Request` đối với các case vi phạm biên, và `2xx Success` cho case nằm trong biên).
3. Thực thi test bằng Postman hoặc viết Script Automation Test (nếu có yêu cầu).
4. Cập nhật trạng thái và log bug nếu Response trả về không đúng mô tả Validation.
