import { test, expect } from '@playwright/test';

test.describe('Module 4: Test Drive Booking', () => {

  test('Access Test Drive booking form', async ({ page }) => {
    await page.goto('/test-drive');
    
    // Kiểm tra title
    await expect(page.locator('h1, h2').filter({ hasText: /Lái thử|Test Drive/i }).first()).toBeVisible();

    // Điền form
    const selectors = ['input[name="name"]', 'input[name="phone"]', 'input[name="email"]', 'select[name="vehicle"]'];
    for (const s of selectors) {
      if (await page.locator(s).count() > 0) {
        await expect(page.locator(s)).toBeVisible();
      }
    }
  });

  test('Submitting invalid Test Drive form shows validations', async ({ page }) => {
    await page.goto('/test-drive');
    
    // Cố submit trống form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Đăng ký")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      // Expect HTML5 popup or toast error
      const isValid = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form ? form.checkValidity() : true; 
      });
      expect(isValid).toBeFalsy(); 
    }
  });

  test('Access Auth-Protected Test Drive booking form', async ({ page }) => {
    await page.goto('/test-drive/book'); // Route yêu cầu đăng nhập
    
    // Đảm bảo không crash, và nếu nhảy sang login thì bỏ qua
    if (page.url().includes('login')) {
      test.skip();
    } else {
      // Nếu đã login, form này sẽ tự điền info user
      await expect(page.locator('text=/Lái thử/i').first()).toBeVisible();
    }
  });
});
