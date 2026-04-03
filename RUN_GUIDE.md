# 📋 Hướng Dẫn Chạy VoltNexus EV Enterprise Ecosystem

## 🔴 Các Vấn Đề Phát Hiện & Cách Khắc Phục

### 1. **THIẾU thư mục `config/`**

`docker-compose.yml` yêu cầu các file `.env` trong folder `./config/` nhưng folder này **không tồn tại**.

**Khắc phục:** Tạo folder `config/` và copy các file `.env`:

```powershell
# Tạo folder config
mkdir config

# Copy các file .env từ các services
Copy-Item "services\user-service\src\main\resources\.env" "config\user-service.env"
Copy-Item "services\customer-service\src\main\resources\.env" "config\customer-service.env"
Copy-Item "services\dealer-service\src\main\resources\.env" "config\dealer-service.env"
Copy-Item "services\inventory-service\src\main\resources\.env" "config\inventory-service.env"
Copy-Item "services\payment-service\src\main\resources\.env" "config\payment-service.env"
Copy-Item "services\sales-service\src\main\resources\.env" "config\sales-service.env"
Copy-Item "services\vehicle-service\src\main\resources\.env" "config\vehicle-service.env"
Copy-Item "services\reporting-service\src\main\resources\.env" "config\reporting-service.env"
Copy-Item "services\ai-service\src\main\resources\.env" "config\ai-service.env"
Copy-Item "gateway\src\main\resources\.env" "config\gateway.env"
```

### 2. **Redis Port Mismatch**

- `docker-compose.yml`: Redis mapped là `6380:6379` (host:container)
- Các file `.env`: Sử dụng `SPRING_REDIS_PORT=6379`

**Khắc phục (Local với Docker):** Trong các file `config/*.env`, đổi:

```
SPRING_REDIS_HOST=redis-db   # Thay vì localhost
SPRING_REDIS_PORT=6379
```

**Hoặc (nếu chạy local không dùng Docker):**

```
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6380
```

### 3. **Kafka Bootstrap Servers Không Đồng Nhất**

- `inventory-service`: `http://localhost:9092` (SAI - có `http://` prefix)
- `sales-service`: Có 2 biến khác nhau `localhost:9092` và `localhost:29092`

**Khắc phục:** Sửa trong `config/inventory-service.env`:

```
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092  # Bỏ http://
```

### 4. **Java Version Không Đồng Nhất**

- `common-lib`: Java 17
- Các services khác: Java 21

**Khuyến nghị:** Nâng `common-lib/pom.xml` lên Java 21:

```xml
<properties>
    <java.version>21</java.version>
</properties>
```

### 5. **Thiếu .env cho Frontend**

- `frontend/my-app/` có `.env.production` nhưng thiếu `.env` cho development
- `frontend/customer-app/` không có file `.env`

**Khắc phục:** Tạo file `.env` cho frontend:

**frontend/my-app/.env:**

```
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k
VITE_FIREBASE_AUTH_DOMAIN=eletricvehicl.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eletricvehicl
VITE_FIREBASE_STORAGE_BUCKET=eletricvehicl.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=903235101201
VITE_FIREBASE_APP_ID=1:903235101201:web:e7a6ef46f73d8a086b47b0
VITE_FIREBASE_MEASUREMENT_ID=G-H10W8LJ2ZF
VITE_RECAPTCHA_SITE_KEY=6LdNJz8sAAAAAAs7xEwdNkFpLa1HR7NW_ccDeNG3
VITE_FRONTEND_URL=http://localhost:5173
```

**frontend/customer-app/.env:**

```
VITE_API_BASE_URL=http://localhost:8080
VITE_RECAPTCHA_SITE_KEY=6LdNJz8sAAAAAAs7xEwdNkFpLa1HR7NW_ccDeNG3
```

---

## 🚀 Hướng Dẫn Chạy Project

### Cách 1: Chạy Local (Development)

#### Prerequisites

