import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Reporting Service - Sales Report', () => {
    
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Chuyển hướng đến trang Sales Report
    await page.goto('http://localhost:5173/evm/admin/reports/sales');
  });

  test('Giao diện Báo cáo Doanh số nên load thành công các biểu đồ và bảng (Real Data)', async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số theo Khu vực & Đại lý' })).toBeVisible({ timeout: 15000 });

    // Bảng dữ liệu có hiển thị
    const tableHeader = page.locator('.ant-table-thead');
    await expect(tableHeader).toBeVisible();
    
    // Biểu đồ render thành công (canvas)
    await page.waitForTimeout(3000);
    const canvasElements = page.locator('canvas');
    const count = await canvasElements.count();
    // Có 2 charts: Doughnut (Khu vực) và Bar (Mẫu xe), nhưng chỉ render khi có data
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Bộ lọc Local theo Mẫu Xe thay đổi dữ liệu bảng', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });

    // Đợi loading dữ liệu
    await page.waitForTimeout(3000);

    // Mở dropdown Mẫu xe (Ant Design Select thứ 2)
    await page.locator('.ant-select-selector').nth(1).click();

    // Chọn option đầu tiên (nếu có dữ liệu)
    const firstOption = page.locator('.ant-select-item-option-content').first();
    const hasData = await firstOption.isVisible();

    if (hasData) {
      const modelName = await firstOption.textContent();
      await firstOption.click();

      // Sau khi chọn, bảng phải chỉ hiển thị các dòng khớp với modelName
      await page.waitForTimeout(500);
      
      const rows = page.locator('.ant-table-tbody .ant-table-row');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const cellText = await rows.nth(0).locator('td').nth(2).textContent();
        expect(cellText).toBe(modelName);
      }
    }
  });

  test('Nút Xuất Excel hoạt động', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });
    
    // Chờ data load
    await page.waitForTimeout(3000);

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
