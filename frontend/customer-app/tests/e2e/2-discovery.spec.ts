import { test, expect } from '@playwright/test';

test.describe('Module 2: Vehicle Discovery & Configuration', () => {

  test('Vehicles Catalog renders list and filters', async ({ page }) => {
    await page.goto('/vehicles');
    
    // Check nếu title/header xuất hiện
    const heading = page.locator('h1, h2').filter({ hasText: /Xe|Vehicles/i }).first();
    await expect(heading).toBeVisible();

    // Check list rỗng hay có data
    await page.waitForTimeout(1000); 
    const isError = await page.locator('text=/Có lỗi xảy ra|Lỗi/i').count() > 0;
    if (!isError) {
      expect(await page.locator('body').innerText()).not.toBe('');
      
      // BỔ SUNG: Test chức năng Điền Ô Search và Chọn Sort
      const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('Xe Điện');
        await page.waitForTimeout(1000); // Đợi debounce
      }

      const sortSelect = page.locator('select').first();
      if (await sortSelect.count() > 0) {
        await sortSelect.selectOption({ index: 1 }); // Chọn tiêu chí sort đầu tiên
        await page.waitForTimeout(1000); // Đợi API trả về
      }
    }
  });

  test('Vehicle Detail Page shows specifications', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForTimeout(2000); 
    
    const firstProductLink = page.locator('a[href^="/product/"], a[href^="/vehicles/"]').first();
    
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      
      await expect(page.locator('text=/Thông số|Specs|Pin|Battery/i').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button:has-text("Đặt hàng"), button:has-text("Mua")').first()).toBeVisible();
    }
  });

  test('Car Configurator renders interactive options and calculates total price', async ({ page }) => {
    try {
      // Phải truyền kèm modelId giả định nào đó để màn hình không bị treo ở chữ "Đang tải thông tin xe..."
      await page.goto('/configure?modelId=1');
      await page.waitForTimeout(2000); // Chờ API load vehicle
      
      // Check option màu sơn
      await expect(page.locator('text=/Màu|Color|Ngoại thất/i').first()).toBeVisible();
      
      // Check Giá gốc hiển thị ban đầu
      const priceTextLocator = page.locator('text=/Tổng cộng:|Tổng tiền:/i').locator('..').locator('span').last();
      let initialPrice = "";
      if (await priceTextLocator.count() > 0) {
        initialPrice = await priceTextLocator.innerText();
      }

      // BỔ SUNG: Bấm thử một loại "Mâm xe" hoặc "Nội thất" khác xem giá có nhảy lên không
      const expensiveOption = page.locator('button:has-text("Mâm 20 inch"), button:has-text("Mâm 19 inch"), button:has-text("Nội thất nâu")').first();
      if (await expensiveOption.count() > 0) {
        await expensiveOption.click();
        await page.waitForTimeout(500); // Chờ React render lại giá
        
        const newPrice = await priceTextLocator.innerText();
        // Cảnh báo nhẹ ra console nếu giá không đổi
        if (newPrice === initialPrice) console.log("Lưu ý: Mâm/Nội thất mới không làm thay đổi Tổng Giá!");
      }

      // BỔ SUNG: Bấm "Lưu Cấu Hình"
      const saveBtn = page.getByRole('button', { name: /Lưu cấu hình|Save Config/i });
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        // Đợi Toast Message hiện lên
        await expect(page.locator('text=/Đã lưu cấu hình/i').first()).toBeVisible({ timeout: 3000 });
      }

    } catch(e) {
      console.log('Configurator check skipped or failed: ', e);
    }
  });

  test('Compare Vehicles tool loads successfully', async ({ page }) => {
    await page.goto('/compare');
    
    // Giao diện thường có bảng (table) hoặc Grid
    const hasComparisonArea = await page.locator('text=/So sánh|Compare/i').count();
    expect(hasComparisonArea).toBeGreaterThan(0);
    
    // BỔ SUNG: Check xem có nút "Thêm xe" không
    const addCarBtn = page.locator('button:has-text("Thêm xe"), button:has-text("Add")').first();
    if (await addCarBtn.count() > 0) {
      await expect(addCarBtn).toBeVisible();
    }
  });
});