- Java 21 (JDK)
- Maven 3.9+
- Node.js 18+
- Redis Server
- Apache Kafka + Zookeeper
- MySQL (hoặc sử dụng Aiven Cloud DB đã cấu hình)

#### Bước 1: Khởi động Infrastructure

```powershell
# Chỉ chạy Zookeeper, Kafka, Redis
docker-compose up -d zookeeper kafka redis-db
```

#### Bước 2: Build common-lib

```powershell
cd common-lib
./mvnw clean install -DskipTests
cd ..
```

#### Bước 3: Chạy từng Backend Service (mỗi terminal riêng)

```powershell
# Terminal 1: Gateway (PORT 8080)
cd gateway
./mvnw spring-boot:run

# Terminal 2: User Service (PORT 8081)
cd services/user-service
./mvnw spring-boot:run

# Terminal 3: Customer Service (PORT 8082)
cd services/customer-service
./mvnw spring-boot:run

# Terminal 4: Dealer Service (PORT 8083)
cd services/dealer-service
./mvnw spring-boot:run

# Terminal 5: Inventory Service (PORT 8084)
cd services/inventory-service
./mvnw spring-boot:run

# Terminal 6: Payment Service (PORT 8085)
cd services/payment-service
./mvnw spring-boot:run

# Terminal 7: Sales Service (PORT 8086)
cd services/sales-service
./mvnw spring-boot:run

# Terminal 8: Vehicle Service (PORT 8087)
cd services/vehicle-service
./mvnw spring-boot:run

# Terminal 9: Reporting Service (PORT 8088)
cd services/reporting-service
./mvnw spring-boot:run

# Terminal 10: AI Service (PORT 8500)
cd services/ai-service
./mvnw spring-boot:run
```

#### Bước 4: Chạy Frontend

```powershell
# Terminal 11: Admin/Dealer Portal (PORT 5173)
cd frontend/my-app
npm install
npm run dev

# Terminal 12: Customer Portal (PORT 5174)
cd frontend/customer-app
npm install
npm run dev -- --port 5174
```

---

### Cách 2: Chạy với Docker Compose (Production-like)

#### Bước 1: Tạo folder config và copy .env files

```powershell
# Chạy script để tạo config folder
mkdir -p config

# Copy tất cả .env files
Copy-Item "services\user-service\src\main\resources\.env" "config\user-service.env"
Copy-Item "services\customer-service\src\main\resources\.env" "config\customer-service.env"
Copy-Item "services\dealer-service\src\main\resources\.env" "config\dealer-service.env"
Copy-Item "services\inventory-service\src\main\resources\.env" "config\inventory-service.env"
Copy-Item "services\payment-service\src\main\resources\.env" "config\payment-service.env"
Copy-Item "services\sales-service\src\main\resources\.env" "config\sales-service.env"
Copy-Item "services\vehicle-service\src\main\resources\.env" "config\vehicle-service.env"
Copy-Item "services\reporting-service\src\main\resources\.env" "config\reporting-service.env"
Copy-Item "services\ai-service\src\main\resources\.env" "config\ai-service.env"
Copy-Item "gateway\src\main\resources\.env" "config\gateway.env"
```

#### Bước 2: Sửa các config files cho Docker network

Trong mỗi file `config/*.env`, đổi các địa chỉ localhost sang tên Docker service:

```
# Thay đổi
SPRING_REDIS_HOST=redis-db
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
USER_SERVICE_URI=http://user-service:8081
CUSTOMER_SERVICE_URI=http://customer-service:8082
# ... tương tự cho các services khác
```

#### Bước 3: Build và chạy

```powershell
# Build tất cả images
docker-compose build

# Chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả
docker-compose down
```

---

## 🧪 Kiểm Tra & Test

### Health Check APIs

Mỗi service có endpoint health check:

