import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Reports & Network', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Admin
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display EVM sales reports and charts', async () => {
        await page.goto('http://localhost:5173/evm/admin/reports/sales');
        await expect(page.locator('h3', { hasText: /Thống Kê Doanh Số/i })).toBeVisible();
        await expect(page.locator('canvas')).toHaveCount({ min: 1 });
    });

    test('should display dealer network map and list', async () => {
        await page.goto('http://localhost:5173/evm/admin/dealers/manage');
        await expect(page.locator('h1', { hasText: /Quản Lý Mạng Lưới Đại Lý/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });
});
