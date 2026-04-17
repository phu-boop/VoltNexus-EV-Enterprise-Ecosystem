import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth';

test.describe('Function 109: backfillDealerCache', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ITC_5.109.1 Test backfill dealer cache successfully (Đồng bộ Đại lý thành công)', async ({ page }) => {
    // Vì quá trình backfill đồng bộ dữ liệu lớn xuống DB mất rất nhiều thời gian,
    // ta phải nới lỏng thời gian chờ tối đa của Test Case này lên 3 phút (180 giây)
    test.setTimeout(180000);
    
    // 1 & 2. Open the Data Backfill Tool page.
    // Điều hướng trực tiếp bằng URL để đảm bảo 100% không bị kẹt ở các Menu đồ hoạ
    await page.goto('http://localhost:5173/evm/admin/system/data-backfill');
    
    // Đảm bảo trang Backfill đã load xong
    await expect(page).toHaveURL(/.*data-backfill/);

    // 3. Click the button labeled "1. Đồng bộ Đại lý (Dealers)".
    const syncButton = page.getByRole('button', { name: /1\. Đồng bộ Đại lý \(Dealers\)/i });
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    // 4. Monitor the process status.
    // Quan sát xem nút có đổi chữ thành "Đang đồng bộ..." và dính thuộc tính disabled không
    const loadingButton = page.getByRole('button', { name: /Đang đồng bộ.../i });
    await expect(loadingButton).toBeDisabled();

    // 5. Kiểm tra Expected Output: Success message xuất hiện
    const successMessage = page.getByText(/Backfill dealers thành công!/i);
    
    // Đợi thông báo hiện lên (Tăng thời gian lên 120 giây vì API có thể bắt Backend cày rất lâu)
    await expect(successMessage).toBeVisible({ timeout: 120000 });
  });

});
