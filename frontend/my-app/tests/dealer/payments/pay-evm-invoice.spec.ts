import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Pay EVM Invoice', () => {
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

    test('should display invoices from EVM and pay option', async () => {
        // Navigate to Invoices from EVM
        await page.goto('http://localhost:5173/dealer/manager/payments/invoices');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Hóa Đơn Từ Hãng/i })).toBeVisible();

        // 2. Locate an unpaid invoice
        const payBtn = page.getByRole('button', { name: /Thanh toán/i }).first();
        if (await payBtn.isVisible()) {
            await payBtn.click();
            
            // Verify Payment Selection Page
            await expect(page.locator('h1', { hasText: /Thanh Toán Hóa Đơn/i })).toBeVisible();
            await expect(page.locator('text=Phương thức thanh toán')).toBeVisible();
            
            // Check for VNPay option
            await expect(page.locator('text=VNPay Gateway')).toBeVisible();
        }
    });

    test('should verify payment methods management', async () => {
         await page.goto('http://localhost:5173/dealer/manager/payments/methods');
         
         await expect(page.locator('h1', { hasText: /Quản Lý Phương Thức Thanh Toán/i })).toBeVisible();
         await expect(page.locator('text=Tiền mặt')).toBeVisible();
         await expect(page.locator('text=Chuyển khoản')).toBeVisible();
    });
});
