import { Page } from '@playwright/test';
import fs from 'fs';

export async function injectDealerSession(page: Page) {
  const sessionPath = 'playwright/.auth/dealer-session.json';
  if (fs.existsSync(sessionPath)) {
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    await page.addInitScript((data) => {
      Object.entries(data).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });
    }, sessionData);
  } else {
    console.warn(`Session file not found at ${sessionPath}`);
  }
}
