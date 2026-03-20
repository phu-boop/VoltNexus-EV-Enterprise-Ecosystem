export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">VinPhust</h3>
            <p className="text-gray-400">
              Hệ thống mua bán xe điện uy tín, chất lượng
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <p className="text-gray-400">Email: support@vinphust.com</p>
            <p className="text-gray-400">Hotline: 1900-xxxx</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <p className="text-gray-400">Hướng dẫn mua hàng</p>
            <p className="text-gray-400">Chính sách bảo hành</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 VinPhust. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
