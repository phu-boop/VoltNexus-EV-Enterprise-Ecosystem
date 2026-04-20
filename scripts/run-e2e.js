const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Phân tích tham số từ dòng lệnh (ví dụ: `node run-e2e.js auth` -> folder = 'auth')
const args = process.argv.slice(2);
const folder = args[0] || '';

// 2. Tạo ID cho phiên chạy dựa theo Timestamp (YYYYMMDD-HHMM)
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const runFolderName = `run-${timestamp}`;

// 3. Khai báo các đường dẫn thư mục
const projectRoot = path.join(__dirname, '..');
const frontendRoot = path.join(projectRoot, 'frontend', 'my-app');
const reportBaseDir = path.join(projectRoot, 'e2e-report');
const runDir = path.join(reportBaseDir, runFolderName);
const defaultReportDir = path.join(frontendRoot, 'playwright-report');

// Hàm chạy test an toàn (không crash script khi test fail)
function runTests() {
  try {
    console.log(`\n🚀 Bắt đầu chạy Playwright test cho: ${folder || 'Toàn bộ dự án'}`);
    // Sử dụng npm exec thay vì npx để tránh npx tự tải sai phiên bản Playwright gây lỗi test.describe()
    execSync(`npm exec playwright -- test ${folder}`, { stdio: 'inherit', cwd: frontendRoot });
    console.log(`\n✅ Tất cả test cases đều PASS!`);
  } catch (error) {
    console.error(`\n⚠️ Có một số test FAILED. Tiến hành xuất report để kiểm tra lỗi...`);
  }
}

// 4. Di chuyển và đổi tên thư mục report mới sinh ra
function archiveReport() {
  if (fs.existsSync(defaultReportDir)) {
    // Tạo folder gốc e2e-report nếu chưa có
    if (!fs.existsSync(reportBaseDir)) fs.mkdirSync(reportBaseDir, { recursive: true });
    
    // Di chuyển folder playwright-report vào trong run-<timestamp>
    fs.renameSync(defaultReportDir, runDir);
    console.log(`📂 Báo cáo đã được lưu trữ an toàn tại: e2e-report/${runFolderName}`);
  } else {
    console.error("❌ Lỗi: Không tìm thấy folder playwright-report. Có thể Playwright chưa sinh ra.");
  }
}

// 5. Cập nhật Dashboard (index.html) để liệt kê lịch sử các lần chạy
function generateDashboard() {
  if (!fs.existsSync(reportBaseDir)) return;

  // Lọc chỉ lấy các folder bắt đầu bằng 'run-'
  const items = fs.readdirSync(reportBaseDir, { withFileTypes: true });
  const runFolders = items
    .filter(item => item.isDirectory() && item.name.startsWith('run-'))
    .map(item => item.name)
    .sort((a, b) => b.localeCompare(a)); // Đảo ngược để lần chạy mới nhất lên đầu

  // Sinh HTML cho từng hàng trong lịch sử
  const listHtml = runFolders.map((run, index) => {
    // Đánh dấu dòng mới nhất
    const isNewest = index === 0;
    const badge = isNewest ? `<span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">Mới nhất</span>` : '';
    
    return `
      <tr class="hover:bg-gray-50 border-b transition">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">${run.replace('run-', '')} ${badge}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
          <a href="${run}/index.html" target="_blank" class="hover:underline font-semibold text-blue-700">Xem Báo Cáo ↗</a>
        </td>
      </tr>
    `;
  }).join('');

  // Template HTML dùng TailwindCSS build sẵn qua CDN
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automation Test Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-8 font-sans antialiased">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">🔬 Playwright E2E Dashboard</h1>
                <p class="text-slate-500 mt-2">Lịch sử các lần chạy kiểm thử tự động, được phân loại theo timestamp (YYYYMMDD-HHMM).</p>
            </div>
            <div class="hidden sm:block">
               <span class="text-5xl">📊</span>
            </div>
        </div>
        
        <div class="overflow-hidden border border-slate-200 rounded-lg">
            <table class="min-w-full divide-y divide-slate-200 bg-white">
                <thead class="bg-slate-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phiên bản (Run ID)</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                    ${listHtml.length > 0 ? listHtml : '<tr><td colspan="2" class="px-6 py-4 text-center text-sm text-slate-500">Chưa có bản ghi nào.</td></tr>'}
                </tbody>
            </table>
        </div>
        <div class="mt-8 text-center text-sm text-slate-400">
            Automated by Playwright & GitHub Actions ⚡
        </div>
    </div>
</body>
</html>`;

  // Ghi đè file index.html tổng
  fs.writeFileSync(path.join(reportBaseDir, 'index.html'), html);
  console.log("📈 Dashboard đã được cập nhật thành công: e2e-report/index.html");
}

// 6. Thực thi quy trình
runTests();
archiveReport();
generateDashboard();
