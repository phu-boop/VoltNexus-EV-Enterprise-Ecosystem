# BVA Member 2 - All In One

## Phạm vi
- Service: customer-service
- Mục tiêu: BVA cho Test Drive, Review, Charging Station
- Chuẩn đang dùng: 7-case BVA (bao gồm dirty test cases)
  - Min-
  - Min
  - Min+
  - Nom
  - Max-
  - Max
  - Max+

## File chính cần dùng
- Postman collection: BVA_MEMBER2_POSTMAN_COLLECTION.json
- Java test: services/customer-service/src/test/java/com/ev/customer_service/bva/CustomerServiceBVATest.java

## Endpoint chuẩn đang dùng (khớp Postman + Java test)
- Public test drive: /customers/api/test-drives/public
- Create review: /customers/api/reviews
- Charging stations: /customers/api/charging-stations
- Submit feedback: /customers/api/test-drives/{id}/feedback

## Environment variables (Postman)
- BASE_URL = http://localhost:8082
- ACCESS_TOKEN = Bearer token role phù hợp
- TEST_DRIVE_ID = id lịch hẹn đã có

## Cách chạy Postman
1. Import BVA_MEMBER2_POSTMAN_COLLECTION.json
2. Set các biến môi trường ở trên
3. Chạy theo folder:
  - PublicTestDriveRequest BVA Tests (7-case)
  - VehicleReviewRequest BVA Tests (7-case)
  - ChargingStationRequest BVA Tests (7-case)
  - TestDriveRequest BVA Tests (7-case)
  - UpdateTestDriveRequest BVA Tests (7-case)
  - TestDriveFeedbackRequest BVA Tests (7-case)

## Cách chạy Java test
```powershell
cd services/customer-service
mvn -Dtest=CustomerServiceBVATest test
```

## Lưu ý quyền truy cập
- PublicTestDriveRequest: public
- VehicleReviewRequest: cần role CUSTOMER
- TestDriveRequest / UpdateTestDriveRequest: cần role DEALER_STAFF
- TestDriveFeedbackRequest: cần DEALER_STAFF hoặc DEALER_MANAGER
- ChargingStationRequest (POST): cần ADMIN/EVM_STAFF/DEALER_MANAGER

## Mapping BVA 7-case (kèm dirty)
- customerName (2..100): 1, 2, 3, 50, 99, 100, 101
- rating (1..5): 0, 1, 2, 3, 4, 5, 6
- feedbackRating (1..5): 0, 1, 2, 3, 4, 5, 6
- durationMinutes (quy ước test [15..240]): 14, 15, 16, 120, 239, 240, 241
- latitude (-90..90): -91, -90, -89, 0, 89, 90, 91

## Trạng thái
- Đã đồng bộ route giữa Postman và Java test
- Đã dùng port 8082
- Đã gom tài liệu còn 1 file này
