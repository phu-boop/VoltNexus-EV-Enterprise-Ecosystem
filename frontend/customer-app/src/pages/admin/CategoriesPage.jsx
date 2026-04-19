import { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Car, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  TrendingUp,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { getAllBrands, getBrandStatistics, getModelsByBrand } from '../../services/categoryService';
import { getAllModels } from '../../services/adminVehicleService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('brands');
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [brandModels, setBrandModels] = useState([]);
  
  // Model CRUD states
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [formData, setFormData] = useState({
    modelName: '',
    status: 'IN_PRODUCTION',
    thumbnailUrl: '',
    baseRangeKm: '',
    baseMotorPower: '',
    baseBatteryCapacity: '',
    baseChargingTime: ''
  });
  
  // Brand CRUD states
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showEditBrandForm, setShowEditBrandForm] = useState(false);
  const [editBrandName, setEditBrandName] = useState('');
  const [showDeleteBrandConfirm, setShowDeleteBrandConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [searchTerm, brands]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [brandsData, statsData] = await Promise.all([
        getAllBrands(),
        getBrandStatistics()
      ]);
      
      
      setBrands(brandsData);
      setFilteredBrands(brandsData);
      setStatistics(statsData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu danh mục');
      console.error('[CategoriesPage] Error loading data:', error);
      console.error('[CategoriesPage] Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
      return;
    }

    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  };

  const handleViewBrandDetail = async (brand) => {
    try {
      setSelectedBrand(brand.name); // Lưu tên brand thay vì object
      const models = await getModelsByBrand(brand.name);
      setBrandModels(models);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết hãng xe');
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBrand(null);
    setBrandModels([]);
    setShowModelForm(false);
    setEditingModel(null);
  };

  // Model CRUD Handlers
  const handleAddModel = () => {
    setEditingModel(null);
    setFormData({
      modelName: '',

      status: 'IN_PRODUCTION',
      thumbnailUrl: '',
      baseRangeKm: '',
      baseMotorPower: '',
      baseBatteryCapacity: '',
      baseChargingTime: ''
    });
    setShowModelForm(true);
  };

  const handleEditModel = (model) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName || '',
      status: model.status || 'IN_PRODUCTION',
      thumbnailUrl: model.thumbnailUrl || '',
      baseRangeKm: model.baseRangeKm || '',
      baseMotorPower: model.baseMotorPower || '',
      baseBatteryCapacity: model.baseBatteryCapacity || '',
      baseChargingTime: model.baseChargingTime || ''
    });
    setShowModelForm(true);
  };

  const handleDeleteClick = (model) => {
    setModelToDelete(model);
    setShowDeleteConfirm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitModel = async (e) => {
    e.preventDefault();
    
    try {
      if (editingModel) {
        // Update existing model (brand stays the same)
        const response = await api.put(`/vehicles/vehicle-catalog/models/${editingModel.modelId}`, {
          ...formData,
          brand: selectedBrand, // Use selected brand from detail modal
          baseRangeKm: parseInt(formData.baseRangeKm) || null,
          baseMotorPower: parseInt(formData.baseMotorPower) || null,
          baseBatteryCapacity: parseInt(formData.baseBatteryCapacity) || null,
          baseChargingTime: parseFloat(formData.baseChargingTime) || null
        }, {
          headers: {
            'X-User-Email': sessionStorage.getItem('email') || 'admin@vms.com'
          }
        });

        if (response.data && response.data.code == 1000) {
          toast.success('Cập nhật model thành công');
          setShowModelForm(false);
          // Reload data
          await handleViewBrandDetail(selectedBrand);
          await loadData();
        }
      } else {
        // Create new model for current brand
        const response = await api.post('/vehicles/vehicle-catalog/models', {
          ...formData,
          brand: selectedBrand, // Use selected brand from detail modal
          baseRangeKm: parseInt(formData.baseRangeKm) || null,
          baseMotorPower: parseInt(formData.baseMotorPower) || null,
          baseBatteryCapacity: parseInt(formData.baseBatteryCapacity) || null,
          baseChargingTime: parseFloat(formData.baseChargingTime) || null,
          variants: [] // Empty variants initially
        });

        if (response.data && response.data.code == 1000) {
          toast.success('Thêm model mới thành công');
          setShowModelForm(false);
          // Reload data
          await handleViewBrandDetail(selectedBrand);
          await loadData();
        }
      }
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error(editingModel ? 'Không thể cập nhật model' : 'Không thể thêm model');
    }
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;

    try {
      const response = await api.delete(`/vehicles/vehicle-catalog/models/${modelToDelete.modelId}`, {
        headers: {
          'X-User-Email': sessionStorage.getItem('email') || 'admin@vms.com'
        }
      });

      if (response.data && response.data.code == 1000) {
        toast.success('Xóa model thành công');
        setShowDeleteConfirm(false);
        setModelToDelete(null);
        // Reload data
        await handleViewBrandDetail(selectedBrand);
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Không thể xóa model');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error('Vui lòng nhập tên hãng xe!');
      return;
    }

    try {
      // Create a placeholder model for new brand
      const response = await api.post('/vehicles/vehicle-catalog/models', {
        modelName: `${newBrandName} - Model đầu tiên`,
        brand: newBrandName,
        status: 'COMING_SOON',
        thumbnailUrl: '',
        baseRangeKm: null,
        baseMotorPower: null,
        baseBatteryCapacity: null,
        baseChargingTime: null,
        variants: []
      }, {
        headers: {
          'X-User-Email': sessionStorage.getItem('email') || 'admin@vms.com'
        }
      });

      if (response.data && response.data.code == 1000) {
        toast.success(`Thêm hãng xe "${newBrandName}" thành công!`);
        setShowBrandForm(false);
        setNewBrandName('');
        await loadData();
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Lỗi khi thêm hãng xe!');
    }
  };

  const handleEditBrandClick = () => {
    setEditBrandName(selectedBrand);
    setShowEditBrandForm(true);
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    if (!editBrandName.trim()) {
      toast.error('Vui lòng nhập tên hãng xe!');
      return;
    }

    if (editBrandName === selectedBrand) {
      toast.info('Tên hãng xe không thay đổi');
      setShowEditBrandForm(false);
      return;
    }

    try {
      // Update all models of this brand with new brand name
      const updatePromises = brandModels.map(model => 
        api.put(`/vehicles/vehicle-catalog/models/${model.modelId}`, {
          ...model,
          brand: editBrandName
        }, {
          headers: {
            'X-User-Email': sessionStorage.getItem('email') || 'admin@vms.com'
          }
        })
      );

      await Promise.all(updatePromises);
      
      toast.success(`Đổi tên hãng từ "${selectedBrand}" thành "${editBrandName}" thành công!`);
      setShowEditBrandForm(false);
      setShowDetailModal(false);
      setSelectedBrand(null);
      await loadData();
    } catch (error) {
      console.error('Error editing brand:', error);
      toast.error('Lỗi khi sửa tên hãng xe!');
    }
  };

  const handleDeleteBrandClick = () => {
    setShowDeleteBrandConfirm(true);
  };

  const handleConfirmDeleteBrand = async () => {
    try {
      // Delete all models of this brand
      const deletePromises = brandModels.map(model => 
        api.delete(`/vehicles/vehicle-catalog/models/${model.modelId}`, {
          headers: {
            'X-User-Email': sessionStorage.getItem('email') || 'admin@vms.com'
          }
        })
      );

      await Promise.all(deletePromises);
      
      toast.success(`Đã xóa hãng xe "${selectedBrand}" và ${brandModels.length} model!`);
      setShowDeleteBrandConfirm(false);
      setShowDetailModal(false);
      setSelectedBrand(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Lỗi khi xóa hãng xe!');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'IN_PRODUCTION': 'bg-green-100 text-green-800',
      'COMING_SOON': 'bg-blue-100 text-blue-800',
      'DISCONTINUED': 'bg-red-100 text-red-800',
      'OUT_OF_STOCK': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'IN_PRODUCTION': 'Đang sản xuất',
      'COMING_SOON': 'Sắp ra mắt',
      'DISCONTINUED': 'Ngưng sản xuất',
      'OUT_OF_STOCK': 'Hết hàng'
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'brands', label: 'Hãng xe', icon: Car }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
        <p className="text-gray-600">Quản lý hãng xe và dòng xe điện</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số hãng xe</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalBrands}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="text-blue-600" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số dòng xe</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statistics.totalModels}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="text-green-600" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hãng hoạt động</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{statistics.activeBrands}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'brands' && (
            <div>
              {/* Search Bar and Add Brand Button */}
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hãng xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowBrandForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                >
                  <Plus size={20} />
                  Thêm Hãng Xe
                </button>
              </div>

              {/* Brands Grid */}
              {filteredBrands.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto text-gray-400 mb-4" size={64} />
                  <p className="text-gray-600 text-lg">
                    {searchTerm ? 'Không tìm thấy hãng xe nào' : 'Chưa có hãng xe nào'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Car className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{brand.name}</h3>
                            <p className="text-sm text-gray-500">Hãng xe điện</p>
                          </div>
                        </div>
                        {brand.isActive && (
                          <CheckCircle className="text-green-500" size={24} />
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-600">Số dòng xe</span>
                          <span className="text-lg font-bold text-blue-600">{brand.modelCount}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-gray-600">Trạng thái</span>
                          <span className="text-sm font-medium text-green-600">
                            {brand.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBrandDetail(brand)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye size={18} />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 text-lg">Chức năng quản lý tính năng đang được phát triển...</p>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="text-center py-12">
              <FolderTree className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 text-lg">Chức năng quản lý tags đang được phát triển...</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBrand && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-800 rounded-lg">
                    <Car size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedBrand}</h2>
                    <p className="text-blue-100">Chi tiết hãng xe điện</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditBrandClick}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition text-white font-medium"
                  >
                    <Edit size={18} />
                    Sửa
                  </button>
                  <button
                    onClick={handleDeleteBrandClick}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium"
                  >
                    <Trash2 size={18} />
                    Xóa
                  </button>
                  <button
                    onClick={handleCloseDetailModal}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng số dòng xe</p>
                  <p className="text-3xl font-bold text-blue-600">{brandModels.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Đang sản xuất</p>
                  <p className="text-3xl font-bold text-green-600">
                    {brandModels.filter(m => m.status === 'IN_PRODUCTION').length}
                  </p>
                </div>
              </div>

              {/* Models List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Danh sách dòng xe</h3>
                  <button
                    onClick={handleAddModel}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={18} />
                    Thêm Model
                  </button>
                </div>
                
                {brandModels.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600 mb-4">Chưa có dòng xe nào</p>
                    <button
                      onClick={handleAddModel}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Thêm Model Đầu Tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brandModels.map((model) => (
                      <div
                        key={model.modelId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Car className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{model.modelName}</h4>
                            <p className="text-sm text-gray-500">ID: {model.modelId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                            {getStatusLabel(model.status)}
                          </span>
                          <button
                            onClick={() => handleEditModel(model)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(model)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={handleCloseDetailModal}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Form Modal */}
      {showModelForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car size={28} />
                  <h2 className="text-2xl font-bold">
                    {editingModel ? 'Chỉnh sửa Model' : 'Thêm Model Mới'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModelForm(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitModel} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hãng xe
                  </label>
                  <input
                    type="text"
                    value={selectedBrand}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Model sẽ được thêm vào hãng này</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="VD: VF 8, Model 3..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="IN_PRODUCTION">Đang sản xuất</option>
                    <option value="COMING_SOON">Sắp ra mắt</option>
                    <option value="DISCONTINUED">Ngưng sản xuất</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Hình ảnh
                  </label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quãng đường (km)
                  </label>
                  <input
                    type="number"
                    name="baseRangeKm"
                    value={formData.baseRangeKm}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="450"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Công suất (kW)
                  </label>
                  <input
                    type="number"
                    name="baseMotorPower"
                    value={formData.baseMotorPower}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dung lượng pin (kWh)
                  </label>
                  <input
                    type="number"
                    name="baseBatteryCapacity"
                    value={formData.baseBatteryCapacity}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian sạc (giờ)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="baseChargingTime"
                    value={formData.baseChargingTime}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="8.5"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModelForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={18} />
                  {editingModel ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && modelToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-600">Model: {modelToDelete.modelName}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa model này? Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setModelToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Form Modal */}
      {showBrandForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car size={28} />
                  <h2 className="text-2xl font-bold">Thêm Hãng Xe Mới</h2>
                </div>
                <button
                  onClick={() => {
                    setShowBrandForm(false);
                    setNewBrandName('');
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddBrand} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Hãng Xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: VinFast, Tesla, BYD..."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Hệ thống sẽ tự động tạo một model mẫu cho hãng xe này. Bạn có thể chỉnh sửa hoặc thêm model mới sau.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBrandForm(false);
                    setNewBrandName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                  Thêm Hãng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Form Modal */}
      {showEditBrandForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit size={28} />
                  <h2 className="text-2xl font-bold">Sửa Tên Hãng Xe</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditBrandForm(false);
                    setEditBrandName('');
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditBrand} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Hãng Xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="VD: VinFast, Tesla, BYD..."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Tên hãng sẽ được cập nhật cho tất cả {brandModels.length} model của hãng này.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBrandForm(false);
                    setEditBrandName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Save size={18} />
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Brand Confirmation Modal */}
      {showDeleteBrandConfirm && selectedBrand && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Xác nhận xóa hãng xe</h3>
                  <p className="text-sm text-gray-600">Hãng: {selectedBrand}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium mb-2">⚠️ Cảnh báo:</p>
                <p className="text-yellow-700 text-sm">
                  Xóa hãng xe sẽ xóa <strong>tất cả {brandModels.length} model</strong> thuộc hãng này. 
                  Hành động này không thể hoàn tác!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteBrandConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteBrand}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Xóa hãng xe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
