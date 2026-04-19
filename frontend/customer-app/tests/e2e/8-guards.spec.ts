import { test, expect } from '@playwright/test';

test.describe('Module 8: Security and Route Guards', () => {

  test('Unauthenticated user is redirected when viewing /cart', async ({ page }) => {
    await page.goto('/cart');
    // Về lý thuyết nếu dùng Component ProtectedRoute, user sẽ bị đá về `/login`
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected when viewing /orders', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('Unauthenticated user is redirected when viewing /my-test-drives', async ({ page }) => {
    await page.goto('/my-test-drives');
    await expect(page).toHaveURL(/\/login/);
  });
});
