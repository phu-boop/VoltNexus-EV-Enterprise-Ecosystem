import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page, request }) => {
  // Gửi request trực tiếp đến Backend API để đăng nhập, lách vòng kiểm duyệt UI Captcha
  const response = await request.post('http://localhost:8080/auth/login', {
    data: {
      email: 'admin@gmail.com',
      password: '123123123',
      captchaToken: 'dummy-token-for-test'
    }
  });

  const resBody = await response.json();
  
  if (resBody.code !== 1000 && resBody.code !== "1000") {
    console.error("API Login Failed! Captcha might be strictly validated on the backend.", resBody);
  }
  expect(resBody.code).toBe("1000");

  const userData = resBody.data.userRespond;
  const jwtToken = resBody.data.token;
  // Fallback map vì đôi khi roles trả về là string thay vì mảng object
  const rolesArray = (userData.roles || []).map((r: any) => r.name || r);

  // Điều hướng tới trang gốc để lấy context gắn sessionStorage
  await page.goto('http://localhost:5173/');

  // Tiêm dữ liệu vào sessionStorage của trình duyệt, mô phỏng thao tác của AuthProvider.jsx
  await page.evaluate(({ token, roles, user }) => {
    sessionStorage.setItem("id_user", user.id);
    sessionStorage.setItem("token", token);
    if (roles) sessionStorage.setItem("roles", JSON.stringify(roles));
    sessionStorage.setItem("email", user.email || "");
    sessionStorage.setItem("name", user.name || "");
    sessionStorage.setItem("fullName", user.fullName || "");
    if (user) sessionStorage.setItem("userData", JSON.stringify(user));
    sessionStorage.setItem("memberId", user.memberId || "");
    sessionStorage.setItem("avatarUrl", user.url || "");
    if (user.dealerId) sessionStorage.setItem("dealerId", user.dealerId);
  }, { token: jwtToken, roles: rolesArray, user: userData });

  // Lưu trạng thái sessionStorage vào file cục bộ
  await page.context().storageState({ path: authFile });
});
