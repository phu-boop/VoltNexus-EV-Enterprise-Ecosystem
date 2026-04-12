import { test, expect } from '@playwright/test';

test.describe('Function 110: backfillVehicleCache', () => {

  // Hook này giả lập việc đăng nhập bằng tài khoản Admin trước mỗi test case, kèm theo Bypass ReCAPTCHA
  test.beforeEach(async ({ page }) => {
    // Intercept the request to Google reCAPTCHA script and fake it
    await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.grecaptcha = {
            ready: function(cb) { cb() },
            render: function(element, options) {
              if (options.callback) {
                setTimeout(() => options.callback('mock-captcha-token'), 500);
              }
              return 0; 
            },
            reset: function() {},
            execute: function() { return Promise.resolve('mock-captcha-token') },
            getResponse: function() { return 'mock-captcha-token' }
          };
        `
      });
    });

    // Thay đổi URL theo cấu hình Vite/React của bạn
    await page.goto('http://localhost:5173/login'); 
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', '123123123'); // Thông tin từ file login.spec.ts
    
    // Đợi 1 chút cho mock captcha được inject
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    
    // Đợi nhảy trang Dashboard HOẶC màn hình văng ra thông báo lỗi (ví dụ SweetAlert hoặc Connection refused)
    await Promise.race([
      page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 }),
      page.waitForSelector('text=Connection refused', { timeout: 10000, state: 'visible' }).catch(() => {}),
      page.waitForSelector('.swal2-container', { timeout: 10000, state: 'visible' })
    ]);

    // Nếu Đăng nhập thành công, hệ thống sẽ văng ra một cái Bảng thông báo (SweetAlert) có nút "Truy cập ngay"
    // Robot Playwright phải bấm nút đó thì Web mới nhảy sang trang Dashboard được!
    const successPopup = page.locator('.swal2-container', { hasText: 'Đăng nhập thành công' });
    if (await successPopup.isVisible()) {
      await page.getByRole('button', { name: /Truy cập ngay/i }).click();
      // Chờ Web thực sự nhảy sang trang Dashboard
      await page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 });
    }

    // Kiểm tra chốt chặn cuối cùng xem có vào được Dashboard chưa
    if (!page.url().includes('dashboard')) {
      throw new Error("⚠️ PHÁT HIỆN LỖI: Không chui vào được Dashboard! Lý do: Hoặc Server Backend sập, hoặc thông tin User/Pass sai.");
    }
  });

  test('ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)', async ({ page }) => {
    // Vì quá trình backfill đồng bộ dữ liệu lớn xuống DB mất rất nhiều thời gian,
    // ta phải nới lỏng thời gian chờ tối đa của Test Case này lên 3 phút (180 giây)
    test.setTimeout(180000);
    
    // 1. Open the Data Backfill Tool page.
    // Điều hướng trực tiếp bằng URL để đảm bảo 100% không bị kẹt ở các Menu đồ hoạ
    await page.goto('http://localhost:5173/evm/admin/system/data-backfill');
    
    // Đảm bảo trang Backfill đã load xong
    await expect(page).toHaveURL(/.*data-backfill/);

    // 2. Click the green button labeled "2. Đồng bộ Xe (Vehicles)".
    // Lấy đích danh nút màu xanh dựa trên text hoặc role
    const syncButton = page.getByRole('button', { name: /Đồng bộ Xe \(Vehicles\)/i });
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    // 3. Wait for the system to process the records.
    // Quan sát xem nút có đổi chữ thành "Đang đồng bộ..." và dính thuộc tính disabled không (UI validation)
    // Lưu ý: Vì cái chữ đã đổi, nên ta phải dùng Locator mới chứ không xài lại cái cũ được!
    const loadingButton = page.getByRole('button', { name: /Đang đồng bộ.../i });
    await expect(loadingButton).toBeDisabled();

    // 4. Kiểm tra Expected Output: Success message xuất hiện
    // Lắng nghe sự xuất hiện của thông báo thành công. Mẹo: Vì FE không cài class tên là .toast-success,
    // ta sẽ dùng hàm quét chữ độc quyền của Playwright để tìm nó.
    const successMessage = page.getByText(/Backfill vehicles thành công!/i);
    
    // Đợi thông báo hiện lên (Tăng thời gian lên 120 giây vì API có thể bắt Backend cày rất lâu)
    await expect(successMessage).toBeVisible({ timeout: 120000 });
  });

});
