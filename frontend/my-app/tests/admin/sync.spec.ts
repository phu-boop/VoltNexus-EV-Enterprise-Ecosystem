import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('System Sync & Metadata Tests', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Mock reCAPTCHA
        await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: `
                    window.grecaptcha = {
                        ready: function(cb) { cb() },
                        render: function(element, options) {
                            if (options.callback) {
                                setTimeout(() => options.callback('mock-captcha-token'), 500);
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

        // Login
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.waitForTimeout(1000);
        await page.click('button[type="submit"]');

        // Xử lý post-login: SweetAlert popup hoặc redirect trực tiếp
        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        const dashboardHeading = page.getByRole('heading', { name: 'Bảng Điều Khiển' });
        await expect(confirmBtn.or(dashboardHeading)).toBeVisible({ timeout: 30000 });

        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }
        await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 15000 });
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('ITC_5.120.1: Trigger Manual Sales Sync từ AdminDashboard', async () => {
        // Navigate đến Admin Dashboard (nơi có Quick Actions)
        await page.goto('http://localhost:5173/evm/admin/dashboard');
        
        // Đợi Dashboard load xong
        await page.waitForTimeout(3000);

        // Tìm nút "Sync Sales Data" trong QuickActionsAdmin component
        // Nút này render dưới dạng <button> với label "Sync Sales Data"
        const syncBtn = page.locator('button', { hasText: 'Sync Sales Data' });
        await expect(syncBtn).toBeVisible({ timeout: 15000 });
        await syncBtn.click();

        // Sau khi click, SweetAlert hiện lên "Đang đồng bộ..." rồi chuyển sang "Thành công"
        // Text success: "Sales data synchronization completed successfully"
        const successPopup = page.locator('.swal2-container', { hasText: 'Sales data synchronization completed successfully' });
        await expect(successPopup).toBeVisible({ timeout: 30000 });

        // Đóng popup
        const closeBtn = page.locator('.swal2-confirm');
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    });

    test('TC_5.121.1: Trigger Manual Inventory Data Sync', async () => {
        // Navigate đến trang Inventory Report (nơi có nút Sync Data)
        await page.goto('http://localhost:5173/evm/admin/reports/inventory');

        // Đợi trang load xong
        await expect(page.locator('h4', { hasText: 'Báo cáo Tồn kho & Tốc độ tiêu thụ' })).toBeVisible({ timeout: 15000 });

        // Tìm nút "Sync Data" trong InventoryReportPage (Ant Design Button)
        const syncBtn = page.locator('button', { hasText: 'Sync Data' });
        await expect(syncBtn).toBeVisible();
        await syncBtn.click();

        // Sau khi click, SweetAlert hiện lên "Đang đồng bộ..." rồi "Thành công"
        const successPopup = page.locator('.swal2-container', { hasText: 'Inventory data synchronization completed successfully' });
        await expect(successPopup).toBeVisible({ timeout: 30000 });

        // Đóng popup
        const closeBtn = page.locator('.swal2-confirm');
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    });

    test('ITC_5.122.1: Verify Backfill Page loads correctly', async () => {
        // Navigate đến trang Data Backfill (thay vì admin/settings vì route đó không tồn tại)
        await page.goto('http://localhost:5173/evm/admin/system/data-backfill');

        // Verify trang Backfill load thành công
        await expect(page).toHaveURL(/.*data-backfill/);

        // Kiểm tra tiêu đề trang
        const title = page.getByText('Công cụ Đồng bộ Dữ liệu (Backfill)');
        await expect(title).toBeVisible({ timeout: 10000 });

        // Kiểm tra 2 nút đồng bộ hiện diện
        const dealerBtn = page.getByRole('button', { name: /1\. Đồng bộ Đại lý \(Dealers\)/i });
        const vehicleBtn = page.getByRole('button', { name: /2\. Đồng bộ Xe \(Vehicles\)/i });
        await expect(dealerBtn).toBeVisible();
        await expect(vehicleBtn).toBeVisible();
    });
});
