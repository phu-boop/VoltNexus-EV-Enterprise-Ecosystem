import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Users, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import staffService from "../../assignment/services/staffService";
import { getModelDetails, getAllModels } from "../services/vehicleService";
import { updateTestDrive, getTestDriveById } from "../services/testDriveService";
import CustomerSelect from '../components/CustomerSelect';

const EditTestDrive = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [isLoading, setIsLoading] = useState(true);

  // Load appointment data
  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

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

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await getTestDriveById(id);
      const appointment = response.data;
      
      setFormData({
        customerId: appointment.customerId || '',
        dealerId: appointment.dealerId || dealerUUID,
        modelId: appointment.modelId || '',
        variantId: appointment.variantId || '',
        staffId: appointment.staffId || '',
        appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.slice(0, 16) : '',
        durationMinutes: appointment.durationMinutes || 60,
        testDriveLocation: appointment.testDriveLocation || '',
        customerNotes: appointment.customerNotes || '',
        createdBy: appointment.createdBy || '',
      });
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast.error("Không thể tải thông tin lịch hẹn");
      navigate(`${basePath}/testdrives`);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Get vehicle model name
      const selectedVehicle = vehicles.find(v => v.modelId === parseInt(formData.modelId));
      const vehicleModelName = selectedVehicle?.modelName || '';
      
      // Get variant name with color
      const selectedVariant = variants.find(v => v.variantId === parseInt(formData.variantId));
      const vehicleVariantName = selectedVariant 
        ? `${selectedVariant.versionName} (${selectedVariant.color})`
        : '';
      
      // Get staff name
      const selectedStaff = staffList.find(s => s.staffId === formData.staffId);
      const staffName = selectedStaff
        ? `${selectedStaff.fullName || selectedStaff.name || 'Unknown'} (${selectedStaff.email})`
        : '';
      
      const submitData = {
        ...formData,
        appointmentDate: formData.appointmentDate,
        vehicleModelName,
        vehicleVariantName,
        staffName,
      };
      
      // Xóa staffId nếu không chọn (empty string không parse được thành Long)
      if (!submitData.staffId) {
        delete submitData.staffId;
        delete submitData.staffName;
      }
      
      // Xóa createdBy nếu empty
      if (!submitData.createdBy) {
        delete submitData.createdBy;
      }

      await updateTestDrive(id, submitData);
      toast.success("Cập nhật lịch hẹn thành công!");
      navigate(`${basePath}/testdrives`);
    } catch (error) {
      console.error("Error updating test drive:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật lịch hẹn");
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

  const handleBack = () => {
    navigate(`${basePath}/testdrives`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-blue-700 rounded-lg transition-colors"
                type="button"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Cập Nhật Lịch Hẹn Lái Thử
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">Chỉnh sửa thông tin lịch hẹn</p>
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
                disabled={true}
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
                    {(Array.isArray(variants) ? variants : []).map(variant => (
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
                  onClick={handleBack}
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
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập Nhật'
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

export default EditTestDrive;
