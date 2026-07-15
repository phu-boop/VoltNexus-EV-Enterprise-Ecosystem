import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page', () => {

    test('should display the 404 page for invalid routes', async ({ page }) => {
        // Go to a random non-existent route
        await page.goto('/random-non-existent-route-12345');
        
        // Assert 404 Not Found UI is visible
        // e.g., await expect(page.getByText('404')).toBeVisible();
    });
});
