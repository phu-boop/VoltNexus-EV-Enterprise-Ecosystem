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
2. **`CustomerRequest`** (`customer-service`)

| Test ID                                                                                                                                                              | API/Function             | Thuộc tính (Trường) | Giá trị Test      | Expected Result |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- | ------------------- | --------------- |
| BVA-USR-01                                                                                                                                                           | `POST /users/register` | `Password`            | 7 ký tự (Min-1)   | 400 Bad Request |
| BVA-USR-02                                                                                                                                                           | `POST /users/register` | `Password`            | 8 ký tự (Min)     | 2xx Success     |
| BVA-USR-03                                                                                                                                                           | `POST /users/register` | `Password`            | 9 ký tự (Min+1)   | 2xx Success     |
| BVA-CUS-01                                                                                                                                                           | `POST /customers`      | `FirstName`           | 99 ký tự (Max-1)  | 2xx Success     |
| BVA-CUS-02                                                                                                                                                           | `POST /customers`      | `FirstName`           | 100 ký tự (Max)   | 2xx Success     |
| BVA-CUS-03                                                                                                                                                           | `POST /customers`      | `FirstName`           | 101 ký tự (Max+1) | 400 Bad Request |
| BVA-CUS-04                                                                                                                                                           | `POST /customers`      | `Phone`               | 19 ký tự (Max-1)  | 2xx Success     |
| BVA-CUS-05                                                                                                                                                           | `POST /customers`      | `Phone`               | 20 ký tự (Max)    | 2xx Success     |
| BVA-CUS-06                                                                                                                                                           | `POST /customers`      | `Phone`               | 21 ký tự (Max+1)  | 400 Bad Request |
| *(Các trường khác như LastName (100), Email (100), Address (500), ID number (50), Profile ID (36) thực hiện test tương tự các biên Max-1, Max, Max+1)* |                          |                         |                     |                 |

### 🧑‍💻 Thành viên 2: Quản lý Trải nghiệm Khách hàng (Lái thử & Đánh giá)

**Phạm vi:** `customer-service` (Test Drive, Reviews)
**Các DTO cần test BVA:**

1. **`PublicTestDriveRequest`** & **`TestDriveRequest`**
2. **`VehicleReviewRequest`** & **`ChargingStationRequest`**

| Test ID                                                                               | API/Function          | Thuộc tính (Trường) | Giá trị Test    | Expected Result |
| ------------------------------------------------------------------------------------- | --------------------- | ----------------------- | ----------------- | --------------- |
| BVA-TDR-01                                                                            | `POST /test-drives` | `Duration`            | 14 phút (Min-1)  | 400 Bad Request |
| BVA-TDR-02                                                                            | `POST /test-drives` | `Duration`            | 15 phút (Min)    | 2xx Success     |
| BVA-TDR-03                                                                            | `POST /test-drives` | `Duration`            | 16 phút (Min+1)  | 2xx Success     |
| BVA-TDR-04                                                                            | `POST /test-drives` | `Duration`            | 239 phút (Max-1) | 2xx Success     |
| BVA-TDR-05                                                                            | `POST /test-drives` | `Duration`            | 240 phút (Max)   | 2xx Success     |
| BVA-TDR-06                                                                            | `POST /test-drives` | `Duration`            | 241 phút (Max+1) | 400 Bad Request |
| BVA-REV-01                                                                            | `POST /reviews`     | `Rating`              | 0 (Min-1)         | 400 Bad Request |
| BVA-REV-02                                                                            | `POST /reviews`     | `Rating`              | 1 (Min)           | 2xx Success     |
| BVA-REV-03                                                                            | `POST /reviews`     | `Rating`              | 5 (Max)           | 2xx Success     |
| BVA-REV-04                                                                            | `POST /reviews`     | `Rating`              | 6 (Max+1)         | 400 Bad Request |
| BVA-REV-05                                                                            | `POST /reviews`     | `ReviewText`          | 9 ký tự (Min-1) | 400 Bad Request |
| BVA-REV-06                                                                            | `POST /reviews`     | `ReviewText`          | 10 ký tự (Min)  | 2xx Success     |
| *(ReviewText Max 2000, Name 2-100, Title 200, Address 500 thực hiện tương tự)* |                       |                         |                   |                 |

