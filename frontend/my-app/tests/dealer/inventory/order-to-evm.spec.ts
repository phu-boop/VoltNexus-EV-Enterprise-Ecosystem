import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer B2B Ordering', () => {
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

    test('should allow dealer to create a new B2B order', async () => {
        // Navigate to Order Form
        await page.goto('http://localhost:5173/dealer/manager/inventory/order');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Tạo Đơn Đặt Hàng B2B/i })).toBeVisible();

        // 2. Select a variant
        const variantSelect = page.locator('select');
        await expect(variantSelect).toBeVisible();
        await page.waitForTimeout(1000); // Wait for items to load
        
        const options = await variantSelect.locator('option').count();
        if (options > 1) {
            await variantSelect.selectOption({ index: 1 });
            
            // 3. Add to cart
            await page.getByRole('button', { name: /Thêm vào Giỏ/i }).click();
            
            // 4. Verify in cart
            await expect(page.locator('text=Giỏ hàng Tạm')).toBeVisible();
            await expect(page.locator('text=chi tiết')).toBeVisible();
            
            // 5. Submit order
            await page.getByRole('button', { name: /Gửi Đơn Lên Hãng Ngay/i }).click();
            
            // Verify SweetAlert
            await expect(page.locator('text=Gửi Đơn Đặt Hàng?')).toBeVisible();
            await page.getByRole('button', { name: /Xác nhận gửi/i }).click();
            
            // Success check
            await expect(page.locator('text=Thành công!')).toBeVisible({ timeout: 10000 });
        }
    });

    test('should view dealer order history', async () => {
        await page.goto('http://localhost:5173/dealer/manager/ordervariants/orders');
        await expect(page.locator('h1', { hasText: /Lịch Sử Đặt Hàng/i })).toBeVisible();
        await expect(page.locator('table')).toBeVisible();
    });
});
