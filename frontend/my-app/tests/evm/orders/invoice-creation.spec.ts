import { test, expect, type Page } from '@playwright/test';

test.describe('EVM B2B Invoice Creation', () => {
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

    test('should display B2B orders management and navigate to create invoice', async () => {
        // Navigate to B2B Orders
        await page.goto('http://localhost:5173/evm/admin/orders/b2b');

        // 1. Verify Header
        await expect(page.locator('h3', { hasText: /Danh sách đơn hàng B2B/i })).toBeVisible();

        // 2. Locate a confirmed order
        const createInvoiceBtn = page.getByRole('button', { name: /Xuất hóa đơn/i }).first();
        if (await createInvoiceBtn.isVisible()) {
            await createInvoiceBtn.click();
            
            // Verify Invoice Creation Page
            await expect(page.locator('h1', { hasText: /Tạo Hóa Đơn Cho Đơn Hàng/i })).toBeVisible();
            await expect(page.locator('text=Thông tin hóa đơn')).toBeVisible();
            await expect(page.locator('text=Dự kiến thanh toán')).toBeVisible();
        }
    });

    test('should verify invoice details form', async () => {
        // We go directly to a mocked or specific invoice creation page if possible, 
        // but typically we navigate from the list.
        await page.goto('http://localhost:5173/evm/admin/orders/b2b');
        const createInvoiceBtn = page.getByRole('button', { name: /Xuất hóa đơn/i }).first();
        
        if (await createInvoiceBtn.isVisible()) {
            await createInvoiceBtn.click();
            
            // Checks
            await expect(page.locator('input[disabled]')).toHaveCount({ min: 1 }); // Read-only total amount
            await expect(page.locator('textarea[placeholder*="Ghi chú"]')).toBeVisible();
            await expect(page.getByRole('button', { name: /Xác nhận tạo/i })).toBeVisible();
        }
    });
});
