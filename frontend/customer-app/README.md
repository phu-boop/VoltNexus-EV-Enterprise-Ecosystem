# Customer Frontend - VinPhust B2C Portal

Frontend riêng biệt dành cho khách hàng phổ thông (B2C), chạy trên port 5174.

## Cài đặt

```bash
cd frontend/customer-app
npm install
```

## Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5174`

## Cấu trúc

```
customer-app/
├── src/
│   ├── auth/           # Authentication context & provider
│   ├── components/     # Reusable components (Header, Footer)
│   ├── features/       # Feature modules (sẽ phát triển)
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API services
│   └── utils/          # Utility functions
```

## Environment Variables

Tạo file `.env` với các biến sau:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Tính năng hiện tại

- ✅ Đăng ký khách hàng mới
- ✅ Đăng nhập với role CUSTOMER
- ✅ Layout cơ bản với Header và Footer
- ✅ Protected routes

## Tính năng sẽ phát triển

- [ ] Danh mục xe điện
- [ ] Chi tiết sản phẩm
- [ ] Đặt hàng B2C
- [ ] Quản lý đơn hàng
- [ ] Thanh toán
- [ ] Đặt lịch lái thử
- [ ] Hồ sơ khách hàng

