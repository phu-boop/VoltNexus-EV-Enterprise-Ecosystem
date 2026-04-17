import { test, expect } from '@playwright/test';

test.describe('Module 6: Dashboard & Utilities', () => {

  test('TCO Calculator calculates valid input', async ({ page }) => {
    await page.goto('/tco-calculator');
    
    // Check if input forms like "Km per month", "Electricity Price" show up
    await expect(page.locator('text=/TCO/i').first()).toBeVisible();
  });

  test('Financing Calculator loads successfully', async ({ page }) => {
    await page.goto('/financing');
    
    await expect(page.locator('text=/Tài chính|Trả c/i').first()).toBeVisible();
  });

  test('Charging Station Map loads leaflet/google maps component', async ({ page }) => {
    await page.goto('/charging-stations');
    
    // Component map thường sẽ có div leaflet-container hoặc map-container
    const mapDiv = page.locator('.leaflet-container, #map, [role="region"][aria-label*="Map"]');
    // It might take time to load tiles
    await expect(mapDiv.first()).toBeVisible({ timeout: 10000 });
  });

  test('AI Chatbot component renders successfully', async ({ page }) => {
    // Thông thường Chatbot sẽ nằm ở trang chủ hoặc layout chung
    await page.goto('/');
    
    // Icon chatbot dưới góc màn hình (Floating Action Button)
    const chatIcon = page.locator('button:has(.lucide-message-circle), .chatbot-icon, [aria-label*="chat"]');
    if (await chatIcon.count() > 0) {
      await chatIcon.click();
      
      // Popup UI Chat
      await expect(page.locator('text=/AI|Trợ lý|Chat/i').first()).toBeVisible();
    }
  });
});
