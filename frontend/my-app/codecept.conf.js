// codecept.conf.js
export const config = {
  tests: './tests/*_test.js',
  output: './output',
  helpers: {
    Playwright: { // Hoặc WebDriver, Puppeteer tùy bạn chọn
      url: 'http://localhost:5173',
      show: true,
      browser: 'chromium'
    }
  },
  include: {
    I: './steps_file.js'
  },
  name: 'my-app'
}
