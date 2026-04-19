# Hướng dẫn cài đặt Playwright E2E Testing

Tài liệu này hướng dẫn các thành viên trong team cách cài đặt môi trường Playwright để chạy các bài test giao diện (E2E Testing) sau khi lấy (pull) code mới nhất về máy.

## Các bước cài đặt

Playwright hiện đang được cấu hình tại các thư mục ứng dụng Frontend (`frontend/my-app` và `frontend/customer-app`). Bạn cần cài đặt riêng cho thư mục mình làm việc.

### Bước 1: Di Chuyển Đến Thư Mục Dự Án

Mở Terminal hoặc PowerShell từ thư mục gốc của project (VoltNexus) và điều hướng vào thư mục Frontend:

```powershell
# Nếu bạn làm việc trên my-app:
cd frontend/my-app

# Hoặc nếu bạn làm việc trên customer-app:
cd frontend/customer-app
```

### Bước 2: Cài đặt các gói thư viện (Dependencies)

Cài đặt thư viện `@playwright/test` và các thư viện khác được liệt kê trong `package.json`:

```powershell
npm install
```

### Bước 3: Tải Các Trình Duyệt Mô Phỏng (Bắt buộc)

Playwright không sử dụng trình duyệt cài sẵn trên máy bạn mà dùng các phiên bản trình duyệt đặc biệt được thiết kế để test tự động (Chromium, Firefox, WebKit). Để tải chúng về, hãy chạy lệnh sau:

```powershell
npx playwright install --with-deps
```

> **Lưu ý Quan Trọng**: Tham số `--with-deps` đảm bảo máy tính của bạn sẽ cài đặt đầy đủ các thư viện phụ thuộc của hệ điều hành mà trình duyệt yêu cầu. Bắt buộc phải chạy lệnh này để test không bị lỗi.

## Cách Chạy Test

Sau khi cài đặt xong môi trường theo 3 bước trên, bạn có thể chạy test giao diện bằng các lệnh sau:

```powershell
# 1. Chạy tất cả các test ngầm (chỉ in kết quả ra terminal)
npx playwright test

# 2. Chạy test với giao diện người dùng trực quan của Playwright (Rất tiện để Debug)
npx playwright test --ui

docker compose up -d zookeeper kafka redis-db
```