### 🧑‍💻 Thành viên 3: Quản lý Đối tác/Đại lý (Dealer Management)

**Phạm vi:** `dealer-service`
**Các DTO cần test BVA:** `DealerRequest`, `DealerContractRequest`

| Test ID                                                                                         | API/Function      | Thuộc tính (Trường) | Giá trị Test      | Expected Result |
| ----------------------------------------------------------------------------------------------- | ----------------- | ----------------------- | ------------------- | --------------- |
| BVA-DLR-01                                                                                      | `POST /dealers` | `DealerCode`          | 49 ký tự (Max-1)  | 2xx Success     |
| BVA-DLR-02                                                                                      | `POST /dealers` | `DealerCode`          | 50 ký tự (Max)    | 2xx Success     |
| BVA-DLR-03                                                                                      | `POST /dealers` | `DealerCode`          | 51 ký tự (Max+1)  | 400 Bad Request |
| BVA-DLR-04                                                                                      | `POST /dealers` | `DealerName`          | 199 ký tự (Max-1) | 2xx Success     |
| BVA-DLR-05                                                                                      | `POST /dealers` | `DealerName`          | 200 ký tự (Max)   | 2xx Success     |
| BVA-DLR-06                                                                                      | `POST /dealers` | `DealerName`          | 201 ký tự (Max+1) | 400 Bad Request |
| *(Các file khác như TaxNumber (50), Address (500), ContractNumber (100) test tương tự)* |                   |                         |                     |                 |

### 🧑‍💻 Thành viên 4: Quản lý Thông tin Sản phẩm (Vehicle Catalog)

**Phạm vi:** `vehicle-service`
**Các DTO cần test BVA:** `CreateVariantRequest`, `UpdateVariantRequest`

| Test ID                                          | API/Function       | Thuộc tính (Trường) | Giá trị Test | Expected Result |
| ------------------------------------------------ | ------------------ | ----------------------- | -------------- | --------------- |
| BVA-VEH-01                                       | `POST /variants` | `Price`               | -0.01 (Min-1)  | 400 Bad Request |
| BVA-VEH-02                                       | `POST /variants` | `Price`               | 0 (Min)        | 2xx Success     |
| BVA-VEH-03                                       | `POST /variants` | `Price`               | 0.01 (Min+1)   | 2xx Success     |
| *(WholesalePrice test tương tự với min=0)* |                    |                         |                |                 |

### 🧑‍💻 Thành viên 5: Quản lý Kho bãi & Giao dịch (Inventory Logistics)

**Phạm vi:** `inventory-service`
**Các DTO cần test BVA:** `UpdateReorderLevelRequest`, `TransactionRequestDto`, `CreateTransferRequestDto`

| Test ID    | API/Function                     | Thuộc tính (Trường) | Giá trị Test | Expected Result |
| ---------- | -------------------------------- | ----------------------- | -------------- | --------------- |
| BVA-INV-01 | `POST /inventory/reorder`      | `ReorderLevel`        | -1 (Min-1)     | 400 Bad Request |
| BVA-INV-02 | `POST /inventory/reorder`      | `ReorderLevel`        | 0 (Min)        | 2xx Success     |
| BVA-INV-03 | `POST /inventory/reorder`      | `ReorderLevel`        | 1 (Min+1)      | 2xx Success     |
| BVA-INV-04 | `POST /inventory/transactions` | `Quantity`            | 0 (Min-1)      | 400 Bad Request |
| BVA-INV-05 | `POST /inventory/transactions` | `Quantity`            | 1 (Min)        | 2xx Success     |
| BVA-INV-06 | `POST /inventory/transactions` | `Quantity`            | 2 (Min+1)      | 2xx Success     |

### 🧑‍💻 Thành viên 6: Quản lý Bán hàng & Giỏ hàng (Sales & Orders)

**Phạm vi:** `sales-service`, `customer-service`
**Các DTO cần test BVA:** `CreateB2BOrderRequest`, `AddToCartRequest`

