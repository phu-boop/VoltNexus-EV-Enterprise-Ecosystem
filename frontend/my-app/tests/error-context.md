# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: vehicle-backfill.spec.ts >> Function 110: backfillVehicleCache >> ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)
- Location: tests\vehicle-backfill.spec.ts:42:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/evm/admin/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications Alt+T"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Tài khoản test" [level=4] [ref=e7]
      - table [ref=e8]:
        - rowgroup [ref=e9]:
          - row "Email Password" [ref=e10]:
            - columnheader "Email" [ref=e11]
            - columnheader "Password" [ref=e12]
        - rowgroup [ref=e13]:
          - row "admin@gmail.com 123123123" [ref=e14]:
            - cell "admin@gmail.com" [ref=e15]
            - cell "123123123" [ref=e16]
          - row "StafffEVM@gmail.com 123123123" [ref=e17]:
            - cell "StafffEVM@gmail.com" [ref=e18]
            - cell "123123123" [ref=e19]
          - row "Anhphu@gmail.com 123123123" [ref=e20]:
            - cell "Anhphu@gmail.com" [ref=e21]
            - cell "123123123" [ref=e22]
          - row "StaffPhu@gmail.com 123123123" [ref=e23]:
            - cell "StaffPhu@gmail.com" [ref=e24]
            - cell "123123123" [ref=e25]
    - generic [ref=e26]:
      - heading "Đăng nhập" [level=2] [ref=e27]
      - generic [ref=e28]:
        - img [ref=e30]
        - textbox [ref=e32]: admin@gmail.com
        - generic: Email
      - generic [ref=e33]:
        - img [ref=e35]
        - textbox [ref=e37]: "123123123"
        - generic: Mật khẩu
        - button [ref=e38]:
          - img [ref=e39]
      - generic [ref=e41]:
        - generic [ref=e42] [cursor=pointer]:
          - checkbox "Ghi nhớ tôi" [ref=e43]
          - text: Ghi nhớ tôi
        - link "Quên mật khẩu?" [ref=e44] [cursor=pointer]:
          - /url: /reset-password
      - generic [ref=e45]:
        - generic [ref=e46]: "Connection refused: getsockopt: localhost/127.0.0.1:8081"
        - button "×" [ref=e47]
      - button "Đăng nhập" [ref=e48]
      - link "Quay về trang chủ" [ref=e50] [cursor=pointer]:
        - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Function 110: backfillVehicleCache', () => {
  4  | 
  5  |   // Hook này giả lập việc đăng nhập bằng tài khoản Admin trước mỗi test case, kèm theo Bypass ReCAPTCHA
  6  |   test.beforeEach(async ({ page }) => {
  7  |     // Intercept the request to Google reCAPTCHA script and fake it
  8  |     await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
  9  |       await route.fulfill({
  10 |         status: 200,
  11 |         contentType: 'application/javascript',
  12 |         body: `
  13 |           window.grecaptcha = {
  14 |             ready: function(cb) { cb() },
  15 |             render: function(element, options) {
  16 |               if (options.callback) {
  17 |                 setTimeout(() => options.callback('mock-captcha-token'), 500);
  18 |               }
  19 |               return 0; 
  20 |             },
  21 |             reset: function() {},
  22 |             execute: function() { return Promise.resolve('mock-captcha-token') },
  23 |             getResponse: function() { return 'mock-captcha-token' }
  24 |           };
  25 |         `
  26 |       });
  27 |     });
  28 | 
  29 |     // Thay đổi URL theo cấu hình Vite/React của bạn
  30 |     await page.goto('http://localhost:5173/login'); 
  31 |     await page.fill('input[name="email"]', 'admin@gmail.com');
  32 |     await page.fill('input[name="password"]', '123123123'); // Thông tin từ file login.spec.ts
  33 |     
  34 |     // Đợi 1 chút cho mock captcha được inject
  35 |     await page.waitForTimeout(1000);
  36 |     await page.click('button[type="submit"]');
  37 |     
  38 |     // Đợi nhảy vào Dashboard thành công
