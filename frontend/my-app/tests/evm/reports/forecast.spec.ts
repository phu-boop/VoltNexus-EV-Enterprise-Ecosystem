import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('AI Demand Forecast Tests', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('ITC_5.118.0: Forecast Dashboard loads với KPI cards', async ({ page }) => {
        // Navigate đến Forecast Dashboard
        await page.goto('http://localhost:5173/evm/admin/reports/forecast');

        // Verify page header
        const heading = page.getByRole('heading', { name: /AI Dự Báo & Phân Tích/i });
        await expect(heading).toBeVisible({ timeout: 30000 });

        // Verify có select chọn khoảng thời gian (native <select>)
        const timeSelect = page.locator('select');
        await expect(timeSelect).toBeVisible();

        // Verify có nút Quick Action "Dự Báo Nhu Cầu"
        const forecastBtn = page.locator('button', { hasText: 'Dự Báo Nhu Cầu' });
        await expect(forecastBtn).toBeVisible();

        // Verify có nút Quick Action "Kế Hoạch Sản Xuất"
        const productionBtn = page.locator('button', { hasText: 'Kế Hoạch Sản Xuất' });
        await expect(productionBtn).toBeVisible();
    });

    test('ITC_5.118.1: Navigate đến trang Demand Forecast và thấy form', async ({ page }) => {
        // Navigate đến Demand Forecast Page
        await page.goto('http://localhost:5173/evm/admin/reports/forecast/demand');

        // Verify page header
        const heading = page.getByRole('heading', { name: /Dự Báo Nhu Cầu/i });
        await expect(heading).toBeVisible({ timeout: 15000 });

        // Verify form fields hiện diện
        // - Variant ID input (number)
        const variantInput = page.locator('input[type="number"]');
        await expect(variantInput).toBeVisible();

        // - Số Ngày Dự Báo select (native <select>)
        const daysSelect = page.locator('select').first();
        await expect(daysSelect).toBeVisible();

        // - Phương Pháp select (native <select>)
        const methodSelect = page.locator('select').nth(1);
        await expect(methodSelect).toBeVisible();

        // - Khu Vực input (text)
        const regionInput = page.locator('input[type="text"]');
        await expect(regionInput).toBeVisible();

        // - Nút "Tạo Dự Báo"
        const generateBtn = page.locator('button', { hasText: /Tạo Dự Báo/i });
        await expect(generateBtn).toBeVisible();
    });

    test('ITC_5.118.2: Tạo Dự Báo sẽ hiển thị kết quả hoặc cảnh báo', async ({ page }) => {
        test.setTimeout(120000);

        await page.goto('http://localhost:5173/evm/admin/reports/forecast/demand');

        // Đợi form load
        const generateBtn = page.locator('button', { hasText: /Tạo Dự Báo/i });
        await expect(generateBtn).toBeVisible({ timeout: 15000 });

        // Chọn phương pháp AUTO (default)
        // Click nút Tạo Dự Báo (không cần chọn variant → dự báo tất cả)
        await generateBtn.click();

        // Đợi loading xong - nút sẽ đổi text thành "Đang tạo dự báo..."
        // Sau đó sẽ có 1 trong 2 kết quả:
        // A) SweetAlert "Không có dữ liệu dự báo" (nếu chưa có data)
        // B) Card kết quả "Tổng Nhu Cầu Dự Báo" (nếu có data)
        const noDataAlert = page.locator('.swal2-title', { hasText: 'Không có dữ liệu dự báo' });
        const resultCard = page.getByText('Tổng Nhu Cầu Dự Báo');

        await expect(noDataAlert.or(resultCard)).toBeVisible({ timeout: 60000 });
    });

    test('ITC_5.119.1: Forecast Dashboard hiển thị KPI cards', async ({ page }) => {
        await page.goto('http://localhost:5173/evm/admin/reports/forecast');

        // Đợi dashboard load
        const heading = page.getByRole('heading', { name: /AI Dự Báo & Phân Tích/i });
        await expect(heading).toBeVisible({ timeout: 30000 });

        // Verify các KPI Card hiện diện
        await expect(page.getByText('Tổng Doanh Số')).toBeVisible();
        await expect(page.getByText('Tổng Doanh Thu')).toBeVisible();
        await expect(page.getByText('Tồn Kho')).toBeVisible();
        await expect(page.getByText('Cảnh Báo Tồn Kho')).toBeVisible();
    });
});
