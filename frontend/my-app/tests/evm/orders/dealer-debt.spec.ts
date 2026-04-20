import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Dealer Debt Management', () => {
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

    test('should display dealer debt list and filters', async () => {
        // Navigate to Dealer Debt
        await page.goto('http://localhost:5173/evm/admin/orders/dealer-debt');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Quản Lý Công Nợ Đại Lý/i })).toBeVisible();

        // 2. Verify Summary Stats
        await expect(page.locator('text=Tổng nợ phải thu')).toBeVisible();
        await expect(page.locator('text=Số đại lý đang nợ')).toBeVisible();

        // 3. Verify Table
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th', { hasText: 'Đại lý' })).toBeVisible();
        await expect(page.locator('th', { hasText: 'Số tiền nợ' })).toBeVisible();
    });

    test('should search for specific dealer debt', async () => {
         await page.goto('http://localhost:5173/evm/admin/orders/dealer-debt');
         
         const searchInput = page.locator('input[placeholder*="Tìm kiếm đại lý"]');
         await searchInput.fill('Dealer A');
         await page.waitForTimeout(500);
         
         // Verify result or empty state
         await expect(page.locator('table').or(page.locator('text=Không có dữ liệu'))).toBeVisible();
    });
});
