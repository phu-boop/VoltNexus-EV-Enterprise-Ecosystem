import { test, expect } from '@playwright/test';
import { injectAdminSession, injectDealerSession } from '../../auth-helper';

test.describe('EVM & Dealer Promotions', () => {
    test('should display EVM catalog promotions', async ({ page }) => {
        await injectAdminSession(page);
        await page.goto('http://localhost:5173/evm/admin/distribution/catalog/promotions');
        await expect(page.locator('h1', { hasText: /Chương Trình Khuyến Mãi/i })).toBeVisible();
    });

    test('should display dealer sales promotions', async ({ page }) => {
        await injectDealerSession(page);
        await page.goto('http://localhost:5173/dealer/staff/sales/promotions');
        await expect(page.locator('h1', { hasText: /Khuyến Mãi/i })).toBeVisible();
    });
});
