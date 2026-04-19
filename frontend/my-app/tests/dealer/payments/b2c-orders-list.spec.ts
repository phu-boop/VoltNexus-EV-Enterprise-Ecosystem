import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer B2C Orders', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Dealer Staff
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'dealerstaff@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display B2C orders list with filters', async () => {
        await page.goto('http://localhost:5173/dealer/staff/payments/b2c-orders');
        await expect(page.locator('h1', { hasText: /Danh Sách Đơn Hàng/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });
});