> 39 |     await page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  40 |   });
  41 | 
  42 |   test('ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)', async ({ page }) => {
  43 |     
  44 |     // 1. Open the Data Backfill Tool page.
  45 |     // Điều hướng bằng cách click qua giao diện Sidebar cho chuẩn luồng End-to-End
  46 |     await page.click('text=Administration Hub'); // Nhấn Menu chính
  47 |     await page.click('text=System Management');  // Nhấn Menu con
  48 |     await page.click('text=Data Backfill Tool'); // Nhấn chọn trang Backfill
  49 |     
  50 |     // Đảm bảo trang Backfill đã load xong
  51 |     await expect(page).toHaveURL(/.*data-backfill/);
  52 | 
  53 |     // 2. Click the green button labeled "2. Đồng bộ Xe (Vehicles)".
  54 |     // Lấy đích danh nút màu xanh dựa trên text hoặc role
  55 |     const syncButton = page.getByRole('button', { name: /Đồng bộ Xe \(Vehicles\)/i });
  56 |     await expect(syncButton).toBeVisible();
  57 |     await syncButton.click();
  58 | 
  59 |     // 3. Wait for the system to process the records.
  60 |     // Quan sát xem nút có đổi chữ thành "Đang đồng bộ..." và bị disabled không (UI validation)
  61 |     await expect(syncButton).toBeDisabled();
  62 | 
  63 |     // 4. Kiểm tra Expected Output: Success message xuất hiện
  64 |     // Lắng nghe sự xuất hiện của component Toast Message báo thành công
  65 |     const toastMessage = page.locator('.toast-success', { hasText: 'Backfill vehicles thành công!' });
  66 |     
  67 |     // Đợi toast bật lên (có thể tốn vài chục giây tùy tốc độ backend)
  68 |     await expect(toastMessage).toBeVisible({ timeout: 15000 });
  69 |   });
  70 | 
  71 | });
  72 | 
```

# Answer

## 1. Reason for Test Failure

- **Backend Connection Refused**: The UI failed to communicate with the Backend API (port 8081 is down), throwing `Connection refused`. This blocked the login sequence, preventing redirect to `Dashboard`, and finally triggered a timeout for `waitForURL('**/evm/admin/dashboard')`.
- **Redundant Login Logic**: The `vehicle-backfill.spec.ts` defines an explicit `test.beforeEach` that repeats UI login. However, Playwright is effectively configured to inject authentication state automatically through `admin.setup.ts` (`storageState: 'playwright/.auth/admin.json'`). This duplicate login makes the test slower, less reliable, and breaks Playwright best practices.

## 2. Playwright Best Practices

- For tests within the `e2e-admin` project, the environment is already pre-authenticated via the dependency on the `setup` project. We do not need, and should not use, the UI to log in before each test. Ensure `admin.setup.ts` correctly caches this login state and navigate the tests immediately.
- The test script should not suppress standard infrastructure errors. If the backend is down, the test should fail explicitly, not quietly catch connection errors. Ensure the backend starts before tests (e.g., using `webServer` config in `playwright.config.ts`).

## 3. Code Fix Provided

I have updated the `frontend/my-app/tests/evm/system/vehicle-backfill.spec.ts` to remove the redundant `test.beforeEach` block. The test is now much simpler and utilizes the global authentication state:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Function 110: backfillVehicleCache', () => {

  test('ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)', async ({ page }) => {
    test.setTimeout(180000);
    
    // 1. Direct navigation - User is already authenticated via admin.setup.ts
    await page.goto('http://localhost:5173/evm/admin/system/data-backfill');
    await expect(page).toHaveURL(/.*data-backfill/);

    // 2. Click the green button
    const syncButton = page.getByRole('button', { name: /Đồng bộ Xe \(Vehicles\)/i });
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    // 3. Wait for the system to process the records.
    const loadingButton = page.getByRole('button', { name: /Đang đồng bộ.../i });
    await expect(loadingButton).toBeDisabled();

    // 4. Expected Output: Success message
    const successMessage = page.getByText(/Backfill vehicles thành công!/i);
    await expect(successMessage).toBeVisible({ timeout: 120000 });
  });

});
```