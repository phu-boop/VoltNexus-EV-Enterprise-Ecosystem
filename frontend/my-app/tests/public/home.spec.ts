import { test, expect } from '@playwright/test';

test.describe('Public HomePage', () => {

    test.beforeEach(async ({ page }) => {
        // No login needed
        await page.goto('/');
    });

    test('should load the public homepage completely', async ({ page }) => {
        // 1. Verify Hero Banner components
        const heroHeading = page.locator('h1').first();
        await expect(heroHeading).toBeVisible({ timeout: 15000 });

        // 3. Verify Vehicle Grid
        // Look for vehicle names from mock data
        await expect(page.locator('text=EVM X5').or(page.locator('h3').first())).toBeVisible();

        // 4. Verify Test Drive Section
        const testDriveSection = page.locator('#test-drive-section');
        await expect(testDriveSection).toBeVisible();
    });

    test('should open vehicle detail modal when clicking a vehicle', async ({ page }) => {
        // Click on the first vehicle card
        const firstVehicle = page.locator('text=EVM X5').first();
        await firstVehicle.click();

        // Verify modal appears (Wait for heading or description)
        await expect(page.locator('text=EVM X5').nth(1)).toBeVisible();
        
        // Verify buttons in modal
        const quoteBtn = page.getByRole('button', { name: /Nhận báo giá/i });
        const testDriveBtn = page.getByRole('button', { name: /Đăng kí lái thử/i });
        await expect(quoteBtn.or(testDriveBtn)).toBeVisible();
    });
});
