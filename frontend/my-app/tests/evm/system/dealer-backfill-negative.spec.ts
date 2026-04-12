import { test, expect } from '@playwright/test';

test.describe('Function 109: backfillDealerCache - Phân quyền (Negative Test)', () => {

  // Giả lập Đăng nhập bằng tài khoản Staff (Không có quyền Admin)
  test.beforeEach(async ({ page }) => {
    // Intercept Google reCAPTCHA
    await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.grecaptcha = {
            ready: function(cb) { cb() },
            render: function(element, options) {
              if (options.callback) {
                setTimeout(() => options.callback('mock-captcha-token'), 500);
              }
              return 0; 
            },
            reset: function() {},
            execute: function() { return Promise.resolve('mock-captcha-token') },
            getResponse: function() { return 'mock-captcha-token' }
          };
        `
      });
    });

    // Truy cập trang Login
    await page.goto('http://localhost:5173/login'); 
    
    // Sử dụng tài khoản Staff thay vì Admin
    await page.fill('input[name="email"]', 'StafffEVM@gmail.com');
    await page.fill('input[name="password"]', '123123123'); 
    
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    
    // Chờ thông báo Đăng nhập diễn ra
    await Promise.race([
      page.waitForSelector('text=Connection refused', { timeout: 10000, state: 'visible' }).catch(() => {}),
      page.waitForSelector('.swal2-container', { timeout: 10000, state: 'visible' })
    ]);

    // Bấm nút "Truy cập ngay" nếu đăng nhập thành công
    const successPopup = page.locator('.swal2-container', { hasText: 'Đăng nhập thành công' });
    if (await successPopup.isVisible()) {
      await page.getByRole('button', { name: /Truy cập ngay/i }).click();
      // Chờ Web chuyển trang (Với tài khoản Staff, có thể không nhảy vào dashboard mà nhảy vào /dealer)
      await page.waitForTimeout(2000); // Đợi routing ổn định
    }
  });

  test('ITC_5.109.2 Test backfill dealers without permission (Kiểm tra chặn quyền Staff)', async ({ page }) => {
    
    // 1. Cố tình xâm nhập trái phép vào trang dành cho Admin bằng đường dẫn trực tiếp
    await page.goto('http://localhost:5173/evm/admin/system/data-backfill');
    
    // 2. Lắng nghe phản ứng của Hệ thống Bảo mật (ProtectedRoute.jsx)
    // Front-end sẽ chặn lại và bật lên bảng Cảnh báo Không có quyền!
    const errorPopup = page.locator('.swal2-container', { hasText: 'Không có quyền' });
    await expect(errorPopup).toBeVisible({ timeout: 5000 });
    
    // Kiểm tra xem Nội dung cảnh báo có ghi rõ lý do "Bạn không có quyền truy cập trang này!" không
    await expect(errorPopup.locator('.swal2-html-container')).toContainText('Bạn không có quyền truy cập trang này');

    // 3. User bấm OK để xác nhận lỗi
    await page.getByRole('button', { name: 'OK' }).click();

    // 4. Kiểm tra xem User có bị đuổi cổ khỏi trang System/Data-backfill và ném về Dashboard (hoặc /dealer) không
    await page.waitForTimeout(1000); // Đợi hiệu ứng chuyển trang
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('data-backfill');
  });

});
