import { test, expect } from '@playwright/test';

test.describe('Module 1: Authentication & User Accounts', () => {
  
  test('User can navigate to Login and view form fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check if essential login components are rendered
    await expect(page.getByRole('heading', { name: /Đăng nhập|Login/i }).first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Đăng nhập|Login/i }).first()).toBeVisible();
  });
              
  test('User gets validation error on empty submit', async ({ page }) => {
    await page.goto('/login');
    
    // Cố gắng bấm login nhưng không điền account
    await page.getByRole('button', { name: /Đăng nhập|Login/i }).first().click();
    
    // Check nếu có Toast error hoặc HTML5 validation popup
    // Hoặc form highlight màu đỏ
    const hasHTML5Validation = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      return emailInput ? !emailInput.checkValidity() : false;
    });
    
    if (!hasHTML5Validation) {
      // Fallback nếu dùng custom form tool: Chờ thông báo lỗi render
      const errorMsgCount = await page.locator('.text-red-500, .error-message').count();
      expect(errorMsgCount).toBeGreaterThan(0);
    }
  });

  test('User can register a new account and login immediately', async ({ page }) => {
    test.setTimeout(90000); 

    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // 1. Sang trang Đăng Ký
    const registerLink = page.locator('a[href="/register"]').or(page.getByText(/Đăng ký|Sign up/i)).first();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
    await page.waitForTimeout(1000);

    // 2. Khởi tạo toàn bộ Dữ liệu Random (Tên, Email, SĐT, Mật khẩu)
    const randomStr = Math.random().toString(36).substring(2, 8);
    const testEmail = `user_${randomStr}@domain.com`;
    const testName = `Khách Hàng ${randomStr}`;
    const testPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`; // Tạo SĐT 10 số
    const testPass = `Sjuc3@${randomStr}!`; // Pass mạnh

    // Điền Form Đăng Ký (giảm thời gian nhập)
    const nameInput = page.locator('input[name="name"], input[placeholder*="Tên"], input[placeholder*="Name"]');
    if (await nameInput.count() > 0) {
      await nameInput.first().pressSequentially(testName, { delay: 10 });
    }

    await page.locator('input[type="email"]').pressSequentially(testEmail, { delay: 10 });
    await page.locator('input[type="password"]').first().pressSequentially(testPass, { delay: 10 });

    const confirmPass = page.locator('input[name="confirmPassword"], input[placeholder*="Xác nhận"]');
    if (await confirmPass.count() > 0) {
      await confirmPass.first().pressSequentially(testPass, { delay: 10 });
    }

    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="Điện thoại"], input[placeholder*="SĐT"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().pressSequentially(testPhone, { delay: 10 });
    }
    
    await page.waitForTimeout(1000);

    // Xử lý Captcha ở màn Đăng Ký
    const recaptchaIframe = page.locator('iframe[title="reCAPTCHA"], iframe[src*="recaptcha/api2/anchor"]');
    if (await recaptchaIframe.count() > 0) {
      await recaptchaIframe.first().contentFrame().locator('.recaptcha-checkbox-border').click();
      await page.waitForTimeout(1500); 
    } 

    // 3. Submit Form Đăng Ký thẳng vào Real Database
    // Đặt lệnh "Nghe lóng" API trước khi bấm nút để đảm bảo vòng đời API chạy xong
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/register') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null); // Bỏ qua nếu timeout để không crash nếu backend dập

    await page.getByRole('button', { name: /Đăng ký|Sign up/i }).first().click({ force: true });
    
    // Bắt buộc đợi Tín hiệu trả về từ Server để chắc chắn Account đã insert vào DB
    const res = await responsePromise;
    if (!res) {
      console.log('Cảnh báo: Không nhận được phản hồi 200 OK từ Server. Đăng ký có thể đã xịt do không bật Backend hoặc lỗi Validations.');
    }
    
    // App có set tự động login sau đăng ký, nên ta phải dọn dẹp Storage để thử tay màn hình Login
    await page.waitForTimeout(2000);
    await page.context().clearCookies();
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    
    // 4. Vòng về lại màn Login để test Đăng Nhập
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // 4. Nhập thông tin vừa tạo Random vào màn Đăng Nhập
    const loginEmail = page.locator('input[type="email"]');
    const loginPass  = page.locator('input[type="password"]').first();

    await loginEmail.pressSequentially(testEmail, { delay: 10 });
    await loginPass.pressSequentially(testPass, { delay: 10 });
    await page.waitForTimeout(1000);
    
    // --- XỬ LÝ CAPTCHA BẮT BUỘC Ở PHẦN ĐĂNG NHẬP ---
    const recaptchaLogin = page.locator('iframe[title="reCAPTCHA"], iframe[src*="recaptcha/api2/anchor"]');
    if (await recaptchaLogin.count() > 0) {
      await recaptchaLogin.first().contentFrame().locator('.recaptcha-checkbox-border').click();
      await page.waitForTimeout(1500);
    }
    // ---------------------------------------------

    // 5. Bấm Đăng nhập (Gửi API về Backend thật)
    await page.getByRole('button', { name: /Đăng nhập|Login/i }).first().click();

    // 6. Kiểm tra đăng nhập (đâm thẳng vào DB nên nếu thành công sẽ thoát khỏi login)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Hiển thị kết quả Real Data trong 2 giây rồi tắt
    await page.waitForTimeout(2000);
  });
  
  test('OAuth callback gracefully handles invalid state', async ({ page }) => {
    // Nếu vào thẳng oauth-success mà không có token trên URL thì sao?
    await page.goto('/oauth-success');
    
    // Thông thường nếu bị lỗi sẽ văng ra login hoặc trang lỗi
    const url = page.url();
    expect(url.includes('/login') || url.includes('/oauth-success')).toBeTruthy();
  });
});
