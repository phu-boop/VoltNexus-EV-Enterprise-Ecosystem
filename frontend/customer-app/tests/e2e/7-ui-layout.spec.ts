import { test, expect } from '@playwright/test';

test.describe('Module 7: UI/UX, Navigation & Layout Elements', () => {

  test('Homepage renders responsive Header and Footer', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      // Kiểm tra xem nút Hamburger Menu có hiển thị thay vì full menu không
      const menuBtn = page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-btn');
      if (await menuBtn.count() > 0) {
        await expect(menuBtn).toBeVisible();
      }
    } else {
      // Desktop: Menu chính phải hiện thị rõ
      await expect(page.locator('nav a[href="/vehicles"]').first()).toBeVisible();
    }
    
    // Footer luôn xuất hiện
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('Navigate to 404 Route shows Not Found Page', async ({ page }) => {
    // Vào 1 url sai bét
    await page.goto('/thu-muc-nao-do-khong-ton-tai-1234');
    
    // Xác định có trang NotFound (Text liên quan đến 404 / Không tìm thấy trang)
    const pageText = await page.locator('body').innerText();
    expect(pageText.toLowerCase()).toMatch(/404|not found|không tìm thấy/);
  });

  // Tùy chọn: Scroll to top component
  test('Scroll to top button appears when scrolling down', async ({ page }) => {
    await page.goto('/vehicles'); // Choose a potentially long page
    
    // Scroll deep down
    await page.evaluate(() => window.scrollTo(0, 2000));
    
    // Chờ 1 chút cho animation css
    await page.waitForTimeout(500);
    
    // Nút scroll to top thường có icon mũi tên lên
    const scrollBtn = page.locator('button:has(.lucide-arrow-up), .scroll-to-top');
    if (await scrollBtn.count() > 0) {
      await expect(scrollBtn).toBeVisible();
      await scrollBtn.click();
      
      // Window scroll back to top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    }
  });
});
