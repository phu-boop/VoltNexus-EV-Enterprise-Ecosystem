import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Inventory Central', () => {
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
        
        await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display inventory stats and tabs correctly', async () => {
        // Navigate to Inventory Central
        await page.goto('http://localhost:5173/evm/admin/distribution/inventory/central');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: 'Quản Lý Kho Trung Tâm' })).toBeVisible();

        // 2. Verify Stats Cards
        await expect(page.locator('text=Tổng Tồn Kho')).toBeVisible();
        await expect(page.locator('text=Tồn Kho Thấp')).toBeVisible();
        await expect(page.locator('text=Hết Hàng')).toBeVisible();

        // 3. Verify Tabs
        const statusTab = page.getByRole('button', { name: /Trạng Thái Kho/i });
        const historyTab = page.getByRole('button', { name: /Lịch Sử Giao Dịch/i });
        const reportsTab = page.getByRole('button', { name: /Báo Cáo & Cài Đặt/i });

        await expect(statusTab).toBeVisible();
        await expect(historyTab).toBeVisible();
        await expect(reportsTab).toBeVisible();

        // 4. Test Tab Switching
        await historyTab.click();
        await expect(page.locator('text=Lịch sử giao dịch kho')).toBeVisible().or(expect(page.locator('table')).toBeVisible());
    });
});
