import { Page, expect } from '@playwright/test';

/**
 * Helper tái sử dụng cho việc đăng nhập Admin trong tất cả test files.
 * 
 * Flow:
 * 1. Mock Google reCAPTCHA script
 * 2. Navigate đến trang Login
 * 3. Fill email/password
 * 4. Đợi mock captcha callback (1 giây)
 * 5. Click Submit
 * 6. Xử lý SweetAlert popup "Truy cập ngay" (nếu có)
 * 7. Verify đã vào Dashboard
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // 1. Intercept reCAPTCHA script và mock hoàn toàn
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

  // 2. Navigate đến trang Login
  await page.goto('http://localhost:5173/login');

  // 3. Fill credentials
  await page.fill('input[name="email"]', 'admin@gmail.com');
  await page.fill('input[name="password"]', '123123123');

  // 4. Đợi mock captcha callback hoàn thành (500ms delay + React re-render)
  await page.waitForTimeout(1000);

  // 5. Click Submit
  await page.click('button[type="submit"]');

  // 6. Xử lý post-login: SweetAlert popup hoặc redirect trực tiếp
  // Dùng locator.or() - Best Practice từ Playwright docs
  const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
  const dashboardHeading = page.getByRole('heading', { name: 'Bảng Điều Khiển' });

  // Đợi 1 trong 2 điều kiện xuất hiện (tối đa 30s)
  await expect(confirmBtn.or(dashboardHeading)).toBeVisible({ timeout: 30000 });

  // Nếu SweetAlert hiện lên → click "Truy cập ngay" để chuyển trang
  const successPopup = page.locator('.swal2-container', { hasText: 'Đăng nhập thành công' });
  if (await successPopup.isVisible()) {
    await page.getByRole('button', { name: /Truy cập ngay/i }).click();
    await page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 });
  }

  // 7. Kiểm tra chốt chặn: phải vào được Dashboard
  if (!page.url().includes('dashboard')) {
    throw new Error("⚠️ Login thất bại: Không thể vào Dashboard. Kiểm tra backend hoặc credentials.");
  }
}
