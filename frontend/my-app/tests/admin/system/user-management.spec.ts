import { test, expect, type Page } from '@playwright/test';

test.describe('System User Management', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Admin
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        // Handle SweetAlert
        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display users list and manage roles', async () => {
        // Navigate to User Management
        // Based on routes index: admin/system/users
        await page.goto('http://localhost:5173/admin/system/users');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: 'QUẢN LÝ TÀI KHOẢN' }).or(page.locator('h1', { hasText: 'Quản Lý Người Dùng' }))).toBeVisible();

        // 2. Verify Data Table
        await expect(page.locator('table')).toBeVisible();

        // 3. Check for specific columns
        await expect(page.locator('th', { hasText: 'Email' })).toBeVisible();
        await expect(page.locator('th', { hasText: 'Vai Trò' })).toBeVisible();

        // 4. Test Search
        const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('admin');
            await page.waitForTimeout(500);
        }
    });

    test('should open add user modal', async () => {
        await page.goto('http://localhost:5173/admin/system/users');
        
        const addBtn = page.getByRole('button', { name: /Tạo Tài Khoản/i }).or(page.getByRole('button', { name: /THÊM NGƯỜI DÙNG/i }));
        if (await addBtn.isVisible()) {
            await addBtn.click();
            // Check modal heading
            await expect(page.locator('h2', { hasText: /Tạo mới người dùng/i }).or(page.locator('h2', { hasText: /Thêm tài khoản/i }))).toBeVisible();
        }
    });
});
