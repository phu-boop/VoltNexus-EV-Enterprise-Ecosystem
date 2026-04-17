import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Google reCAPTCHA script
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
    });

    test('ITC_122.2: Truy cập trang Admin khi chưa đăng nhập sẽ redirect về Login', async ({ page }) => {
        // 1. Truy cập trực tiếp trang Admin Dashboard mà không đăng nhập
        await page.goto('http://localhost:5173/evm/admin/dashboard');

        // 2. ProtectedRoute sẽ redirect về trang Login
        await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
    });

    test('Admin Login Happy Path', async ({ page }) => {
        // 1. Vào trang Login
        await page.goto('http://localhost:5173/login');

        // 2. Điền thông tin
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');

        // 3. Đợi mock reCAPTCHA callback
        await page.waitForTimeout(1000);

        // 4. Click Submit
        await page.click('button[type="submit"]');

        // 5. Xử lý kết quả đăng nhập: SweetAlert hoặc redirect trực tiếp
        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        const dashboardHeading = page.getByRole('heading', { name: 'Bảng Điều Khiển' });

        await expect(confirmBtn.or(dashboardHeading)).toBeVisible({ timeout: 30000 });

        // Nếu có SweetAlert popup → click confirm
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // 6. Verify đã vào Dashboard
        await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 15000 });
    });
});
