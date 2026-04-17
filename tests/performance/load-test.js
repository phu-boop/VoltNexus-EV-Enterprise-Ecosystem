import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Cấu hình kịch bản (Scenario)
export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Tăng dần lên 20 người dùng trong 30s
        { duration: '1m', target: 50 },  // Giữ mức 50 người dùng trong 1 phút
        { duration: '20s', target: 0 },  // Giảm về 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // Tỉ lệ lỗi phải dưới 1%
        http_req_duration: ['p(95)<500'], // 95% số request phải phản hồi dưới 500ms
    },
};

// 2. Định nghĩa các cấu hình môi trường
const BASE_URL = 'http://host.docker.internal:8080'; // Trỏ về máy host qua Gateway
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJwcm9maWxlSWQiOiI5NTQwMzllNi04OWViLTQxZjQtOGQ1NC0wMmFhMjFhYmM4N2YiLCJ1c2VySWQiOiI0ODc1NWVmMy1lNTFlLTQwOWItYTI5NC03NDg2YmJiYzMzZGYiLCJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE3NzYzMzIzNTAsImV4cCI6MTc3NjMzNTk1MH0.IMm-LL5uPwSY8haxv4gtgX2s3p3P8YIGaOYJUDw_stE'; // token của bạn

const headers = {
    headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
    },
};

export default function () {
    // Kịch bản: Người dùng truy cập hệ thống
    // http://localhost:8080/vehicles/vehicle-catalog/variants/all-for-backfill
    // Bước 1: Kiểm tra Health Check của Gateway
    let healthRes = http.get(`${BASE_URL}/actuator/health`);
    check(healthRes, {
        'Gateway is UP': (r) => r.status === 200,
    });

    sleep(1);

    // Bước 2: Lấy danh sách xe (Vehicle Service)
    let vehicleRes = http.get(`${BASE_URL}/vehicles/vehicle-catalog/variants/all-for-backfill`, headers);
    check(vehicleRes, {
        'Get vehicles success': (r) => r.status === 200,
        'Response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(2);

    // Bước 3: Mô phỏng xem chi tiết đơn hàng (Sales Service)
    // Giả lập ID ngẫu nhiên hoặc cố định để test tải DB
    //http://localhost:8080/sales/api/v1/sales-orders/b2c
    let orderRes = http.get(`${BASE_URL}/sales/api/v1/sales-orders/b2c`, headers);
    check(orderRes, {
        'Get recent orders success': (r) => r.status === 200 || r.status === 401, // 401 nếu chưa login cũng chấp nhận vì đang test tải network/gateway
    });

    sleep(1);
}