```
GET http://localhost:8080/actuator/health   # Gateway
GET http://localhost:8081/actuator/health   # User Service
GET http://localhost:8082/actuator/health   # Customer Service
GET http://localhost:8083/actuator/health   # Dealer Service
GET http://localhost:8084/actuator/health   # Inventory Service
GET http://localhost:8085/actuator/health   # Payment Service
GET http://localhost:8086/actuator/health   # Sales Service
GET http://localhost:8087/actuator/health   # Vehicle Service
GET http://localhost:8088/actuator/health   # Reporting Service
GET http://localhost:8500/actuator/health   # AI Service
```

### Chạy Unit Tests

```powershell
# Test từng service
cd services/user-service
./mvnw test

cd services/customer-service
./mvnw test

# Test gateway
cd gateway
./mvnw test
```

### Kiểm tra kết nối Database

Các databases đang sử dụng Aiven Cloud, kiểm tra connectivity:

```powershell
# Sử dụng MySQL client
mysql -h evmclient12-vmscommerce1.l.aivencloud.com -P 27504 -u avnadmin -p
```

### Kiểm tra Kafka

```powershell
# Liệt kê topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Tạo consumer để test
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic inventory_events --from-beginning
```

### Kiểm tra Redis

```powershell
# Kết nối Redis CLI
docker exec -it redis-db redis-cli
> PING
# Response: PONG
> KEYS *
```

---

## 📊 Port Summary

| Service             | Port                | URL                   |
| ------------------- | ------------------- | --------------------- |
| Gateway             | 8080                | http://localhost:8080 |
| User Service        | 8081                | http://localhost:8081 |
| Customer Service    | 8082                | http://localhost:8082 |
| Dealer Service      | 8083                | http://localhost:8083 |
| Inventory Service   | 8084                | http://localhost:8084 |
| Payment Service     | 8085                | http://localhost:8085 |
| Sales Service       | 8086                | http://localhost:8086 |
| Vehicle Service     | 8087                | http://localhost:8087 |
| Reporting Service   | 8088                | http://localhost:8088 |
| AI Service          | 8500                | http://localhost:8500 |
| Frontend (Dealer)   | 5173                | http://localhost:5173 |
| Frontend (Customer) | 5174                | http://localhost:5174 |
| Kafka               | 9092/29092          | localhost:9092        |
| Redis               | 6379 (Docker: 6380) | localhost:6379        |
| Zookeeper           | 2181                | localhost:2181        |
| RedisInsight        | 5540                | http://localhost:5540 |

---

## ⚠️ Troubleshooting

### Lỗi "common-lib not found"

```powershell
cd common-lib
./mvnw clean install -DskipTests
```

### Lỗi "Connection refused" với Redis

- Kiểm tra Redis đang chạy: `docker ps | findstr redis`
- Kiểm tra port mapping: local=6380, container=6379

### Lỗi Kafka connection

- Chạy Zookeeper trước: `docker-compose up -d zookeeper`
- Đợi 10s rồi chạy Kafka: `docker-compose up -d kafka`

### Lỗi Database connection

- Databases đang dùng Aiven Cloud, kiểm tra internet connectivity
- Kiểm tra SSL certificate requirements

### Services không start được

1. Kiểm tra file `.env` có đúng format không
2. Kiểm tra tất cả required environment variables
3. Xem logs: `./mvnw spring-boot:run` hoặc `docker-compose logs <service-name>`

---

## 📁 Cấu Trúc .env files cần thiết

```
VoltNexus-EV-Enterprise-Ecosystem/
├── config/                          # CẦN TẠO
│   ├── gateway.env
│   ├── user-service.env
│   ├── customer-service.env
│   ├── dealer-service.env
│   ├── inventory-service.env
│   ├── payment-service.env
│   ├── sales-service.env
│   ├── vehicle-service.env
│   ├── reporting-service.env
│   └── ai-service.env
├── frontend/
│   ├── my-app/.env                  # CẦN TẠO
│   └── customer-app/.env            # CẦN TẠO
```
