import { test, expect, type Page } from '@playwright/test';

test.describe('EVM B2B Orders Management', () => {
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

    test('should display B2B orders list and stats', async () => {
        // Navigate to B2B Orders
        // admin/distribution/orders/b2b
        await page.goto('http://localhost:5173/evm/admin/distribution/orders/b2b');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: 'Quản Lý Đơn Hàng B2B' })).toBeVisible();

        // 2. Verify Stats Dashboard
        await expect(page.locator('text=Tổng Đơn Hàng')).toBeVisible();
        await expect(page.locator('text=Chờ Phê Duyệt')).toBeVisible();
        await expect(page.locator('text=Tổng Doanh Thu')).toBeVisible();

        // 3. Verify Filters
        const statusFilter = page.locator('select');
        await expect(statusFilter).toBeVisible();
        
        // 4. Check table exists
        await expect(page.locator('table').or(page.locator('text=Hệ thống trống'))).toBeVisible();
    });

    test('should allow approving a pending B2B order', async () => {
        await page.goto('http://localhost:5173/evm/admin/distribution/orders/b2b');

        // Locate the first "Duyệt" button (Approve button)
        const approveBtn = page.getByRole('button', { name: /Duyệt/i }).first();
        
        if (await approveBtn.isVisible()) {
            await approveBtn.click();
            
            // Should show confirmation SweetAlert
            await expect(page.locator('text=Xác nhận phê duyệt')).toBeVisible();
            await page.getByRole('button', { name: /Đồng ý/i }).click();
            
            // Verify success toast/message
            await expect(page.locator('text=Thành công')).toBeVisible({ timeout: 10000 });
        }
    });
});
