import { test, expect } from '@playwright/test';

test.describe('Chức năng Đăng nhập (Login)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page using baseURL
    await page.goto('/login');
  });

  test('TC1: Giao diện Login tải đúng các trường nhập liệu', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Đăng nhập' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]', { hasText: 'Đăng nhập' })).toBeVisible();
  });

  test('TC2: Hiển thị lỗi nếu không xác nhận reCAPTCHA', async ({ page }) => {
    await page.locator('input[name="email"]').fill('admin@gmail.com');
    await page.locator('input[name="password"]').fill('123123123');
    await page.locator('button[type="submit"]', { hasText: 'Đăng nhập' }).click();
    
    // Kiểm tra thông báo lỗi
    const alertMessage = page.locator('text=Vui lòng xác nhận reCAPTCHA');
    await expect(alertMessage).toBeVisible();
  });

  test('TC3: Tính năng Ẩn/Hiện mật khẩu hoạt động chính xác', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('secret123');
    
    // Ban đầu input phải là ẩn mật khẩu (password)
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Locate the eye button by traversing up to the common container
    const eyeButton = passwordInput.locator('..').locator('button').first();
    
    // Force click to bypass any animation or overlapping issue (which caused the stability timeout)
    await eyeButton.click({ force: true });

    // Verify password becomes visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back to hidden state
    await eyeButton.click({ force: true });
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC4: Điều hướng đến trang Quên Mật Khẩu', async ({ page }) => {
    await page.locator('a', { hasText: 'Quên mật khẩu?' }).click();
    // Đảm bảo trình duyệt chuyển đến đường dẫn /reset-password
    await expect(page).toHaveURL(/.*reset-password/);
  });

  test('TC5: Điều hướng Quay về trang chủ', async ({ page }) => {
    await page.locator('a', { hasText: 'Quay về trang chủ' }).click();
    // Đảm bảo trình duyệt chuyển đến thư mục gốc
    await expect(page).toHaveURL('http://localhost:5173/');
  });

});
