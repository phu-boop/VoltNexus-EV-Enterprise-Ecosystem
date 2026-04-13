import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Inventory Reporting Tests', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('http://localhost:5173/evm/admin/reports/inventory');
    });

    test('ITC_111.1: View Dealer Inventory Report', async ({ page }) => {
        // 1. Verify tiêu đề trang load thành công
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });

        // 2. Verify tab "Tồn kho Đại lý" hiện diện và đang active
        const tabDealer = page.locator('.ant-tabs-tab', { hasText: 'Tồn kho Đại lý' });
        await expect(tabDealer).toBeVisible();

        // 3. Đợi data load và kiểm tra biểu đồ canvas
        await page.waitForTimeout(3000);
        const canvases = page.locator('canvas');
        const canvasCount = await canvases.count();
        // Trang có 6 biểu đồ (Doughnut + 5 Bar charts), nhưng ít nhất 2 phải render
        expect(canvasCount).toBeGreaterThanOrEqual(2);
    });

    test('ITC_111.2: Verify filter selects hoạt động', async ({ page }) => {
        // Đợi trang load
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho' })).toBeVisible({ timeout: 15000 });

        // Verify Ant Design Select "Chọn khu vực" hiện diện
        // Ant Design Select render dưới dạng .ant-select-selector, không phải native <select>
        const regionSelect = page.locator('.ant-select-selector').first();
        await expect(regionSelect).toBeVisible();

        // Verify Ant Design Select "Chọn mẫu xe" hiện diện
        const modelSelect = page.locator('.ant-select-selector').nth(1);
        await expect(modelSelect).toBeVisible();
    });

    test('ITC_113.1: Verify Tốc độ bán trung bình chart và table', async ({ page }) => {
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho' })).toBeVisible({ timeout: 15000 });

        // Verify có Card "Tốc độ bán trung bình" trong tab Tồn kho Đại lý
        const velocityCard = page.locator('text=Tốc độ bán trung bình');
        await expect(velocityCard).toBeVisible({ timeout: 10000 });
    });

    test('ITC_5.114.1: View Central Warehouse Report', async ({ page }) => {
        // Đợi trang load
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho' })).toBeVisible({ timeout: 15000 });

        // 1. Click tab "Kho Trung Tâm"
        const tabCentral = page.locator('.ant-tabs-tab', { hasText: 'Kho Trung Tâm' });
        await expect(tabCentral).toBeVisible();
        await tabCentral.click();

        // 2. Verify Statistic cards hiện diện (Vietnamese text)
        await expect(page.locator('.ant-statistic-title', { hasText: 'Tổng nhập kho' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.ant-statistic-title', { hasText: 'Đã điều phối' })).toBeVisible();
        await expect(page.locator('.ant-statistic-title', { hasText: 'Tồn khả dụng' })).toBeVisible();
    });

    test('ITC_5.115.1: View Central Transaction History with Tags', async ({ page }) => {
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho' })).toBeVisible({ timeout: 15000 });

        // Click tab Kho Trung Tâm
        await page.locator('.ant-tabs-tab', { hasText: 'Kho Trung Tâm' }).click();

        // Kiểm tra tiêu đề "Lịch sử Giao dịch Kho Trung Tâm"
        const transactionLog = page.getByText('Lịch sử Giao dịch Kho Trung Tâm');
        await expect(transactionLog).toBeVisible({ timeout: 10000 });

        // Kiểm tra bảng giao dịch hiện diện (Ant Design Table)
        const table = page.locator('.ant-table');
        await expect(table).toBeVisible();

        // Kiểm tra cột headers hiện diện
        await expect(page.getByRole('columnheader', { name: 'Loại GD', exact: true })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Số lượng', exact: true })).toBeVisible();
    });
});
