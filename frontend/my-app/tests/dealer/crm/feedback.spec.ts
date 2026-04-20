import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer CRM Feedback', () => {
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

    test('should display feedback list and statistics', async () => {
        // Navigate to Feedback
        // dealer/manager/feedback
        await page.goto('http://localhost:5173/dealer/manager/feedback');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Quản Lý Phản Hồi/i })).toBeVisible();

        // 2. Verify Stats Section
        const statsBtn = page.getByRole('button', { name: /Xem Thống Kê/i });
        if (await statsBtn.isVisible()) {
            await statsBtn.click();
            await expect(page.locator('h2', { hasText: /Thống kê/i })).toBeVisible();
            await page.goBack();
        }

        // 3. Verify Feedback Table/List
        await expect(page.locator('table').or(page.locator('text=Không có dữ liệu'))).toBeVisible();
    });

    test('should open create feedback form', async () => {
        await page.goto('http://localhost:5173/dealer/manager/feedback/new');
        
        await expect(page.locator('h1', { hasText: /Gửi Phản Hồi Mới/i })).toBeVisible();
        await expect(page.locator('textarea[name="comment"]')).toBeVisible();
    });
});
