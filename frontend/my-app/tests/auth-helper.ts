import { type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Hàm này giúp tiêm SessionStorage đã lưu từ admin-session.json vào trình duyệt.
 * Phải được gọi trong beforeEach của các file test.
 */
export async function injectAdminSession(page: Page) {
    // Sử dụng process.cwd() để lấy thư mục gốc của project (frontend/my-app)
    const sessionPath = path.resolve(process.cwd(), 'playwright/.auth/admin-session.json');
    
    if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        
        // Điều hướng tới domain trước khi set sessionStorage
        await page.goto('http://localhost:5173/');
        
        await page.evaluate((data) => {
            Object.keys(data).forEach(key => {
                sessionStorage.setItem(key, data[key]);
            });
        }, sessionData);
        
        // Reload lại để ứng dụng nhận dữ liệu mới trong sessionStorage
        await page.reload();
    } else {
        console.warn('Warning: admin-session.json not found. Please run authenticate first.');
    }
}

/**
 * Tương tự cho Dealer
 */
export async function injectDealerSession(page: Page) {
    const sessionPath = path.resolve(process.cwd(), 'playwright/.auth/dealer-session.json');
    
    if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        
        await page.goto('http://localhost:5173/');
        
        await page.evaluate((data) => {
            Object.keys(data).forEach(key => {
                sessionStorage.setItem(key, data[key]);
            });
        }, sessionData);
        
        await page.reload();
    }
}
