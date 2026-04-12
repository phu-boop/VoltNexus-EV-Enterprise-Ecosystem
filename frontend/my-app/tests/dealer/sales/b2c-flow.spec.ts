import { test, expect } from '@playwright/test';
import fs from 'fs';
import { injectDealerSession } from '../../helpers/auth-helper';

test.describe('Luồng Bán Hàng B2C (End-to-End)', () => {

  let quotationId: string;
  let orderId: string;

  test.beforeEach(async ({ page }) => {
    // Inject SessionStorage từ file đã lưu trong setup
    await injectDealerSession(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `test-results/failure-${testInfo.title.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
      console.log(`Current URL: ${page.url()}`);
      
      const errorText = await page.locator('.text-red-700, .text-red-800').allTextContents();
      if (errorText.length > 0) {
          console.log(`PAGE ERRORS DETECTED: ${JSON.stringify(errorText)}`);
      }
      
      const sessionData = await page.evaluate(() => JSON.stringify(sessionStorage));
      console.log(`Session Storage: ${sessionData}`);
    }
  });

  test('Quy trình: Tạo Báo giá -> Đơn hàng -> Hợp đồng -> Thanh toán', async ({ page, request }) => {
    test.setTimeout(120000); // Tăng timeout lên 120s cho luồng dài này
    // --- BƯỚC 1: TẠO BÁO GIÁ (QUOTATION) ---
    console.log('Step 1: Creating Quotation...');
    
    // Thử truy cập trang Quotation
    await page.goto('http://localhost:5173/dealer/manager/quotes/create');
    
    // Đợi UI cơ bản của React/Vite load xong
    await page.waitForSelector('#root', { timeout: 20000 });
    await page.waitForTimeout(5000); // Tăng lên 5s để tránh "video trắng"
    
    // Đợi page load nội dung chính
    console.log('Waiting for Step 1 title or form...');
    await page.waitForSelector('select[name="customerId"]', { timeout: 30000 });
    
    // Log số lượng options để debug
    const optionsCount = await page.locator('select[name="customerId"] option').count();
    console.log(`Found ${optionsCount} customers in select.`);
    
    if (optionsCount <= 1) {
        console.log('No customers found. Retrying in 3s...');
        await page.waitForTimeout(3000);
    }
    console.log('Form detected.');
    
    await expect(page.locator('body')).toContainText('Thông tin cơ bản', { timeout: 5000 });

    // Chọn khách hàng (Chọn cái đầu tiên có trong list)
    console.log('Selecting customer...');
    const customerSelect = page.locator('select[name="customerId"]');
    await customerSelect.selectOption({ index: 1 });
    // Chọn mẫu xe
    await page.locator('select[name="modelId"]').selectOption({ index: 1 });
    // Đợi variant load
    await page.waitForTimeout(2000);
    await page.locator('select[name="variantId"]').selectOption({ index: 1 });

    // Nhấn "Tiếp Tục Tạo Báo Giá" để tạo Draft
    await page.getByRole('button', { name: /Tiếp Tục Tạo Báo Giá/i }).click();
    await expect(page.getByText('Tạo báo giá nháp thành công')).toBeVisible();

    // Bước calculation: Nhấn "Xác Nhận Tính Toán"
    await page.getByRole('button', { name: /Xác Nhận Tính Toán/i }).click();
    // Chờ thông báo thành công hoặc chuyển sang bước 3
    await page.waitForTimeout(2000);

    // Bước Send: Xác nhận ngày và nhấn "Gửi Báo Giá"
    const termsArea = page.locator('textarea[name="termsConditions"]');
    await termsArea.fill('Điều khoản: Thanh toán 100% trước khi nhận xe. Bảo hành 5 năm.');
    
    await page.getByRole('button', { name: /Gửi Báo Giá/i }).click();
    
    // Chờ thông báo thành công hoặc Step 4 hiện ra
    await expect(page.getByText(/thành công/i)).toBeVisible({ timeout: 15000 });
    
    // Đợi Step 4 render
    await page.waitForSelector('text=Trạng Thái Báo Giá', { timeout: 15000 });

    // Lấy Quotation ID từ UI Step 4
    const idValueElement = page.locator('div.font-mono.font-semibold.text-gray-900').first();
    quotationId = (await idValueElement.textContent())?.trim() || "";
    console.log(`Created Quotation ID: ${quotationId}`);

    // --- BƯỚC 2: MÔ PHỎNG KHÁCH HÀNG CHẤP NHẬN (ACCEPTED) ---
    // Vì không có UI cho khách hàng trong DashBoard Dealer, ta gọi API trực tiếp từ Test
    console.log('Step 2: Simulating Customer Acceptance via API...');
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    await request.put(`http://localhost:8080/api/v1/quotations/${quotationId}/customer-response`, {
      data: { accepted: true, customerNote: "Tôi đồng ý mua xe này!" },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // --- BƯỚC 3: CHUYỂN ĐỔI SANG ĐƠN HÀNG (SALES ORDER) ---
    console.log('Step 3: Converting to Sales Order...');
    await page.goto('http://localhost:5173/dealer/manager/list/quotations');
    // Tìm báo giá vừa tạo trong list (Có thể cần reload hoặc search)
    await page.fill('input[placeholder*="Tìm kiếm"]', quotationId);
    await page.waitForTimeout(1000);
    await page.getByText('Xem chi tiết').first().click(); // Giả định là Quotation Modal hiện ra
    
    const convertBtn = page.getByRole('button', { name: /Chuyển thành đơn hàng/i });
    await expect(convertBtn).toBeVisible({ timeout: 15000 });
    await convertBtn.click();
    
    // Xác nhận Swal
    await page.getByRole('button', { name: 'Đồng ý' }).click();
    
    // Đợi redirect sang trang Order Detail
    await expect(page).toHaveURL(/.*\/orders\/.*/, { timeout: 20000 });
    orderId = page.url().split('/').pop() || "";
    console.log(`Created Sales Order ID: ${orderId}`);

    // --- BƯỚC 4: DUYỆT ĐƠN HÀNG ---
    console.log('Step 4: Approving Sales Order...');
    // Trạng thái đơn hàng mới B2C thường là PENDING. Phải "Gửi quản lý duyệt"
    await page.getByRole('button', { name: /Gửi quản lý duyệt/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // Với quyền Manager, ta có thể Duyệt luôn (Nếu UI hiển thị nút Duyệt)
    // Lưu ý: Hiện tại UI detail có vẻ đang logic hóa nút extra.
    // Theo logic frontend, trạng thái APPROVED xong phải CONFIRMED.
    await request.put(`http://localhost:8080/api/v1/sales-orders/b2c/${orderId}/status?status=CONFIRMED`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await page.reload();

    // --- BƯỚC 5: TẠO HỢP ĐỒNG (CONTRACT) ---
    console.log('Step 5: Creating Contract...');
    const createContractBtn = page.getByRole('button', { name: /Tạo hợp đồng/i });
    await expect(createContractBtn).toBeVisible();
    await createContractBtn.click();
    
    // Điền form hợp đồng (Ant Design Pro Form)
    // Giả sử có nút "Tạo từ mẫu" cho nhanh
    const templateBtn = page.getByRole('button', { name: /Tạo từ mẫu/i });
    if (await templateBtn.isVisible()) {
        await templateBtn.click();
    } else {
        // Điền tay nếu không có mẫu
        await page.fill('input[id="terms"]', 'Hợp đồng mua bán xe điện VoltNexus');
        await page.click('button[type="submit"]');
    }
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // Ký hợp đồng
    await page.getByRole('button', { name: /Ký ngay/i }).click();
    await page.fill('textarea', 'Chữ ký điện tử của Đại lý VoltNexus');
    await page.getByRole('button', { name: 'Xác nhận ký' }).click();
    await expect(page.getByText('Hợp đồng đã được ký')).toBeVisible();

    // --- BƯỚC 6: THANH TOÁN (PAYMENT) ---
    console.log('Step 6: Payment simulation (Cash)...');
    // Điều hướng sang trang thanh toán cho Đơn hàng này
    await page.goto(`http://localhost:5173/dealer/manager/payments/pay/b2c/${orderId}`);
    
    await expect(page.getByText('Chọn Phương Thức Thanh Toán')).toBeVisible();
    await page.getByRole('button', { name: /Phương thức khác/i }).click();
    
    // Chọn Tiền mặt (Chọn mode MANUAL)
    await page.locator('select').selectOption({ label: 'Tiền mặt' });
    await page.fill('input[name="amount"]', '100000000'); // Thanh toán 100tr cọc
    await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
    
    await expect(page.getByText(/thành công/i)).toBeVisible();
    console.log('B2C Sales Flow Test Completed Successfully!');
  });

});
