import { test, expect, type Page } from '@playwright/test';
import { injectAdminSession } from '../../auth-helper';

test.describe('EVM Variant Management', () => {
    let page: Page;

    test.beforeEach(async ({ page: authenticatedPage }) => {
        page = authenticatedPage;
        await injectAdminSession(page);
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display variants list and model sidebar', async () => {
        // Navigate to Variant Management
        await page.goto('http://localhost:5173/evm/admin/products/variants');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Quản lý Phiên bản/i })).toBeVisible();

        // 2. Verify Sidebar and items
        await expect(page.locator('text=Lọc theo mẫu xe')).toBeVisible();
        await expect(page.locator('text=Tất cả mẫu xe')).toBeVisible();

        // 3. Verify Table
        await expect(page.locator('table')).toBeVisible();
        await expect(page.locator('th', { hasText: 'Phiên bản' })).toBeVisible();
        await expect(page.locator('th', { hasText: 'Giá dự kiến' })).toBeVisible();
    });

    test('should search variants', async () => {
        await page.goto('http://localhost:5173/evm/admin/products/variants');
        
        const searchInput = page.locator('input[placeholder*="Lọc phiên bản"]');
        await expect(searchInput).toBeVisible();
        
        await searchInput.fill('LUX');
        await page.waitForTimeout(500);
        
        // Results should contain LUX if present, or show empty
        const emptyState = page.locator('text=Không tìm thấy phiên bản nào');
        await expect(page.locator('table').or(emptyState)).toBeVisible();
    });

    test('should open create variant form', async () => {
        await page.goto('http://localhost:5173/evm/admin/products/variants');
        
        await page.getByRole('button', { name: /Khởi tạo ngay/i }).click();
        
        // Verify Modal
        await expect(page.locator('h2', { hasText: /Thiết lập Phiên bản/i })).toBeVisible();
        await expect(page.locator('label', { hasText: 'Mẫu xe chủ quản' })).toBeVisible();
        
        // Close modal
        await page.getByRole('button', { name: /Hủy/i }).first().click();
    });
});
