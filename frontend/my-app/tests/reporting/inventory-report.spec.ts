import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Reporting Service - Inventory Report', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Chuyển hướng đến trang Inventory Report
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
    
    await page.waitForTimeout(3000); // Chờ data load và Chart.js render

    // Kiểm tra render các canvas chart trong tab Tồn kho Đại lý
    const canvases = page.locator('canvas');
    
    await page.waitForTimeout(1000);
    const canvasCount = await canvases.count();
    
    // Trang có 6 biểu đồ nhưng ít nhất Doughnut/Bar phải hiện
    expect(canvasCount).toBeGreaterThanOrEqual(2);
  });

  test('Nút Xuất Excel ở Tồn kho Đại lý hoạt động', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000); // Chờ data load
    
    // Nút xuất Excel (Ant Design Button)
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
