import { test, expect, type Page } from '@playwright/test';
import { injectAdminSession } from '../../auth-helper';

test.describe('EVM Feature Management', () => {
    let page: Page;

    test.beforeEach(async ({ page: authenticatedPage }) => {
        page = authenticatedPage;
        await injectAdminSession(page);
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display feature catalog', async () => {
        // Navigate to Feature Management
        await page.goto('http://localhost:5173/evm/admin/products/features');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Kho tính năng/i })).toBeVisible();

        // 2. Verify Stats
        await expect(page.locator('text=Thành phần')).toBeVisible();

        // 3. Verify Table
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th', { hasText: 'Chi tiết tính năng' })).toBeVisible();
        await expect(page.locator('th', { hasText: 'Phân loại' })).toBeVisible();
    });

    test('should open add feature modal', async () => {
        await page.goto('http://localhost:5173/evm/admin/products/features');
        
        await page.getByRole('button', { name: /Khởi tạo ngay/i }).click();
        
        // Verify Modal
        await expect(page.locator('h2', { hasText: /Khởi tạo Tính năng/i })).toBeVisible();
        await expect(page.locator('label', { hasText: 'Tên tính năng' })).toBeVisible();
        
        // Close modal
        await page.getByRole('button', { name: /Hủy/i }).first().click();
    });
});
