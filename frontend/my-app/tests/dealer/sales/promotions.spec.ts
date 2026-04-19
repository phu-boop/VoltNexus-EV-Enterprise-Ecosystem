import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Sales Promotions', () => {
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

    test('should display active dealer promotions list', async () => {
        await page.goto('http://localhost:5173/dealer/staff/sales/promotions');
        await expect(page.locator('h1', { hasText: /Khuyến Mãi/i })).toBeVisible();
        await expect(page.locator('table').or(page.locator('text=Không có dữ liệu'))).toBeVisible();
    });
});
