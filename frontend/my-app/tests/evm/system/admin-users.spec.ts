import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Admin System Management', () => {
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

    test('should manage admin users', async () => {
        await page.goto('http://localhost:5173/evm/admin/system/users');
        await expect(page.locator('h1', { hasText: /Quản lý Người dùng/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });

    test('should view dealer contracts', async () => {
        await page.goto('http://localhost:5173/evm/admin/dealers/contracts');
        await expect(page.locator('h1', { hasText: /Quản Lý Hợp Đồng Đại Lý/i })).toBeVisible();
        await expect(page.locator('table').or(page.locator('text=Không có dữ liệu'))).toBeVisible();
    });

    test('should view catalog promotions', async () => {
         await page.goto('http://localhost:5173/evm/admin/distribution/catalog/promotions');
         await expect(page.locator('h1', { hasText: /Chương Trình Khuyến Mãi/i })).toBeVisible();
    });
});
