import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('CRM - Quản lý Khách Hàng (Dealer Manager)', () => {

  test.beforeEach(async ({ page }) => {
    // Inject SessionStorage từ file đã lưu trong dealer.setup.ts
    if (fs.existsSync('playwright/.auth/dealer-session.json')) {
        const sessionData = JSON.parse(fs.readFileSync('playwright/.auth/dealer-session.json', 'utf8'));
        await page.addInitScript((data) => {
            Object.entries(data).forEach(([key, value]) => {
                sessionStorage.setItem(key, value as string);
            });
        }, sessionData);
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `test-results/failure-${testInfo.title.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
      console.log(`Current URL: ${page.url()}`);
      if (page.url() !== 'about:blank') {
          try {
              const sessionData = await page.evaluate(() => JSON.stringify(sessionStorage));
              console.log(`Session Storage: ${sessionData}`);
          } catch (e: any) {
              console.log(`Failed to read session storage: ${e.message}`);
          }
      }
    }
  });

  // Chuỗi ngẫu nhiên để tránh việc trùng lặp Email (Vì backend có thế bắt unique email)
  const uniqueKey = Date.now().toString().slice(-6);
  const testEmail = `khachhang_${uniqueKey}@gmail.com`;

  test('Tạo mới một Khách Hàng thành công', async ({ page }) => {
    // 1. Phải tải trang Thêm mới
    await page.goto('http://localhost:5173/dealer/manager/customers/create');
    
    // Đảm bảo không bị văng ra trang login (Nghĩa là Session State của Dealer hoạt động)
    await expect(page).toHaveURL(/.*\/customers\/create$/);
    await expect(page.getByRole('heading', { name: 'Thêm Khách Hàng Mới' })).toBeVisible();

    // 2. Điền Form Thông Tin Cơ Bản
    await page.fill('input[name="firstName"]', 'Nguyễn');
    await page.fill('input[name="lastName"]', `Văn Test ${uniqueKey}`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '0901234567');
    await page.fill('input[name="idNumber"]', `079090${uniqueKey}`);
    
    // Chọn loại khách hàng
    await page.selectOption('select[name="customerType"]', 'INDIVIDUAL');

    // 3. Địa chỉ
    await page.fill('textarea[name="address"]', '123 Đường Test, Quận T, Thành phố Demo');

    // 4. Nhấn nút Lưu Khách Hàng
    const submitBtn = page.getByRole('button', { name: /Lưu Khách Hàng/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Kiểm tra thông báo Toast
    const toast = page.locator('.Toastify__toast-body', { hasText: 'thành công' });
    await expect(toast).toBeVisible({ timeout: 10000 });

    // 6. Kiểm tra trình duyệt tự động điều hướng sang trang danh sách
    await expect(page).toHaveURL(/.*\/customers\/list$/, { timeout: 10000 });

    // 7. Ở trang danh sách, kiểm tra xem khách hàng vừa tạo có xuất hiện trên màn hình không
    // (Lưu ý: API có thể mất một chút thời gian để render list)
    const newCustomerEntry = page.locator('td', { hasText: testEmail });
    await expect(newCustomerEntry.first()).toBeVisible({ timeout: 10000 });
  });

  test('Hiển thị lỗi Validation khi bỏ trống trường bắt buộc', async ({ page }) => {
    await page.goto('http://localhost:5173/dealer/manager/customers/create');
    
    // Bỏ trống toàn bộ, nhấn nút Lưu
    await page.getByRole('button', { name: /Lưu Khách Hàng/i }).click();

    // Kiểm tra UI hiển thị lỗi validation dưới input
    await expect(page.getByText('Họ là bắt buộc')).toBeVisible();
    await expect(page.getByText('Tên là bắt buộc')).toBeVisible();
    await expect(page.getByText('Email là bắt buộc')).toBeVisible();
  });

});
