import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Function 110: backfillVehicleCache', () => {

  test.beforeEach(async ({ page }) => {
    // Inject SessionStorage từ file đã lưu trong admin.setup.ts
    if (fs.existsSync('playwright/.auth/admin-session.json')) {
        const sessionData = JSON.parse(fs.readFileSync('playwright/.auth/admin-session.json', 'utf8'));
        await page.addInitScript((data) => {
            Object.entries(data).forEach(([key, value]) => {
                sessionStorage.setItem(key, value as string);
            });
        }, sessionData);
    }
  });

  test('ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)', async ({ page }) => {
    // Vì quá trình backfill đồng bộ dữ liệu lớn xuống DB mất rất nhiều thời gian,
    // ta phải nới lỏng thời gian chờ tối đa của Test Case này lên 3 phút (180 giây)
    test.setTimeout(180000);
    
    // 1. Open the Data Backfill Tool page.
    // Điều hướng trực tiếp bằng URL để đảm bảo 100% không bị kẹt ở các Menu đồ hoạ.
    // Lưu ý: User đã được xác thực nhờ admin.setup.ts (project e2e-admin).
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
