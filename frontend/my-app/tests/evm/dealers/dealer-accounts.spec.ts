import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Management System', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login
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

    test('should display dealer list and stats correctly', async () => {
        // Navigate to Dealer List
        await page.goto('http://localhost:5173/evm/admin/dealers/list');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: 'Hệ Thống Đại Lý' })).toBeVisible();

        // 2. Verify Stats Cards
        await expect(page.locator('text=Tổng số đại lý')).toBeVisible();
        await expect(page.locator('text=Khu vực bao phủ')).toBeVisible();

        // 3. Verify Action Buttons
        const addBtn = page.getByRole('button', { name: /THÊM ĐẠI LÝ MỚI/i });
        await expect(addBtn).toBeVisible();

        // 4. Test View Switching
        const listBtn = page.locator('button[title="Dạng danh sách"]');
        const cardBtn = page.locator('button[title="Dạng thẻ"]');
        
        await listBtn.click();
        // Check if list view is active (usually by looking for table headers or list-specific elements)
        // await expect(page.locator('table')).toBeVisible();

        await cardBtn.click();
    });

    test('should open add dealer form modal', async () => {
        await page.goto('http://localhost:5173/evm/admin/dealers/list');
        
        const addBtn = page.getByRole('button', { name: /THÊM ĐẠI LÝ MỚI/i });
        await addBtn.click();

        // Verify form appears
        await expect(page.locator('h2', { hasText: /Thêm Đại Lý Mới/i }).or(page.locator('h2', { hasText: /Đăng Ký Đại Lý/i }))).toBeVisible();
        
        // Check for basic form fields
        await expect(page.locator('input[name="dealerName"]').or(page.locator('label', { hasText: 'Tên đại lý' }))).toBeVisible();
        
        // Close form (assuming there's a cancel button or overlay click)
        const cancelBtn = page.getByRole('button', { name: /Hủy/i });
        if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
        }
    });
});
