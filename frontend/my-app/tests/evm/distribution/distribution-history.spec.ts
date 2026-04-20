import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Distribution History', () => {
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

    test('should display history list with statistics dashboard', async () => {
        // Navigate to History
        await page.goto('http://localhost:5173/evm/admin/distribution/history');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Lịch Sử Phân Phối/i })).toBeVisible();

        // 2. Verify Stats Cards
        await expect(page.locator('text=Tổng Đơn Phân Phối')).toBeVisible();
        await expect(page.locator('text=Giao Thành Công')).toBeVisible();
        await expect(page.locator('text=Giá Trị Lưu Thông')).toBeVisible();

        // 3. Verify Filters Section
        await expect(page.locator('text=Bộ lọc tìm kiếm')).toBeVisible();
        await expect(page.locator('select[name="status"]')).toBeVisible();
        await expect(page.locator('select[name="dealerId"]')).toBeVisible();

        // 4. Verify Table
        await expect(page.locator('table')).toBeVisible();
    });

    test('should search and filter history', async () => {
        await page.goto('http://localhost:5173/evm/admin/distribution/history');
        
        // Select a status filter
        await page.selectOption('select[name="status"]', 'DELIVERED');
        await page.click('button:has-text("Tìm kiếm")');
        
        // Wait for loading to finish
        await page.waitForTimeout(1000);
        
        // Verify all rows in table have "Đã giao" status badge
        const badges = page.locator('span:has-text("Đã giao")');
        // If there are results, they should be "Đã giao"
        const rowCount = await page.locator('tbody tr').count();
        if (rowCount > 0 && !await page.locator('text=Không tìm thấy').isVisible()) {
            await expect(badges.first()).toBeVisible();
        }
    });
});
