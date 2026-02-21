import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function GalleryImageManager({ images, onChange, title, type }) {
  const [imageList, setImageList] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Update imageList when images prop changes
  useEffect(() => {
    try {
      const parsed = images ? JSON.parse(images) : [];
      setImageList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error(`[${type}] Error parsing images:`, e);
      setImageList([]);
    }
  }, [images, type]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error('Vui lòng nhập URL hình ảnh');
      return;
    }

    const updated = [...imageList, newImageUrl.trim()];
    setImageList(updated);
    onChange(JSON.stringify(updated));
    setNewImageUrl('');
    toast.success('Đã thêm hình ảnh');
  };

  const handleRemoveImage = (index) => {
    const updated = imageList.filter((_, i) => i !== index);
    setImageList(updated);
    onChange(JSON.stringify(updated));
    toast.success('Đã xóa hình ảnh');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {title}
        </h3>
        <span className="text-sm text-gray-500">{imageList.length} hình ảnh</span>
      </div>

      {/* Add New Image */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập URL hình ảnh và nhấn Enter hoặc nút Thêm"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>

      {/* Image List */}
      {imageList.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Chưa có hình ảnh nào</p>
          <p className="text-sm">Nhập URL hình ảnh ở trên để thêm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageList.map((imageUrl, index) => (
            <div key={index} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="aspect-video relative bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`${type} ${index + 1}`}
                  className="w-full h-full object-cover relative z-10"
                  onLoad={(e) => {
                  }}
                  onError={(e) => {
                    console.error(`[${type}] Failed to load image:`, imageUrl);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Không+tải+được+ảnh';
                  }}
                />
                {/* URL Display on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate z-20">
                  {imageUrl}
                </div>
              </div>
              
              {/* Delete Button - Always visible at top right */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg z-30 transition-all hover:scale-110"
                title="Xóa hình ảnh"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Index badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-30">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
        <p className="font-medium mb-1">💡 Lưu ý:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Hình ảnh sẽ hiển thị theo thứ tự từ trái sang phải</li>
          <li>Hình ảnh đầu tiên sẽ là hình mặc định khi mở trang sản phẩm</li>
          <li>Nhấn vào biểu tượng X trên hình để xóa</li>
        </ul>
      </div>
    </div>
  );
}
