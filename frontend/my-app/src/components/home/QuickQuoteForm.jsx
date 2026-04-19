import { useState } from "react";
import { X, Download, Mail } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const QuickQuoteForm = ({ vehicle, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, vehicle });
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Tạo Báo Giá</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên khách hàng"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              required
            />
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe</label>
            <input
              type="text"
              value={vehicle?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              In PDF
            </Button>
            <Button type="button" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Gửi Email
            </Button>
            <Button type="submit">
              Lưu Báo Giá
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickQuoteForm;