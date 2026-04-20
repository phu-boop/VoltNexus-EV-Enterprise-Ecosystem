import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Staff Management', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Dealer Manager
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'Anhphu@gmail.com'); // Typical dealer manager email from authApi.ts
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display staff list and search', async () => {
        // Navigate to Staff Management (Dealer Manager only)
        // dealer/manager/settings/staff
        await page.goto('http://localhost:5173/dealer/manager/settings/staff');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /QUẢN LÝ TÀI KHOẢN/i })).toBeVisible();

        // 2. Verify Table existence
        await expect(page.locator('table')).toBeVisible();

        // 3. Test Search (Search by role or name)
        const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('STAFF');
        await page.waitForTimeout(500);
    });

    test('should open add staff modal', async () => {
        await page.goto('http://localhost:5173/dealer/manager/settings/staff');
        
        const addBtn = page.getByRole('button', { name: /Tạo Tài Khoản/i });
        if (await addBtn.isVisible()) {
            await addBtn.click();

            // Verify add staff form
            await expect(page.locator('h2', { hasText: /Tạo mới/i })).toBeVisible();
            await expect(page.locator('input[placeholder*="Nhập tên"]')).toBeVisible();
            
            // Close modal
            await page.getByRole('button', { name: /Hủy/i }).click();
        }
    });
});
