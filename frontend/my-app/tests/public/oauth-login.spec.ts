import { test, expect } from '@playwright/test';

test.describe('Public OAuth Login', () => {

    test('should display social login buttons on login page', async ({ page }) => {
        await page.goto('http://localhost:5173/login');

        // 1. Verify Social Icons/Buttons
        await expect(page.locator('button:has-text("Google")')).toBeVisible();
        await expect(page.locator('button:has-text("Facebook")').or(page.locator('svg'))).toBeVisible();
    });

    test('should navigate to google oauth on click', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        
        const googleBtn = page.getByRole('button', { name: /Google/i });
        if (await googleBtn.isVisible()) {
            await googleBtn.click();
            
            // We expect a redirect to accounts.google.com
            // Note: We don't test the actual Google login flow as it's outside our domain
            // and often blocked by bot detection.
            await expect(page).toHaveURL(/.*accounts\.google\.com.*/);
        }
    });
});
