import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Dealer Contracts', () => {
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

    test('should manage dealer contracts', async () => {
        await page.goto('http://localhost:5173/evm/admin/dealers/contracts');
        await expect(page.locator('h1', { hasText: /Hợp Đồng Hệ Thống/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });
});
