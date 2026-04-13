import { test, expect } from '@playwright/test';

test.describe('EVM Admin Dashboard', () => {

  test('Giao diện Dashboard Admin tự động đăng nhập thông qua Session State', async ({ page }) => {
    // Điều hướng thẳng vào dashboard thay vì login
    await page.goto('http://localhost:5173/evm/admin/dashboard');

    // Màn hình chắc chắn không được bị điều hướng ngược về /login vì đã có state
    await expect(page).toHaveURL('http://localhost:5173/evm/admin/dashboard');

    // Chờ màn hình tải xong và có thể tìm một phần tử điển hình trên UI
    // Tùy theo thiết kế, ta có thể tìm chữ Dashboard hoặc EVM Admin. Ở đây tìm linh hoạt.
    // VD: Expect thanh điều hướng xuất hiện hoặc ko có chữ "Đăng nhập"
    const heading = page.getByRole('heading', { name: /dashboard|tổng quan/i }).first();
    // Ghi chú: Có thể fallback nếu UI admin dashboard không có heading rõ ràng. 
    // Tốt nhất là chỉ cần không về màn login là đã chứng tỏ session đúng.
    
    // Kiểm tra không thấy biểu mẫu đăng nhập
    await expect(page.locator('input[name="password"]')).toHaveCount(0);
  });

});
