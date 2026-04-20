import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Staff Dashboard', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as EVM Staff
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'staff@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display staff dashboard with task metrics', async () => {
        // Navigate to Dashboard
        await page.goto('http://localhost:5173/evm/staff/dashboard');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Chào mừng trở lại/i })).toBeVisible();

        // 2. Verify Metrics
        await expect(page.locator('text=Đơn hàng chờ duyệt')).toBeVisible();
        await expect(page.locator('text=Xe sắp xuất kho')).toBeVisible();
        
        // 3. Verify Quick Access
        await expect(page.locator('text=Lối tắt nghiệp vụ')).toBeVisible();
    });
});
