// login_test.js - CodeceptJS "Pure" Version (No Playwright-specific objects)
Feature('Login');

Scenario('login with admin@gmail.com', async ({ I }) => {
  I.amOnPage('/login');

  // Logic Bypass ReCAPTCHA dùng script injection thuần túy
  // Chúng ta giả lập đối tượng grecaptcha trên window
  I.executeScript(() => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      render: (el, opt) => {
        if (opt.callback) {
          setTimeout(() => opt.callback('mock-token'), 500);
        }
        return 0;
      },
      reset: () => {},
      execute: () => Promise.resolve('mock-token'),
      getResponse: () => 'mock-token'
    };
  });

  I.fillField('Email', 'admin@gmail.com');
  I.fillField('Password', '123123123');

  // Đợi 1 giây để mock script xử lý token (giống waitForTimeout(1000))
  I.wait(1);

  I.click('button[type="submit"]');

  // Thay vì Promise.race, CodeceptJS ưu tiên đợi phần tử thành công xuất hiện
  // Nếu có lỗi, nó sẽ fail tại bước waitForElement hoặc see
  I.waitForElement('.swal2-container', 10); 
  
  // Kiểm tra nội dung thông báo thành công hoặc URL
  const url = await I.grabCurrentUrl();
  if (url.includes('/dashboard')) {
    I.seeInCurrentUrl('/dashboard');
  } else {
    I.see('Đăng nhập thành công');
  }
});
