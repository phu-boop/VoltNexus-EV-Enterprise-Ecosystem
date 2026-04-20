import { test, expect, type Page } from '@playwright/test';

test.describe('Dealer Dashboards', () => {
    let page: Page;

    // We check both roles
    test('should display dealer manager dashboard', async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'Anhphu@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();

        await expect(page.locator('h1', { hasText: /Chào mừng trở lại/i })).toBeVisible();
        await expect(page.locator('text=Chỉ số hiệu suất')).toBeVisible();
        await expect(page.locator('canvas')).toHaveCount({ min: 1 });
        await page.close();
    });

    test('should display dealer staff dashboard', async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'dealerstaff@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();

        await expect(page.locator('h1', { hasText: /Chào mừng trở lại/i })).toBeVisible();
        await expect(page.locator('text=Báo giá mới')).toBeVisible();
        await page.close();
    });
});
