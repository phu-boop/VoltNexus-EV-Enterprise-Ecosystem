import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Package, Eye } from 'lucide-react';
import { getVehiclesAdmin, deleteVehicle, searchVehiclesAdmin } from '../../services/adminVehicleService';
import toast from 'react-hot-toast';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, [currentPage]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehiclesAdmin({
        page: currentPage,
        size: pageSize,
        sort: 'variantId,desc'
      });

      // Check code loosely or as string since backend returns string "1000"
      if (response && response.code == 1000) {
        setVehicles(response.data?.content || []);
        setTotalPages(response.data?.totalPages || 0);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách xe');
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadVehicles();
      return;
    }

    try {
      setLoading(true);
      const response = await searchVehiclesAdmin(searchTerm);
      if (response && response.code == 1000) {
        setVehicles(response.data?.content || []);
        setTotalPages(response.data?.totalPages || 0);
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm xe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    try {
      const response = await deleteVehicle(vehicleToDelete.variantId);
      
      if (response && response.code == 1000) {
        toast.success('Đã ngừng sản xuất xe thành công');
        setShowDeleteModal(false);
        setVehicleToDelete(null);
        // Reload page to see updated status
        setTimeout(() => {
          loadVehicles();
        }, 500);
      } else {
        toast.error(response?.message || 'Không thể xóa xe');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa xe');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockBadgeColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get primary image from colorImages or fallback to imageUrl
  const getPrimaryImage = (vehicle) => {
    try {
      if (vehicle.colorImages) {
        const colorImagesData = JSON.parse(vehicle.colorImages);
        if (colorImagesData.length > 0) {
          const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
          if (primaryColor.imageUrl) {
            return primaryColor.imageUrl;
          }
        }
      }
    } catch (e) {
      console.error("Error parsing colorImages:", e);
    }
    return vehicle.imageUrl || '/placeholder-car.png';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý xe điện</h1>
          <p className="text-gray-600">Quản lý danh sách các dòng xe và biến thể</p>
        </div>
        <Link
          to="/admin/vehicles/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Thêm xe mới
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm xe theo tên model, variant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              loadVehicles();
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Không tìm thấy xe nào</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phạm vi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.variantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getPrimaryImage(vehicle)}
                        alt={vehicle.variantName}
                        className="h-16 w-24 object-contain rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-car.png';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vehicle.versionName}</div>
                      <div className="text-sm text-gray-500">{vehicle.modelName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {formatPrice(vehicle.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.batteryCapacity} kWh
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vehicle.rangeKm} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockBadgeColor(vehicle.stockQuantity || 0)}`}>
                        {vehicle.stockQuantity || 0} xe
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/vehicles/view/${vehicle.variantId}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/vehicles/edit/${vehicle.variantId}`}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(vehicle)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận ngừng sản xuất</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn ngừng sản xuất xe <span className="font-medium">{vehicleToDelete?.versionName}</span>?
              Xe sẽ được đánh dấu là "Ngừng sản xuất" và không còn được bán.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVehicleToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Ngừng sản xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
