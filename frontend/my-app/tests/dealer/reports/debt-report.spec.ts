import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Debt Report', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Dealer Manager
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'Anhphu@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display debt report analytics cards and charts', async () => {
        // Navigate to Debt Report
        // dealer/manager/reports/model
        await page.goto('http://localhost:5173/dealer/manager/reports/model');

        // 1. Verify Header
        await expect(page.locator('h3', { hasText: /Phân Tích Tài Chính & Công Nợ/i })).toBeVisible();

        // 2. Verify KPI Cards
        await expect(page.locator('text=Tổng nợ phải trả hãng (B2B)')).toBeVisible();
        await expect(page.locator('text=Tổng khách còn nợ (B2C)')).toBeVisible();

        // 3. Verify Canvas elements (Charts)
        const charts = page.locator('canvas');
        await expect(charts).toHaveCount({ min: 1 });

        // 4. Verify Export Excel Button
        const exportBtn = page.getByRole('button', { name: /Xuất Excel/i });
        await expect(exportBtn).toBeVisible();
    });

    test('should display top debt lists', async () => {
        await page.goto('http://localhost:5173/dealer/manager/reports/model');
        
        // B2B Chart area
        await expect(page.locator('text=Top 5 Hóa đơn nợ lớn nhất')).toBeVisible();
        
        // B2C List area
        await expect(page.locator('text=Top 5 Khách hàng còn nợ nhiều nhất')).toBeVisible();
    });
});
