import { test, expect } from '@playwright/test';

test.describe('Public Payment Result', () => {

    test('should display success UI when payment is success', async ({ page }) => {
        // Mocking a success redirect from VNPAY
        // Status 00 means success in VNPay
        await page.goto('http://localhost:5173/payment/result?vnp_ResponseCode=00&vnp_TransactionStatus=00&vnp_Amount=10000000000&vnp_TxnRef=ORDER123');

        // 1. Verify Success Status
        await expect(page.locator('h1', { hasText: 'Thanh Toán Thành Công' })).toBeVisible();
        await expect(page.locator('.text-green-500')).toBeVisible(); // Success icon

        // 2. Verify Transaction Details
        await expect(page.locator('text=ORDER123')).toBeVisible();
        
        // 3. Verify Navigation Actions
        await expect(page.getByRole('link', { name: 'Danh sách đơn hàng' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Về trang chủ' })).toBeVisible();
    });

    test('should display failure UI when payment is failed', async ({ page }) => {
        // Status 24 means user cancelled or similar error
        await page.goto('http://localhost:5173/payment/result?vnp_ResponseCode=24&vnp_TransactionStatus=02');

        // 1. Verify Failure Status
        await expect(page.locator('h1', { hasText: 'Thanh Toán Thất Bại' })).toBeVisible();
        await expect(page.locator('.text-red-500')).toBeVisible(); // Error icon

        // 2. Verify Try Again Button
        await expect(page.getByRole('button', { name: 'Thử lại thanh toán' })).toBeVisible();
    });
});
