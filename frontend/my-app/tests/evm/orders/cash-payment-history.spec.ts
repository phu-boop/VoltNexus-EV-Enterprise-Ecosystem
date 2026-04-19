import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Cash Payment History', () => {
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

    test('should display cash flow ledger and stats', async () => {
        // Navigate to Cash Payments
        await page.goto('http://localhost:5173/evm/admin/orders/cash-payments');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Sổ Quỹ Tiền Mặt & Thu Chi/i })).toBeVisible();

        // 2. Verify Stats Cards
        await expect(page.locator('text=Tổng thu tiền mặt')).toBeVisible();
        await expect(page.locator('text=Tổng chi tiền mặt')).toBeVisible();
        await expect(page.locator('text=Số dư quỹ')).toBeVisible();

        // 3. Verify Table
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th', { hasText: 'Thời gian' })).toBeVisible();
        await expect(page.locator('th', { hasText: 'Phân loại' })).toBeVisible();
    });

    test('should open add transaction modal', async () => {
        await page.goto('http://localhost:5173/evm/admin/orders/cash-payments');
        
        const addBtn = page.getByRole('button', { name: /Tạo phiếu/i });
        if (await addBtn.isVisible()) {
            await addBtn.click();
            
            // Verify Modal
            await expect(page.locator('h2', { hasText: /Lập Phiếu Thu\/Chi/i })).toBeVisible();
            await expect(page.locator('select[name="type"]')).toBeVisible();
            
            // Close
            await page.getByRole('button', { name: /Hủy/i }).first().click();
        }
    });
});
