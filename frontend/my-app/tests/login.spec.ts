import { test, expect } from '@playwright/test';

test('login with admin@gmail.com', async ({ page }) => {
  // Intercept the request to Google reCAPTCHA script and fake it
  await page.route('https://www.google.com/recaptcha/api.js**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.grecaptcha = {
          ready: function(cb) { cb() },
          render: function(element, options) {
            // Automatically invoke the success callback with a mock token
            if (options.callback) {
              setTimeout(() => options.callback('mock-captcha-token'), 500);
            }
            return 0; // return fake widget id
          },
          reset: function() {},
          execute: function() { return Promise.resolve('mock-captcha-token') },
          getResponse: function() { return 'mock-captcha-token' }
        };
      `
    });
  });

  // Go to the login page
  await page.goto('http://localhost:5173/login');

  // Fill email
  await page.fill('input[name="email"]', 'admin@gmail.com');

  // Fill password
  await page.fill('input[name="password"]', '123123123');

  // Not clicking the reCAPTCHA explicitly anymore, fake script automatically sets token!
  // Wait a short moment for the captcha token to be auto-generated and state updated
  await page.waitForTimeout(1000);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for the login result (e.g., successful login redirect or alert message)
  await Promise.race([
    page.waitForURL('**/evm/admin/dashboard', { timeout: 10000 }),
    page.waitForSelector('.swal2-container', { timeout: 10000 })
  ]);

  // Check if we reached the dashboard or have the SweetAlert
  const url = page.url();
  if (url.includes('/evm/admin/dashboard')) {
    expect(url).toContain('/evm/admin/dashboard');
  } else {
    // If SweetAlert is visible, check its text
    const swalText = await page.locator('.swal2-title').textContent();
    expect(swalText).toContain('Đăng nhập thành công');
  }
});
