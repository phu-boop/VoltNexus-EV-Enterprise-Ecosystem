import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Central Inventory', () => {
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

    test('should display central inventory and stock distribution', async () => {
        await page.goto('http://localhost:5173/evm/admin/distribution/central-inventory');
        await expect(page.locator('h1', { hasText: /Kho Trung Tâm & Điều Phối/i })).toBeVisible();
        await expect(page.locator('text=Tổng tồn kho xe')).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });
});
