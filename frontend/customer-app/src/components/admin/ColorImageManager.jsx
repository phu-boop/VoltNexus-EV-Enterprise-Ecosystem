import { useState } from 'react';
import { Plus, X, Upload, Check } from 'lucide-react';
import { uploadVehicleImage } from '../../services/adminVehicleService';
import { toast } from 'react-toastify';

export default function ColorImageManager({ colorImages, onChange }) {
  const [colors, setColors] = useState(() => {
    try {
      return colorImages ? JSON.parse(colorImages) : [];
    } catch {
      return [];
    }
  });

  const [uploading, setUploading] = useState(null);

  const handleAddColor = () => {
    const newColor = {
      color: '',
      colorCode: '#000000',
      imageUrl: '',
      isPrimary: colors.length === 0
    };
    const updatedColors = [...colors, newColor];
    setColors(updatedColors);
    onChange(JSON.stringify(updatedColors));
  };

  const handleRemoveColor = (index) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    // If removed primary, set first as primary
    if (colors[index].isPrimary && updatedColors.length > 0) {
      updatedColors[0].isPrimary = true;
    }
    setColors(updatedColors);
    onChange(JSON.stringify(updatedColors));
  };

  const handleColorChange = (index, field, value) => {
    const updatedColors = colors.map((c, i) => {
      if (i === index) {
        if (field === 'isPrimary' && value) {
          // Only one primary
          return { ...c, isPrimary: true };
        }
        return { ...c, [field]: value };
      }
      // Unset other primaries
      if (field === 'isPrimary' && value) {
        return { ...c, isPrimary: false };
      }
      return c;
    });
    setColors(updatedColors);
    onChange(JSON.stringify(updatedColors));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(index);
      const response = await uploadVehicleImage(file);
      if (response && response.code == 1000) {
        handleColorChange(index, 'imageUrl', response.data);
        toast.success('Upload hình ảnh thành công');
      }
    } catch (error) {
      toast.error('Không thể upload hình ảnh');
      console.error('Error uploading image:', error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Màu sắc & Hình ảnh
        </label>
        <button
          type="button"
          onClick={handleAddColor}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Thêm màu
        </button>
      </div>

      {colors.length === 0 ? (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-sm">Chưa có màu nào. Click "Thêm màu" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {colors.map((colorItem, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tên màu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={colorItem.color}
                    onChange={(e) => handleColorChange(index, 'color', e.target.value)}
                    placeholder="VD: Đỏ Ruby, Trắng Ngọc Trai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Color Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Mã màu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorItem.colorCode}
                      onChange={(e) => handleColorChange(index, 'colorCode', e.target.value)}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorItem.colorCode}
                      onChange={(e) => handleColorChange(index, 'colorCode', e.target.value)}
                      placeholder="#FF0000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hình ảnh <span className="text-red-500">*</span>
                  </label>
                  {colorItem.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={colorItem.imageUrl}
                        alt={colorItem.color}
                        className="h-32 w-auto rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleColorChange(index, 'imageUrl', '')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-xs text-gray-600 mb-2">
                        {uploading === index ? 'Đang upload...' : 'Click để chọn hình ảnh'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        disabled={uploading === index}
                        className="hidden"
                        id={`color-image-${index}`}
                      />
                      <label
                        htmlFor={`color-image-${index}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm disabled:opacity-50"
                      >
                        Chọn hình ảnh
                      </label>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Hoặc nhập URL:
                  </p>
                  <input
                    type="url"
                    value={colorItem.imageUrl}
                    onChange={(e) => handleColorChange(index, 'imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                  />
                </div>

                {/* Primary & Remove */}
                <div className="md:col-span-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colorItem.isPrimary}
                      onChange={(e) => handleColorChange(index, 'isPrimary', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Check size={16} className={colorItem.isPrimary ? 'text-green-600' : 'text-gray-400'} />
                      Màu chính (hiển thị đầu tiên)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Mẹo: Thêm nhiều màu với hình ảnh tương ứng. Khách hàng sẽ thấy bộ chọn màu trên trang chi tiết xe.
      </p>
    </div>
  );
}
