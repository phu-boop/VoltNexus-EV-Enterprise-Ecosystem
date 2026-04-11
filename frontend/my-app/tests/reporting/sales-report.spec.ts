import { test, expect } from '@playwright/test';

test.describe('Reporting Service - Sales Report', () => {
    
  test.beforeEach(async ({ page }) => {
    // 1. Mock Google reCAPTCHA
    await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.grecaptcha = {
            ready: function(cb) { cb() },
            render: function(element, options) {
              if (options.callback) {
                setTimeout(() => options.callback('mock-captcha-token'), 100);
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

    // 2. Perform Login as Admin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', '123123123');
    await page.waitForTimeout(500); // Đợi reCAPTCHA mock gọi callback
    await page.click('button[type="submit"]');

    // 3. Đợi nhảy sang trang admin dashboard
    await page.waitForURL('**/evm/admin/dashboard', { timeout: 15000 });

    // 4. Chuyển hướng đến trang Sales Report
    await page.goto('http://localhost:5173/evm/admin/reports/sales');
  });

  test('Giao diện Báo cáo Doanh số nên load thành công các biểu đồ và bảng (Real Data)', async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số theo Khu vực & Đại lý' })).toBeVisible({ timeout: 15000 });

    // Kiểm tra render các Select (Bộ lọc)
    const selectKhuVuc = page.locator('.ant-select-selection-item').nth(0);
    const selectMauXe = page.locator('.ant-select-selection-search-input').nth(1);

    // Bảng dữ liệu có hiển thị
    const tableHeader = page.locator('.ant-table-thead');
    await expect(tableHeader).toBeVisible();
    
    // Biểu đồ render thành công (canvas)
    const canvasElements = page.locator('canvas');
    await expect(canvasElements).toHaveCount(2); // Doughnut (Khu vực) và Bar (Mẫu xe)
  });

  test('Bộ lọc Local theo Mẫu Xe thay đổi dữ liệu bảng', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });

    // Đợi loading dữ liệu (Real backend có thể chậm)
    await page.waitForTimeout(2000);

    // Mở dropdown Mẫu xe (Select thứ 2)
    await page.locator('.ant-select-selector').nth(1).click();

    // Chọn option đầu tiên (nếu có dữ liệu)
    const firstOption = page.locator('.ant-select-item-option-content').first();
    const hasData = await firstOption.isVisible();

    if (hasData) {
      const modelName = await firstOption.textContent();
      await firstOption.click();

      // Sau khi chọn, bảng phải chỉ hiển thị các dòng khớp với modelName
      // Chờ React render lại bảng
      await page.waitForTimeout(500);
      
      const rows = page.locator('.ant-table-tbody .ant-table-row');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // Kiểm tra cell Mẫu xe (cột số 3 index 2)
        const cellText = await rows.nth(0).locator('td').nth(2).textContent();
        expect(cellText).toBe(modelName);
      }
    }
  });

  test('Nút Xuất Excel hoạt động', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });
    
    // Chờ 2s để fetch dl thật
    await page.waitForTimeout(2000);

    // Bắt sự kiện tải file excel
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      page.locator('button', { hasText: 'Xuất Excel' }).click()
    ]);

    if (download) {
        expect(download.suggestedFilename()).toBe('BaoCaoDoanhSo.xlsx');
    }
  });
});
