import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Inventory Stock View', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Dealer Manager
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'Anhphu@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        // Handle SweetAlert
        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
        
        await expect(page).toHaveURL(/.*\/dealer\/dashboard/);
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display dealer stock items and stats correctly', async () => {
        // Navigate to Dealer Inventory Stock
        await page.goto('http://localhost:5173/dealer/manager/inventory/stock');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: 'Kho Xe Của Tôi' })).toBeVisible();

        // 2. Verify Stats
        await expect(page.locator('text=Tổng xe tại kho')).toBeVisible().or(expect(page.locator('text=Tổng Tồn Kho')).toBeVisible());

        // 3. Verify Search Bar
        const searchInput = page.locator('input[placeholder*="Tìm theo tên xe"]');
        await expect(searchInput).toBeVisible();

        // 4. Verify Table/List
        // If data exists, check for table headers or first item
        const tableHeading = page.locator('th', { hasText: 'Thông tin sản phẩm' });
        const emptyState = page.locator('text=Kho của bạn đang trống');
        
        await expect(tableHeading.or(emptyState)).toBeVisible();
    });

    test('should open reorder modal when clicking edit', async ({ page }) => {
        // This test requires data to be present
        // If the table is visible, try to click the first edit button
        await page.goto('http://localhost:5173/dealer/manager/inventory/stock');
        
        const firstEditBtn = page.locator('button[title="Cập nhật ngưỡng đặt lại"]').first();
        if (await firstEditBtn.isVisible()) {
            await firstEditBtn.click();
            // Verify modal
            await expect(page.locator('h2', { hasText: /Cập nhật ngưỡng/i }).or(page.locator('h3', { hasText: /Ngưỡng đặt lại/i }))).toBeVisible();
        }
    });
});
