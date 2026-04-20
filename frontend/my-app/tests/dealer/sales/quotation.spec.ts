import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Sales & Quotations', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Dealer Staff
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'dealerstaff@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display quotations list and analytics', async () => {
        await page.goto('http://localhost:5173/dealer/staff/sales/quotations');
        await expect(page.locator('h1', { hasText: /Quản lý Báo giá/i })).toBeVisible();
        await expect(page.locator('table').or(page.locator('text=Không có dữ liệu'))).toBeVisible();
    });

    test('should open new quotation form', async () => {
        await page.goto('http://localhost:5173/dealer/staff/sales/quotations/new');
        await expect(page.locator('h1', { hasText: /Tạo Báo Giá Mới/i })).toBeVisible();
        await expect(page.locator('text=Thông tin khách hàng')).toBeVisible();
    });

    test('should view dealer promotions', async () => {
         await page.goto('http://localhost:5173/dealer/staff/sales/promotions');
         await expect(page.locator('h1', { hasText: /Khuyến Mãi & Ưu Đãi/i })).toBeVisible();
    });
});
