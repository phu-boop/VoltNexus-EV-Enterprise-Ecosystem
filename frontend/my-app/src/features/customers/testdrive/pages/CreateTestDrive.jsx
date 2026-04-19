import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import staffService from "../../assignment/services/staffService";
import { getModelDetails, getAllModels } from "../services/vehicleService";
import { createTestDrive } from "../services/testDriveService";
import CustomerSelect from '../components/CustomerSelect';

const CreateTestDrive = () => {
  const navigate = useNavigate();
  
  // Lấy roles từ sessionStorage (là JSON array)
  const rolesString = sessionStorage.getItem('roles');
  let basePath = '/dealer/staff'; // default
  
  try {
    const roles = rolesString ? JSON.parse(rolesString) : [];
    if (roles.includes('DEALER_MANAGER')) {
      basePath = '/dealer/manager';
    } else if (roles.includes('DEALER_STAFF')) {
      basePath = '/dealer/staff';
    }
  } catch (error) {
    console.error('Error parsing roles:', error);
  }
  
  const dealerUUID = sessionStorage.getItem('dealerId') || sessionStorage.getItem('profileId') || '6c8c229d-c8f6-43d8-b2f6-01261b46baa3';

  const [formData, setFormData] = useState({
    customerId: '',
    dealerId: dealerUUID,
    modelId: '',
    variantId: '',
    staffId: '',
    appointmentDate: '',
    durationMinutes: 60,
    testDriveLocation: '',
    customerNotes: '',
    createdBy: '',
  });

  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load vehicles
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Load staff list
  useEffect(() => {
    if (dealerUUID) {
      fetchStaffList();
    }
  }, [dealerUUID]);

  // Load variants when model is selected
  useEffect(() => {
    if (formData.modelId) {
      loadVariants(formData.modelId);
    } else {
      setVariants([]);
      setFormData(prev => ({ ...prev, variantId: '' }));
    }
  }, [formData.modelId]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await getAllModels();
      // API trả về Page object { data: { content: [...] } } hoặc plain array
      const raw = response.data;
      const modelsData = Array.isArray(raw) ? raw : (raw?.content ?? []);
      setVehicles(modelsData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Không thể tải danh sách xe");
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      const data = await staffService.getStaffByDealerId(dealerUUID);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      toast.error("Không thể tải danh sách nhân viên");
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadVariants = async (modelId) => {
    setLoadingVariants(true);
    try {
      const response = await getModelDetails(modelId);
      setVariants(response.data?.variants || []);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Không thể tải danh sách phiên bản");
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerId) newErrors.customerId = 'Vui lòng chọn khách hàng';
    if (!formData.modelId) newErrors.modelId = 'Vui lòng chọn mẫu xe';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Vui lòng chọn thời gian';
    if (!formData.testDriveLocation) newErrors.testDriveLocation = 'Vui lòng nhập địa điểm';
    if (formData.durationMinutes < 15) newErrors.durationMinutes = 'Thời lượng tối thiểu 15 phút';

    const selectedDate = new Date(formData.appointmentDate);
    const now = new Date();
    if (selectedDate <= now) {
      newErrors.appointmentDate = 'Thời gian phải trong tương lai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedVehicle = vehicles.find(v => v.modelId === parseInt(formData.modelId));
      const vehicleModelName = selectedVehicle?.modelName || '';
      
      const selectedVariant = variants.find(v => v.variantId === parseInt(formData.variantId));
      const vehicleVariantName = selectedVariant 
        ? `${selectedVariant.versionName} (${selectedVariant.color})`
        : '';
      
      const selectedStaff = staffList.find(s => s.staffId === formData.staffId);
      const staffName = selectedStaff
        ? `${selectedStaff.fullName || selectedStaff.name || 'Unknown'} (${selectedStaff.email})`
        : '';
      
      const submitData = {
        ...formData,
        vehicleModelName,
        vehicleVariantName,
        staffName,
      };
      
      if (!submitData.staffId) {
        delete submitData.staffId;
        delete submitData.staffName;
      }
      
      if (!submitData.createdBy) {
        delete submitData.createdBy;
      }
      
      await createTestDrive(submitData);
      toast.success("Tạo lịch hẹn lái thử thành công!");
      navigate(`${basePath}/testdrives`);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.message || "Không thể tạo lịch hẹn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`${basePath}/testdrives`)}
                className="mr-4 p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Tạo Lịch Hẹn Lái Thử
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">Nhập thông tin lịch hẹn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Customer Info Section */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                Thông Tin Khách Hàng
              </h3>
              <CustomerSelect
                value={formData.customerId}
                onChange={(customerId) => {
                  setFormData(prev => ({ ...prev, customerId }));
                  if (errors.customerId) {
                    setErrors(prev => ({ ...prev, customerId: '' }));
                  }
                }}
                error={errors.customerId}
              />
            </div>

            {/* Vehicle Section */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                Thông Tin Xe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mẫu xe <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleChange}
                    disabled={loadingVehicles}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.modelId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn mẫu xe --</option>
                    {(Array.isArray(vehicles) ? vehicles : []).map(vehicle => (
                      <option key={vehicle.modelId} value={vehicle.modelId}>
                        {vehicle.modelName}
                      </option>
                    ))}
                  </select>
                  {errors.modelId && <p className="text-red-600 text-sm mt-1">{errors.modelId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên bản
                  </label>
                  <select
                    name="variantId"
                    value={formData.variantId}
                    onChange={handleChange}
                    disabled={!formData.modelId || loadingVariants}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Chọn phiên bản --</option>
                    {variants.map(variant => (
                      <option key={variant.variantId} value={variant.variantId}>
                        {variant.versionName} - {variant.color}
                      </option>
                    ))}
                  </select>
                  {loadingVariants && (
                    <p className="text-sm text-gray-500 mt-1">Đang tải...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                Thời Gian & Địa Điểm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày/Giờ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.appointmentDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.appointmentDate && <p className="text-red-600 text-sm mt-1">{errors.appointmentDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng
                  </label>
                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 phút</option>
                    <option value="60">60 phút</option>
                    <option value="90">90 phút</option>
                    <option value="120">120 phút</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm lái thử <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="testDriveLocation"
                  value={formData.testDriveLocation}
                  onChange={handleChange}
                  rows="2"
                  placeholder="VD: Showroom VinFast Hà Nội, 458 Minh Khai"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.testDriveLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.testDriveLocation && <p className="text-red-600 text-sm mt-1">{errors.testDriveLocation}</p>}
              </div>
            </div>

            {/* Staff Section */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                Nhân Viên Phụ Trách
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhân viên
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleChange}
                    disabled={loadingStaff}
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {staffList.map((staff) => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.fullName || staff.name || 'N/A'} ({staff.email})
                        {staff.position ? ` - ${staff.position}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                {loadingStaff && (
                  <p className="mt-2 text-sm text-gray-500">Đang tải danh sách nhân viên...</p>
                )}
                {!loadingStaff && staffList.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                    Không có nhân viên nào trong đại lý
                  </p>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                Ghi Chú
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú từ khách hàng
                </label>
                <textarea
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ghi chú đặc biệt từ khách hàng..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/testdrives`)}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo lịch hẹn'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestDrive;
