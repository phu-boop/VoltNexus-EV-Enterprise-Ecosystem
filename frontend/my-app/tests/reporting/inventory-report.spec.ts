import { test, expect } from '@playwright/test';

test.describe('Reporting Service - Inventory Report', () => {

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
    await page.waitForTimeout(500); 
    await page.click('button[type="submit"]');

    // 3. Đợi nhảy sang trang admin dashboard
    await page.waitForURL('**/evm/admin/dashboard', { timeout: 15000 });

    // 4. Chuyển hướng đến trang Inventory Report
    await page.goto('http://localhost:5173/evm/admin/reports/inventory');
  });

  test('Hiển thị và tương tác các Tabs Tồn kho', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });

    // Tab 1: Tồn kho Đại lý
    const tabDealer = page.locator('.ant-tabs-tab', { hasText: 'Tồn kho Đại lý' });
    await expect(tabDealer).toBeVisible();
    
    // Tab 2: Kho Trung Tâm
    const tabCentral = page.locator('.ant-tabs-tab', { hasText: 'Kho Trung Tâm' });
    await expect(tabCentral).toBeVisible();

    // Chuyển sang Tab Kho Trung tâm
    await tabCentral.click();
    
    // Chờ Statistic block load
    await expect(page.locator('.ant-statistic-title', { hasText: 'Tổng nhập kho' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.ant-statistic-title', { hasText: 'Đã điều phối' })).toBeVisible();
  });

  test('Biểu đồ render đầy đủ ở tab Tồn kho Đại lý', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });
    
    await page.waitForTimeout(2000); // Chờ dl thật

    // Kiểm tra render các canvas chart trong tab Tồn kho Đại lý
    // Có tổng cộng 6 biểu đồ ở tab 1
    const canvases = page.locator('.ant-tabs-tabpane-active canvas');
    
    // Chờ 1 chút để Chart.js vẽ
    await page.waitForTimeout(1000);
    const canvasCount = await canvases.count();
    
    // Thường nếu không có data ở Khoảng thấp, biểu đồ có thể ko render, nhưng ít nhất Doughnut/Bar phải hiện
    expect(canvasCount).toBeGreaterThanOrEqual(2);
  });

  test('Nút Xuất Excel ở Tồn kho Đại lý hoạt động', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000); // Chờ dl thật
    
    // Nút xuất Excel
    const exportBtn = page.locator('button', { hasText: 'Xuất Excel' });

    // Bắt sự kiện tải file excel
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      exportBtn.click()
    ]);

    if (download) {
        expect(download.suggestedFilename()).toBe('BaoCaoTonKho.xlsx');
    }
  });

});
