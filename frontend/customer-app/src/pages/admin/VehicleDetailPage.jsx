import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, DollarSign, Battery, Zap, Users, Gauge, Activity } from 'lucide-react';
import { getVehicleDetailAdmin } from '../../services/adminVehicleService';
import { toast } from 'react-toastify';

export default function VehicleDetailPage() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    loadVehicleDetail();
  }, [variantId]);

  const loadVehicleDetail = async () => {
    try {
      setLoading(true);
      const response = await getVehicleDetailAdmin(variantId);
      if (response && response.code == 1000) {
        setVehicle(response.data);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin xe');
      console.error('Error loading vehicle detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN_PRODUCTION': { text: 'Đang sản xuất', color: 'bg-green-100 text-green-800' },
      'DISCONTINUED': { text: 'Ngừng sản xuất', color: 'bg-red-100 text-red-800' },
      'PRE_ORDER': { text: 'Đặt trước', color: 'bg-yellow-100 text-yellow-800' },
      'OUT_OF_STOCK': { text: 'Hết hàng', color: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không tìm thấy thông tin xe</p>
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/vehicles')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết xe điện</h1>
            <p className="text-gray-600">{vehicle.modelName} - {vehicle.versionName}</p>
          </div>
        </div>
        <Link
          to={`/admin/vehicles/edit/${variantId}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Edit size={20} />
          Chỉnh sửa
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src={vehicle.imageUrl || '/placeholder-car.png'}
              alt={vehicle.versionName}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-car.png';
              }}
            />
          </div>

          {/* Basic Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cơ bản</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Mã SKU</p>
                <p className="font-medium">{vehicle.skuCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Màu sắc</p>
                <p className="font-medium">{vehicle.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                {getStatusBadge(vehicle.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Số chỗ ngồi</p>
                <p className="font-medium">{vehicle.seatingCapacity || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Giá bán
            </h2>
            <div>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(vehicle.price)}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Technical Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Battery & Range */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Battery size={20} />
              Pin & Phạm vi hoạt động
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Dung lượng pin</p>
                <p className="text-xl font-bold">{vehicle.batteryCapacity || 'N/A'} kWh</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phạm vi hoạt động</p>
                <p className="text-xl font-bold">{vehicle.rangeKm || 'N/A'} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian sạc</p>
                <p className="text-xl font-bold">{vehicle.chargingTime || 'N/A'} giờ</p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Hiệu suất
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Công suất động cơ</p>
                <p className="text-xl font-bold">{vehicle.motorPower || 'N/A'} kW</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mô-men xoắn</p>
                <p className="text-xl font-bold">{vehicle.torque || 'N/A'} Nm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tăng tốc 0-100km/h</p>
                <p className="text-xl font-bold">{vehicle.acceleration || 'N/A'} giây</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tốc độ tối đa</p>
                <p className="text-xl font-bold">{vehicle.topSpeed || 'N/A'} km/h</p>
              </div>
            </div>
          </div>

          {/* Dimensions & Weight */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Kích thước & Khối lượng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Kích thước (DxRxC)</p>
                <p className="text-xl font-bold">{vehicle.dimensions || 'N/A'} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trọng lượng</p>
                <p className="text-xl font-bold">{vehicle.weight || 'N/A'} kg</p>
              </div>
            </div>
          </div>

          {/* Warranty & Description */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin bổ sung</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Bảo hành</p>
                <p className="font-medium">{vehicle.warrantyYears || 'N/A'} năm</p>
              </div>
              {vehicle.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Color Images */}
          {vehicle.colorImages && (() => {
            try {
              const colors = JSON.parse(vehicle.colorImages);
              if (colors && colors.length > 0) {
                return (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Màu sắc & Hình ảnh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {colors.map((colorItem, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                          {/* Image */}
                          <div className="relative aspect-video bg-gray-100">
                            {colorItem.imageUrl ? (
                              <img
                                src={colorItem.imageUrl}
                                alt={colorItem.color}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Chưa có hình
                              </div>
                            )}
                            {colorItem.isPrimary && (
                              <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Màu chính
                              </span>
                            )}
                          </div>
                          {/* Color Info */}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-800">{colorItem.color || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{colorItem.colorCode}</p>
                              </div>
                              {colorItem.colorCode && (
                                <div
                                  className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                                  style={{ backgroundColor: colorItem.colorCode }}
                                  title={colorItem.colorCode}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (e) {
              return null;
            }
          })()}

          {/* Audit Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Lịch sử
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium">{formatDate(vehicle.createdDate)}</p>
                {vehicle.createdBy && (
                  <p className="text-sm text-gray-500">Bởi: {vehicle.createdBy}</p>
                )}
              </div>
              {vehicle.updatedDate && (
                <div>
                  <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                  <p className="font-medium">{formatDate(vehicle.updatedDate)}</p>
                  {vehicle.updatedBy && (
                    <p className="text-sm text-gray-500">Bởi: {vehicle.updatedBy}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
