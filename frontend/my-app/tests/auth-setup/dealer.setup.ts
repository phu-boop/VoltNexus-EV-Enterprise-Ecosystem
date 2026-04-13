import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';

const authFile = 'playwright/.auth/dealer.json';

setup('authenticate as dealer manager', async ({ page, request }) => {
  // Gửi request API để đăng nhập dưới quyền Dealer Manager
  const response = await request.post('http://localhost:8080/auth/login', {
    data: {
      email: 'Anhphu@gmail.com',
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
  const rolesArray = (userData.roles || []).map((r: any) => r.name || r);

  await page.goto('http://localhost:5173/');

  // Tiêm dữ liệu SessionStorage
  const sessionData = {
    id_user: userData.id,
    token: jwtToken,
    roles: JSON.stringify(rolesArray),
    email: userData.email || "",
    name: userData.name || "",
    fullName: userData.fullName || "",
    userData: JSON.stringify(userData),
    memberId: userData.memberId || "",
    profileId: userData.memberId || "",
    avatarUrl: userData.url || "",
    dealerId: userData.dealerId || ""
  };

  await page.evaluate((data) => {
    Object.entries(data).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
    });
  }, sessionData);

  // Lưu file session của Dealer (Playwright chuẩn)
  await page.context().storageState({ path: authFile });

  // Lưu riêng SessionStorage vì Playwright không hỗ trợ tự động
  fs.writeFileSync('playwright/.auth/dealer-session.json', JSON.stringify(sessionData));
});
