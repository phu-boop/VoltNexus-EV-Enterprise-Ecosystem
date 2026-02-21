import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import {
  createVehicle,
  updateVehicle,
  getVehicleDetailAdmin,
  getAllModels,
  uploadVehicleImage
} from '../../services/adminVehicleService';
import ColorImageManager from '../../components/admin/ColorImageManager';
import GalleryImageManager from '../../components/admin/GalleryImageManager';
import { toast } from 'react-toastify';

export default function VehicleFormPage() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!variantId;

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    modelId: '',
    variantName: '',
    skuCode: '', // Add skuCode
    price: '',
    color: '',
    batteryCapacity: '',
    range: '',
    motorPower: '',
    seatingCapacity: '',
    torque: '',
    acceleration: '',
    topSpeed: '',
    chargingTime: '',
    dimensions: '',
    weight: '',
    warrantyYears: '',
    imageUrl: '',
    description: '',
    colorImages: '', // JSON string of color images
    exteriorImages: '', // JSON string for exterior images
    interiorImages: '' // JSON string for interior images
  });

  useEffect(() => {
    loadModels();
    if (isEditMode) {
      loadVehicleData();
    }
  }, [variantId]);

  const loadModels = async () => {
    try {
      const response = await getAllModels();
      if (response && response.code == 1000) {
        // Backend returns Page<ModelSummaryDto> in data
        setModels(response.data?.content || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách model');
    }
  };

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await getVehicleDetailAdmin(variantId);
      if (response && response.code == 1000) {
        const vehicle = response.data;
        setFormData({
          modelId: vehicle.modelId || '',
          variantName: vehicle.versionName || '', // Map versionName to variantName for form
          skuCode: vehicle.skuCode || '',
          price: vehicle.price || '',
          color: vehicle.color || '',
          batteryCapacity: vehicle.batteryCapacity || '',
          range: vehicle.rangeKm || '', // Map rangeKm to range for form
          motorPower: vehicle.motorPower || '',
          seatingCapacity: vehicle.seatingCapacity || '',
          torque: vehicle.torque || '',
          acceleration: vehicle.acceleration || '',
          topSpeed: vehicle.topSpeed || '',
          chargingTime: vehicle.chargingTime || '',
          dimensions: vehicle.dimensions || '',
          weight: vehicle.weight || '',
          warrantyYears: vehicle.warrantyYears || '',
          imageUrl: vehicle.imageUrl || '',
          description: vehicle.description || '',
          colorImages: vehicle.colorImages || '',
          exteriorImages: vehicle.exteriorImages || '',
          interiorImages: vehicle.interiorImages || ''
        });
      }
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      toast.error('Không thể tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadVehicleImage(file);
      if (response && response.code == 1000) {
        setFormData(prev => ({
          ...prev,
          imageUrl: response.data
        }));
        toast.success('Upload hình ảnh thành công');
      }
    } catch (error) {
      toast.error('Không thể upload hình ảnh');
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isEditMode && !formData.modelId) {
      toast.error('Vui lòng chọn model xe');
      return;
    }
    if (!formData.variantName.trim()) {
      toast.error('Vui lòng nhập tên biến thể');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    try {
      setLoading(true);

      // Common fields for both Create and Update
      const basePayload = {
        versionName: formData.variantName,
        color: formData.color || 'N/A',
        price: formData.price.toString(), // Send as string for BigDecimal
        status: 'IN_PRODUCTION',
        imageUrl: formData.imageUrl || null,
        batteryCapacity: formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : null,
        chargingTime: formData.chargingTime ? parseFloat(formData.chargingTime) : null,
        rangeKm: formData.range ? parseInt(formData.range) : null,
        motorPower: formData.motorPower ? parseInt(formData.motorPower) : null,
        // Additional technical specifications
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : null,
        torque: formData.torque ? parseInt(formData.torque) : null,
        acceleration: formData.acceleration ? parseFloat(formData.acceleration) : null,
        topSpeed: formData.topSpeed ? parseInt(formData.topSpeed) : null,
        dimensions: formData.dimensions || null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        warrantyYears: formData.warrantyYears ? parseInt(formData.warrantyYears) : null,
        description: formData.description || null,
        colorImages: formData.colorImages || null,
        exteriorImages: formData.exteriorImages || null,
        interiorImages: formData.interiorImages || null,
      };


      let response;
      if (isEditMode) {
        response = await updateVehicle(variantId, basePayload);
      } else {
        const createPayload = {
          ...basePayload,
          skuCode: formData.skuCode,
          features: []
          // modelId is in URL path, not in body
        };
        response = await createVehicle(formData.modelId, createPayload);
      }

      if (response && (response.code === "1000" || response.code === 1000 || response.code === 201 || response.code === "201")) {
        toast.success(isEditMode ? 'Cập nhật xe thành công' : 'Thêm xe mới thành công');
        setTimeout(() => {
          navigate('/admin/vehicles');
        }, 1500);
      } else {
        // Handle error response from backend
        console.error('[FORM] Unexpected response code:', response?.code);
        const errorMsg = response?.message || (isEditMode ? 'Không thể cập nhật xe' : 'Không thể thêm xe');
        toast.error(errorMsg);
      }
    } catch (error) {
      let errorMsg = isEditMode ? 'Không thể cập nhật xe' : 'Không thể thêm xe';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Yêu cầu bị timeout. Vui lòng kiểm tra kết nối và thử lại.';
      } else if (error.response) {
        // Server responded with error
        errorMsg = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response
        errorMsg = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Cập nhật thông tin xe điện' : 'Nhập thông tin xe điện mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model xe <span className="text-red-500">*</span>
              </label>
              <select
                name="modelId"
                value={formData.modelId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn model</option>
                {models.map(model => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.modelName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên biến thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="variantName"
                value={formData.variantName}
                onChange={handleInputChange}
                placeholder="VD: VF 8 Plus Extended Range"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="skuCode"
                value={formData.skuCode}
                onChange={handleInputChange}
                placeholder="VD: VF8-PLUS-001"
                required
                disabled={isEditMode} // Cannot edit SKU
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="1200000000"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số chỗ ngồi
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                placeholder="5"
                min="2"
                max="9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng pin (kWh)
              </label>
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleInputChange}
                placeholder="87.7"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phạm vi hoạt động (km)
              </label>
              <input
                type="number"
                name="range"
                value={formData.range}
                onChange={handleInputChange}
                placeholder="471"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công suất động cơ (kW)
              </label>
              <input
                type="number"
                name="motorPower"
                value={formData.motorPower}
                onChange={handleInputChange}
                placeholder="300"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô-men xoắn (Nm)
              </label>
              <input
                type="number"
                name="torque"
                value={formData.torque}
                onChange={handleInputChange}
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tăng tốc 0-100km/h (giây)
              </label>
              <input
                type="number"
                name="acceleration"
                value={formData.acceleration}
                onChange={handleInputChange}
                placeholder="5.5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tốc độ tối đa (km/h)
              </label>
              <input
                type="number"
                name="topSpeed"
                value={formData.topSpeed}
                onChange={handleInputChange}
                placeholder="200"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian sạc (giờ)
              </label>
              <input
                type="text"
                name="chargingTime"
                value={formData.chargingTime}
                onChange={handleInputChange}
                placeholder="7-8 giờ (AC), 30 phút (DC)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kích thước (mm)
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="4750 x 1934 x 1667"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trọng lượng (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="2158"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bảo hành (năm)
              </label>
              <input
                type="number"
                name="warrantyYears"
                value={formData.warrantyYears}
                onChange={handleInputChange}
                placeholder="10"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image & Description */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Hình ảnh & Mô tả</h2>

          {/* Color Images Manager */}
          <div className="mb-6">
    
            <ColorImageManager
              colorImages={formData.colorImages}
              onChange={(colorImages) => setFormData(prev => ({ ...prev, colorImages }))}
            />
          </div>

          {/* Exterior Images Manager */}
          <div className="mb-6">
            <GalleryImageManager
              images={formData.exteriorImages}
              onChange={(exteriorImages) => setFormData(prev => ({ ...prev, exteriorImages }))}
              title="Hình ảnh Ngoại thất"
              type="Ngoại thất"
            />
          </div>

          {/* Interior Images Manager */}
          <div className="mb-6">
            <GalleryImageManager
              images={formData.interiorImages}
              onChange={(interiorImages) => setFormData(prev => ({ ...prev, interiorImages }))}
              title="Hình ảnh Nội thất"
              type="Nội thất"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              placeholder="Nhập mô tả chi tiết về xe..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/vehicles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
}
