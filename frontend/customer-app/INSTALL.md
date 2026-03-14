# Hướng Dẫn Cài Đặt Customer Frontend

## Bước 1: Cài đặt Dependencies

```bash
cd frontend/customer-app
npm install --legacy-peer-deps
```

**Lưu ý:** Sử dụng `--legacy-peer-deps` để tránh lỗi conflict giữa React 18 và React DOM.

## Bước 2: Cấu hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env`:
- `VITE_API_BASE_URL`: URL của Gateway (mặc định: http://localhost:8080)
- `VITE_RECAPTCHA_SITE_KEY`: Google reCAPTCHA site key

## Bước 3: Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5174`

## Bước 4: Build cho Production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `dist/`

## Troubleshooting

### Lỗi dependency conflict
Nếu gặp lỗi khi cài đặt, sử dụng:
```bash
npm install --legacy-peer-deps
```

### Lỗi kết nối API
Kiểm tra:
1. Gateway đang chạy tại port 8080
2. CORS đã được cấu hình đúng trong Gateway
3. `VITE_API_BASE_URL` trong `.env` đúng

### Lỗi reCAPTCHA
Đảm bảo đã cấu hình `VITE_RECAPTCHA_SITE_KEY` trong `.env`

