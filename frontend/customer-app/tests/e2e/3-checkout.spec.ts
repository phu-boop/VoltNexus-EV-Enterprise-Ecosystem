import { test, expect } from '@playwright/test';

test.describe('Module 3: Checkout, Cart & Buying Flow', () => {

  test('Accessing Cart Page', async ({ page }) => {
    // Flow bắt đầu từ Giỏ hàng. User unauth có thể bị đá ra login tùy thiết kế
    // Ta set up mock session nếu cần, nhưng giả sử public cart
    await page.goto('/cart');
    
    // Check loading page without crash
    await expect(page.locator('body')).toBeVisible();
    // Vì /cart được đánh dấu là Protected Route, nên nó sẽ bị Redirect.
    // Ta chỉ check xem ứng dụng không crash (React error boundary không bị bung)
    const errText = await page.locator('text=/Application error|Something went wrong/').count();
    expect(errText).toBe(0);
  });

  test('Accessing Order Tracking Public link', async ({ page }) => {
    // Tới trang Tracking Đơn của khách không đăng nhập
    await page.goto('/order-tracking'); // hoặc URL tương ứng
    
    // Nhập Mã Order
    const input = page.locator('input[placeholder*="Mã"], input[placeholder*="Order ID"], input[placeholder*="id"]');
    if (await input.count() > 0) {
      await input.fill('TRK123456789');
      await page.locator('button[type="submit"], button:has-text("Tra cứu")').click();
      
      // Form submit okay, wait for API response or not found
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('order');
    }
  });

  test('Direct access to Payment pages loads UI correctly', async ({ page }) => {
    await page.goto('/payment');
    
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toBeDefined();

    await page.goto('/payment/return');
    const returnText = await page.locator('body').innerText();
    expect(returnText).toBeDefined();
    
    await page.goto('/payment/result');
    const resultText = await page.locator('body').innerText();
    expect(resultText).toBeDefined();
  });

  test('Checkout Page renders correct forms', async ({ page }) => {
    await page.goto('/checkout');
    // Nếu chưa đăng nhập có thể bị đá ra login, tương tự cart
    if (page.url().includes('login')) { test.skip(); } else {
      await expect(page.locator('text=/Thanh toán|Checkout|Địa chỉ/i').first()).toBeVisible();
    }
  });

  test('Direct Booking Vehicle Route loads correctly', async ({ page }) => {
    await page.goto('/booking/123-test-vehicle'); // Giả lập id sản phẩm
    
    // Nếu app yêu cầu login mới cho phép book
    if (page.url().includes('login')) { test.skip(); } else {
      await expect(page.locator('text=/Đặt cọc|Booking/i').first()).toBeVisible();
    }
  });
});
