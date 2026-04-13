import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('CRM - Quản lý Lái Thử (Dealer Manager)', () => {

  test.beforeEach(async ({ page }) => {
    // Inject SessionStorage từ file đã lưu trong dealer.setup.ts
    if (fs.existsSync('playwright/.auth/dealer-session.json')) {
        const sessionData = JSON.parse(fs.readFileSync('playwright/.auth/dealer-session.json', 'utf8'));
        await page.addInitScript((data) => {
            Object.entries(data).forEach(([key, value]) => {
                sessionStorage.setItem(key, value as string);
            });
        }, sessionData);
    }
  });

  test('Hiển thị cảnh báo lỗi nếu bỏ trống thông tin bắt buộc khi đặt lịch', async ({ page }) => {
    // Truy cập bằng quyền Dealer Manager theo cấu hình Test Suite
    await page.goto('http://localhost:5173/dealer/manager/testdrives/create');
    await expect(page).toHaveURL(/.*\/testdrives\/create$/);

    // Click thẳng vào nút Submit (Tạo lịch hẹn)
    await page.getByRole('button', { name: /Tạo lịch hẹn/i }).click();

    // Hệ thống rà soát (Validate) form và in ra màu đỏ trực tiếp ở dưới Input
    await expect(page.getByText('Vui lòng chọn mẫu xe')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn thời gian')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập địa điểm')).toBeVisible();
  });

  test('Hiển thị lỗi nếu thời gian đặt xe trong quá khứ', async ({ page }) => {
    await page.goto('http://localhost:5173/dealer/manager/testdrives/create');
    
    // Giả lập nhập Datetime sai cách (thời gian cũ)
    const pastDate = '2020-01-01T10:00';
    await page.fill('input[name="appointmentDate"]', pastDate);
    
    await page.getByRole('button', { name: /Tạo lịch hẹn/i }).click();

    // Check message lỗi đặc biệt
    await expect(page.locator('p.text-red-600', { hasText: 'Thời gian phải trong tương lai' })).toBeVisible();
  });

});
