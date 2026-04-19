import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer VNPay Configuration', () => {
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

    test('should display VNPay integration settings', async () => {
        await page.goto('http://localhost:5173/dealer/manager/payments/vnpay-integration');
        await expect(page.locator('h1', { hasText: /Cấu hình VNPay Gateway/i })).toBeVisible();
        await expect(page.locator('text=Trạng thái kết nối')).toBeVisible();
        await expect(page.locator('input[name="vnp_TmnCode"]').or(page.locator('text=TmnCode'))).toBeVisible();
    });
});
