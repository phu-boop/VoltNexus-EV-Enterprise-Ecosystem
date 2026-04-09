// vehicle_backfill_test.js - CodeceptJS "Pure" Version (No Playwright-specific objects)
Feature('Function 110: backfillVehicleCache');

// Hook: Đăng nhập trước mỗi Scenario
Before(async ({ I }) => {
  I.amOnPage('/login');

  // Bypass reCAPTCHA bằng cách giả lập đối tượng grecaptcha trên window
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
  
  // Đợi 1 giây để mock captcha được chuẩn bị
  I.wait(1);
  I.click('button[type="submit"]');

  // Đợi cho đến khi dashboard load hoặc hiện alert thông báo
  // CodeceptJS sẽ đợi mặc định, nhưng ta có thể chỉ định rõ
  I.waitForElement('.swal2-container', 10);

  // Xử lý nút "Truy cập ngay" nếu xuất hiện trong SweetAlert
  const isPopupVisible = await I.grabNumberOfVisibleElements(locate('.swal2-container').withText('Đăng nhập thành công'));
  if (isPopupVisible > 0) {
    I.click('Truy cập ngay');
  }

  // Chốt chặn cuối cùng: Kiểm tra URL xem đã vào Dashboard chưa
  I.waitInUrl('/dashboard', 10);
});

Scenario('ITC_5.110.1 Test backfill vehicles successfully (Đồng bộ Xe thành công)', async ({ I }) => {
  // 1. Mở trang Data Backfill trực tiếp qua URL
  I.amOnPage('/evm/admin/system/data-backfill');
  I.seeInCurrentUrl('data-backfill');

  // 2. Click nút "Đồng bộ Xe (Vehicles)"
  I.seeElement(locate('button').withText('Đồng bộ Xe (Vehicles)'));
  I.click(locate('button').withText('Đồng bộ Xe (Vehicles)'));

  // 3. Kiểm tra trạng thái UI: Nút đổi thành "Đang đồng bộ..." và bị vô hiệu hóa
  // Ở bản thuần CodeceptJS, ta có thể dùng I.see để kiểm tra text và I.seeElement để kiểm tra thuộc tính
  I.waitForText('Đang đồng bộ...', 10);
  I.seeElement(locate('button').withText('Đang đồng bộ...').withAttr({ disabled: 'true' }));

  // 4. Đợi thông báo thành công xuất hiện (tối đa 120 giây như Playwright gốc)
  I.waitForText('Backfill vehicles thành công!', 120);
  I.see('Backfill vehicles thành công!');
});