| Test ID    | API/Function         | Thuộc tính (Trường) | Giá trị Test | Expected Result |
| ---------- | -------------------- | ----------------------- | -------------- | --------------- |
| BVA-SAL-01 | `POST /orders/b2b` | `Quantity`            | 0 (Min-1)      | 400 Bad Request |
| BVA-SAL-02 | `POST /orders/b2b` | `Quantity`            | 1 (Min)        | 2xx Success     |
| BVA-SAL-03 | `POST /orders/b2b` | `Quantity`            | 2 (Min+1)      | 2xx Success     |
| BVA-SAL-04 | `POST /cart/items` | `Quantity`            | 0 (Min-1)      | 400 Bad Request |
| BVA-SAL-05 | `POST /cart/items` | `Quantity`            | 1 (Min)        | 2xx Success     |
| BVA-SAL-06 | `POST /cart/items` | `Quantity`            | 2 (Min+1)      | 2xx Success     |

### 🧑‍💻 Thành viên 7: Quản lý Báo cáo & Dữ liệu Phân tích (Reporting)

**Phạm vi:** `reporting-service`
**Các DTO cần test BVA:**

1. **`SalesRecordRequest`** (`reporting-service`)
   - `orderId`: Bắt buộc phải có (`@NotNull`). Biên: null (invalid) vs UUID hợp lệ (valid).
   - `totalAmount`: Không được âm (`@DecimalMin("0.00")`). Biên: -0.01 (invalid), 0.00 (min valid), 0.01 (valid).
   - `dealerName`: Tối đa 200 ký tự (`@Size(max = 200)`). Biên độ dài: 199 (valid), 200 (max valid), 201 (invalid).
   - `modelName`: Tối đa 200 ký tự (`@Size(max = 200)`). Biên độ dài: 199 (valid), 200 (max valid), 201 (invalid).
   - `region`: Tối đa 100 ký tự (`@Size(max = 100)`). Biên độ dài: 99 (valid), 100 (max valid), 101 (invalid).

**File test:** `src/test/java/com/example/reporting_service/bva/SalesRecordRequestBVATest.java`
**Tổng số test cases:** 14 test đơn lẻ + 12 parameterized test = **26 test cases**

| Test ID    | API/Function                | Thuộc tính (Trường) | Giá trị Test      | Expected Result |
| ---------- | --------------------------- | ----------------------- | ------------------- | --------------- |
| BVA-RPT-01 | `POST /api/reports/sales` | `orderId`             | null                | 400 Bad Request |
| BVA-RPT-02 | `POST /api/reports/sales` | `orderId`             | UUID hợp lệ       | 2xx Success     |
| BVA-RPT-03 | `POST /api/reports/sales` | `totalAmount`         | -0.01 (Min-1)       | 400 Bad Request |
| BVA-RPT-04 | `POST /api/reports/sales` | `totalAmount`         | 0.00 (Min)          | 2xx Success     |
| BVA-RPT-05 | `POST /api/reports/sales` | `totalAmount`         | 0.01 (Min+1)        | 2xx Success     |
| BVA-RPT-06 | `POST /api/reports/sales` | `dealerName`          | 199 ký tự (Max-1) | 2xx Success     |
| BVA-RPT-07 | `POST /api/reports/sales` | `dealerName`          | 200 ký tự (Max)   | 2xx Success     |
| BVA-RPT-08 | `POST /api/reports/sales` | `dealerName`          | 201 ký tự (Max+1) | 400 Bad Request |
| BVA-RPT-09 | `POST /api/reports/sales` | `modelName`           | 199 ký tự (Max-1) | 2xx Success     |
| BVA-RPT-10 | `POST /api/reports/sales` | `modelName`           | 200 ký tự (Max)   | 2xx Success     |
| BVA-RPT-11 | `POST /api/reports/sales` | `modelName`           | 201 ký tự (Max+1) | 400 Bad Request |
| BVA-RPT-12 | `POST /api/reports/sales` | `region`              | 99 ký tự (Max-1)  | 2xx Success     |
| BVA-RPT-13 | `POST /api/reports/sales` | `region`              | 100 ký tự (Max)   | 2xx Success     |
| BVA-RPT-14 | `POST /api/reports/sales` | `region`              | 101 ký tự (Max+1) | 400 Bad Request |

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
