import { test, expect, type Page } from '@playwright/test';

test.describe('System Profile Settings', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        // Handle SweetAlert
        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display user profile form with correct sections', async () => {
        // Navigate to Profile
        await page.goto('http://localhost:5173/evm/profile');

        // 1. Verify Header
        await expect(page.locator('h2', { hasText: 'Hồ sơ cá nhân' })).toBeVisible();

        // 2. Verify Sections exist
        await expect(page.locator('text=Thông tin cơ bản')).toBeVisible();
        await expect(page.locator('text=Thông tin liên hệ')).toBeVisible();
        await expect(page.locator('text=Địa chỉ')).toBeVisible();

        // 3. Verify specific fields (Read-only email)
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toBeDisabled().or(expect(emailInput).toHaveAttribute('readonly', ''));

        // 4. Verify System Metrics Sidebar
        await expect(page.locator('text=System Metrics')).toBeVisible();
        await expect(page.locator('text=Trạng thái tài khoản')).toBeVisible();
    });

    test('should validate basic info update', async () => {
        await page.goto('http://localhost:5173/evm/profile');
        
        const fullNameInput = page.locator('input[name="fullName"]');
        await expect(fullNameInput).toBeVisible();
        
        // Test clear validation
        await fullNameInput.clear();
        await page.getByRole('button', { name: /Cập nhật tài khoản/i }).click();
        
        await expect(page.locator('text=Họ và tên là bắt buộc')).toBeVisible();
    });
});
