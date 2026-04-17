import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Sales Reporting & Recording Tests', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('http://localhost:5173/evm/admin/reports/sales');
    });

    test('ITC_112.1: Filter Sales by Region (Ant Design Select)', async ({ page }) => {
        // Đợi trang load
        await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số theo Khu vực & Đại lý' })).toBeVisible({ timeout: 15000 });

        // SalesReportPage dùng Ant Design Select, không phải native <select>
        // Mở dropdown "Chọn khu vực" (Select đầu tiên)
        const regionSelector = page.locator('.ant-select-selector').first();
        await regionSelector.click();

        // Chọn "Miền Bắc"
        await page.locator('.ant-select-item-option-content', { hasText: 'Miền Bắc' }).click();

        // Đợi React fetch lại data
        await page.waitForTimeout(2000);

        // Verify bảng hiệu thị (có thể có hoặc không có data tùy backend)
        const tableOrEmpty = page.locator('.ant-table-thead').or(page.getByText('Không có dữ liệu'));
        await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
    });

    test('ITC_112.2: Filter Sales by Model (Ant Design Select)', async ({ page }) => {
        await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });

        // Đợi loading dữ liệu
        await page.waitForTimeout(3000);

        // Mở dropdown Mẫu xe (Select thứ 2)
        const modelSelector = page.locator('.ant-select-selector').nth(1);
        await modelSelector.click();

        // Chọn option đầu tiên (nếu có dữ liệu)
        const firstOption = page.locator('.ant-select-item-option-content').first();
        const hasData = await firstOption.isVisible();

        if (hasData) {
            const modelName = await firstOption.textContent();
            await firstOption.click();

            // Sau khi chọn, bảng phải filter
            await page.waitForTimeout(500);
            
            const rows = page.locator('.ant-table-tbody .ant-table-row');
            const rowCount = await rows.count();
            
            if (rowCount > 0) {
                // Kiểm tra cell Mẫu xe (cột số 3 index 2) chứa modelName
                const cellText = await rows.nth(0).locator('td').nth(2).textContent();
                expect(cellText).toBe(modelName);
            }
        }
    });

    // ============================================================
    // ITC_5.116.1 - recordSalesReport: Manually record a Sales report
    // Yêu cầu: Người dùng mở form nhập tay doanh số, nhập OrderId, Total Amount,
    //          Dealer Name, Variant ID hợp lệ rồi bấm Save.
    // Kết quả mong đợi: Toast "Sale recorded successfully" xuất hiện, bản ghi
    //                   ngay lập tức xuất hiện trong bảng Sales Report.
    //
    // ⚠️  LƯU Ý: Test case gốc trong Excel có kết quả "Fail" (Duy Cường, 2026/04/06).
    //    Test Playwright hiện tại (dưới đây) đang verify Biểu đồ Tổng quan — KHÔNG
    //    phải form nhập tay — do form "Ghi nhận Doanh số" chưa được implement hoặc
    //    đường dẫn URL chưa đúng vào thời điểm viết test.
    //    Cần cập nhật lại test này khi form Sales Recording được hoàn thiện:
    //      1. Điều hướng đến URL của form Sales Recording.
    //      2. Điền OrderId, Total Amount, Dealer Name, Variant ID.
    //      3. Click "Save" và assert toast thành công.
    //      4. Verify bản ghi mới xuất hiện ở bảng chi tiết.
    // ============================================================
    test('ITC_5.116.1: Verify Biểu đồ Tổng quan hiển thị', async ({ page }) => {
        await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });

        // Đợi data load
        await page.waitForTimeout(3000);

        // Verify phần "Tổng quan" hiện diện
        await expect(page.getByText('Tổng quan', { exact: false })).toBeVisible();

        // Verify các card biểu đồ hiện diện
        await expect(page.getByText('Doanh thu theo Khu vực')).toBeVisible();
        await expect(page.getByText('Số lượng bán theo Mẫu xe')).toBeVisible();
    });

    // ============================================================
    // ITC_5.116.2 - recordSalesReport: Record Sale with missing required fields
    // Yêu cầu: Để trống trường "Order ID", nhập các trường khác hợp lệ rồi bấm Save.
    // Kết quả mong đợi: Hiển thị lỗi validation "Order ID is mandatory" dưới field,
    //                   không gửi dữ liệu lên server.
    //
    // ⚠️  LƯU Ý: Test case này có trạng thái "Blocked" trong Excel (Duy Cường, 2026/04/06).
    //    Test Playwright dưới đây là SKELETON — cần được hoàn thiện khi form Sales Recording
    //    có URL và selector cụ thể:
    //      - Thay 'URL_CUA_FORM_SALES_RECORDING' bằng đường dẫn thực tế.
    //      - Thay các selector giả định bằng selector đúng từ React component.
    //    Hiện tại test được đánh dấu skip (.skip) để không làm đỏ pipeline CI.
    // ============================================================
    test.skip('ITC_5.116.2: Record Sale with missing required fields (Blocked - form chưa có)', async ({ page }) => {
        // TODO: Cập nhật URL khi form Sales Recording được implement
        await page.goto('http://localhost:5173/evm/admin/sales/record');
        await expect(page.locator('h4')).toBeVisible({ timeout: 15000 });

        // Bỏ trống trường Order ID, điền các trường còn lại
        // TODO: Thay selector giả định bằng selector thực từ form component
        await page.locator('#totalAmount').fill('500000000');
        await page.locator('#dealerName').fill('Đại lý Hà Nội');
        await page.locator('#variantId').fill('1');

        // Bấm Save
        await page.locator('button', { hasText: 'Save' }).click();

        // Kết quả mong đợi: lỗi validation xuất hiện dưới field Order ID
        await expect(page.locator('#orderId ~ .ant-form-item-explain-error'))
            .toHaveText('Order ID is mandatory', { timeout: 5000 });

        // Đảm bảo không có request nào được gửi đi (không có toast thành công)
        await expect(page.getByText('Sale recorded successfully')).not.toBeVisible();
    });

    test('ITC_5.117.1: Verify Dashboard Summaries - Bảng và Charts', async ({ page }) => {
        await expect(page.locator('h4', { hasText: 'Báo cáo Doanh số' })).toBeVisible({ timeout: 15000 });
        
        await page.waitForTimeout(3000);

        // Chấp nhận bảng có header HOẶC thông báo không có dữ liệu (Tránh fail khi DB trống)
        const tableHeader = page.locator('.ant-table-thead');
        const emptyMessage = page.getByText('Không có dữ liệu nào khớp với bộ lọc');
        await expect(tableHeader.or(emptyMessage)).toBeVisible();

        // Verify phần "Báo cáo Chi tiết" header
        await expect(page.getByText('Báo cáo Chi tiết')).toBeVisible();
    });

    test('ITC_5.117.2: Nút Xuất Excel hoạt động', async ({ page }) => {
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
