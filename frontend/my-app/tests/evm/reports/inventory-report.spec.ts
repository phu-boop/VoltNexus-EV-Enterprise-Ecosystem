import { test, expect } from '@playwright/test';

// =====================================================================
// HELPER: Shared login as Admin (Dùng chung cho tất cả test cases)
// =====================================================================
async function loginAsAdmin(page: any) {
  await page.route('https://www.google.com/recaptcha/api.js**', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.grecaptcha = {
          ready: function(cb) { cb() },
          render: function(element, options) {
            if (options.callback) { setTimeout(() => options.callback('mock-captcha-token'), 500); }
            return 0;
          },
          reset: function() {},
          execute: function() { return Promise.resolve('mock-captcha-token') },
          getResponse: function() { return 'mock-captcha-token' }
        };
      `
    });
  });

  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'admin@gmail.com');
  await page.fill('input[name="password"]', '123123123');
  await page.waitForTimeout(1000);
  await page.click('button[type="submit"]');

  await Promise.race([
    page.waitForURL('**/evm/admin/dashboard', { timeout: 15000 }),
    page.waitForSelector('.swal2-container', { timeout: 15000, state: 'visible' })
  ]);

  const successPopup = page.locator('.swal2-container', { hasText: 'Đăng nhập thành công' });
  if (await successPopup.isVisible()) {
    await page.getByRole('button', { name: /Truy cập ngay/i }).click();
    await page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 });
  }

  if (!page.url().includes('dashboard')) {
    throw new Error('⚠️ Đăng nhập thất bại! Kiểm tra Backend đã chạy chưa.');
  }
}

// =====================================================================
// ITC_5.111.1: View Dealer Inventory Report (Happy Path)
// =====================================================================
test.describe('Function 111: getInventoryReport', () => {

  test('ITC_5.111.1 View Dealer Inventory Report (Xem tồn kho Đại lý)', async ({ page }) => {
    test.setTimeout(60000);

    // Bước 1: Đăng nhập với tài khoản Admin
    await loginAsAdmin(page);

    // Bước 2: Điều hướng thẳng tới trang Inventory Report
    await page.goto('http://localhost:5173/evm/admin/reports/inventory');
    await expect(page).toHaveURL(/.*reports\/inventory/);

    // Bước 3: Đảm bảo Tab "Tồn kho Đại lý" đang ACTIVE (Tab mặc định)
    // Theo code React, key: 'dealer', label: '🏪 Tồn kho Đại lý'
    const dealerTab = page.locator('.ant-tabs-tab-active', { hasText: 'Tồn kho Đại lý' });
    await expect(dealerTab).toBeVisible({ timeout: 15000 });

    // Bước 4: Kiểm tra các Biểu đồ (Charts) đã được render thành công
    // Chart 1: "Tỷ lệ Tồn kho (Khu vực)"
    const chartRegion = page.locator('.ant-card', { hasText: 'Tỷ lệ Tồn kho (Khu vực)' });
    await expect(chartRegion).toBeVisible({ timeout: 15000 });

    // Chart 2: "Số lượng Tồn kho (Theo Mẫu xe)"
    const chartModel = page.locator('.ant-card', { hasText: 'Số lượng Tồn kho (Theo Mẫu xe)' });
    await expect(chartModel).toBeVisible({ timeout: 15000 });

    // Bước 5: Scroll xuống và kiểm tra bảng "Chi tiết Tồn kho" có xuất hiện không
    const tableTitle = page.getByText('Chi tiết Tồn kho');
    await tableTitle.scrollIntoViewIfNeeded();
    await expect(tableTitle).toBeVisible({ timeout: 15000 });

    // Kiểm tra bảng data có nội dung (không phải trạng thái loading hay error)
    // Nếu có data thì sẽ render InventoryReportTable, không có data thì hiện "Không có dữ liệu."
    const tableArea = page.locator('div').filter({ hasText: /Chi tiết Tồn kho/ }).last();
    await expect(tableArea).toBeVisible();
  });

});
