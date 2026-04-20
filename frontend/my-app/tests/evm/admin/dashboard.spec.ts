import { test, expect } from '@playwright/test';

test.describe('EVM Admin Dashboard', () => {

  test.beforeEach(async ({ page, request }) => {
    // Bước 1: Gọi thẳng API Backend — KHÔNG mở trang Login!
    // Tránh phụ thuộc vào UI Captcha, chạy nhanh và ổn định hơn.
    const response = await request.post('http://localhost:8080/auth/login', {
      data: {
        email: 'admin@gmail.com',
        password: '123123123',
        captchaToken: 'dummy-token-for-test'
      }
    });

    const resBody = await response.json();
    expect(resBody.code).toBe('1000');

    // Bước 2: Lấy token từ response
    const jwtToken = resBody.data.token;
    const userData = resBody.data.userRespond;
    const rolesArray = (userData.roles || []).map((r: any) => r.name || r);

    // Bước 3: Mở trang chủ rồi nhét token vào sessionStorage
    await page.goto('http://localhost:5173/');
    await page.evaluate(({ token, roles, user }) => {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('roles', JSON.stringify(roles));
      sessionStorage.setItem('id_user', user.id);
      sessionStorage.setItem('email', user.email || '');
      sessionStorage.setItem('name', user.name || '');
      sessionStorage.setItem('fullName', user.fullName || '');
      sessionStorage.setItem('memberId', user.memberId || '');
      sessionStorage.setItem('avatarUrl', user.url || '');
      sessionStorage.setItem('userData', JSON.stringify(user));
      if (user.dealerId) sessionStorage.setItem('dealerId', user.dealerId);
    }, { token: jwtToken, roles: rolesArray, user: userData });
  });

  test('Giao diện Dashboard Admin tự động đăng nhập thông qua Session State', async ({ page }) => {
    // Điều hướng thẳng vào dashboard (đã có session từ beforeEach)
    await page.goto('http://localhost:5173/evm/admin/dashboard');

    // Phải ở đúng URL, không bị redirect về /login
    await expect(page).toHaveURL('http://localhost:5173/evm/admin/dashboard');

    // Kiểm tra không thấy biểu mẫu đăng nhập (chứng tỏ đã login thành công)
    await expect(page.locator('input[name="password"]')).toHaveCount(0);

    // Kiểm tra heading Dashboard xuất hiện
    const heading = page.getByRole('heading', { name: /dashboard|tổng quan/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

});
