import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Financial Management', () => {
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

    test('should manage B2C customer debt', async () => {
        await page.goto('http://localhost:5173/dealer/manager/payments/b2c-debt');
        await expect(page.locator('h1', { hasText: /Quản Lý Nợ Khách Hàng/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });

    test('should check VNPay integration status', async () => {
        await page.goto('http://localhost:5173/dealer/manager/payments/vnpay-integration');
        await expect(page.locator('h1', { hasText: /Cấu hình VNPay Gateway/i })).toBeVisible();
        await expect(page.locator('text=Trạng thái kết nối')).toBeVisible();
    });
});
