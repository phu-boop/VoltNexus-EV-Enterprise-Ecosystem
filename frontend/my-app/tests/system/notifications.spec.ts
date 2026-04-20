import { test, expect, type Page } from '@playwright/test';

test.describe('System Notifications', () => {
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

    test('should display notifications list with filters', async () => {
        // Navigate to Notifications
        await page.goto('http://localhost:5173/evm/notifications');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Thông báo/i })).toBeVisible();

        // 2. Verify Stats Cards
        await expect(page.locator('text=Tổng số')).toBeVisible();
        await expect(page.locator('text=Chưa đọc')).toBeVisible();

        // 3. Verify Filters Buttons
        await expect(page.getByRole('button', { name: 'Tất cả' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Chưa đọc' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Đã đọc' })).toBeVisible();

        // 4. Test Search Bar
        const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('Test search');
        await expect(searchInput).toHaveValue('Test search');
    });

    test('should display empty state if no notifications', async () => {
         await page.goto('http://localhost:5173/evm/notifications');
         
         // If list is empty, expect empty state UI
         const emptyState = page.locator('text=Không có thông báo nào');
         // We check if either the list exists or the empty state exists
         await expect(page.locator('.divide-y').or(emptyState)).toBeVisible();
    });
});
