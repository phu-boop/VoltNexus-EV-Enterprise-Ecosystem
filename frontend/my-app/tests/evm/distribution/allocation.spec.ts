import { test, expect, type Page } from '@playwright/test';

test.describe('EVM Order Allocation', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Login as Admin/Staff
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', '123123123');
        await page.click('button[type="submit"]');

        const confirmBtn = page.getByRole('button', { name: /Truy cập ngay/i });
        await expect(confirmBtn).toBeVisible({ timeout: 15000 });
        await confirmBtn.click();
    });

    test.afterAll(async () => {
        if (page) await page.close();
    });

    test('should display allocation dashboard with status tabs', async () => {
        // Navigate to Allocation
        await page.goto('http://localhost:5173/evm/admin/distribution/allocation');

        // 1. Verify Header
        await expect(page.locator('h1', { hasText: /Điều Phối Đơn Hàng B2B/i })).toBeVisible();

        // 2. Verify Tabs
        await expect(page.getByRole('button', { name: 'Chờ Xác Nhận' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Chờ Xuất Kho' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Đang Vận Chuyển' })).toBeVisible();
    });

    test('should display empty state or order cards', async () => {
        await page.goto('http://localhost:5173/evm/admin/distribution/allocation');
        
        // Check if either list or empty state exists
        const listContainer = page.locator('.grid-cols-1');
        const emptyState = page.locator('text=Không có đơn hàng nào');
        
        await expect(listContainer.or(emptyState)).toBeVisible();
    });

    test('should verify order card details if present', async () => {
        await page.goto('http://localhost:5173/evm/admin/distribution/allocation');
        
        const firstOrder = page.locator('.group.bg-white.border-slate-200').first();
        if (await firstOrder.isVisible()) {
            await expect(firstOrder.locator('text=Mã đơn hàng')).toBeVisible();
            await expect(firstOrder.locator('text=Đại lý ủy quyền')).toBeVisible();
            await expect(firstOrder.locator('text=Lấy danh sách sản phẩm')).toBeVisible();
        }
    });
});
