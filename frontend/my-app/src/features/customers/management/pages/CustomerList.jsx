import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiUser, FiSearch, FiMail, FiPhone, FiMapPin, FiCalendar, FiEye, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiUsers } from "react-icons/fi";
import { useCustomers } from "../../hooks/useCustomers";
import AssignStaffModal from "../../assignment/components/AssignStaffModal";
import { useAuthContext } from "../../../auth/AuthProvider";

const CustomerList = () => {
  const navigate = useNavigate();
  const { roles } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Check if user is DEALER_MANAGER
  const isDealerManager = roles?.includes('DEALER_MANAGER');


  const {
    customers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    deleteCustomer: removeCustomer,
    refresh,
  } = useCustomers();

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
      const result = await removeCustomer(id);
      if (result.success) {
        toast.success("Xóa khách hàng thành công");
      } else {
        toast.error(result.error || "Không thể xóa khách hàng");
      }
    }
  };

  const base = sessionStorage.getItem('roles')?.includes('DEALER_MANAGER') 
    ? '/dealer/manager' 
    : '/dealer/staff';

  const handleView = (id) => navigate(`${base}/customers/${id}`);
  const handleEdit = (id) => navigate(`${base}/customers/${id}/edit`);
  const handleCreate = () => navigate(`${base}/customers/create`);
  
  const handleAssignStaff = (customer) => {
    setSelectedCustomer(customer);
    setAssignModalOpen(true);
  };
  
  const handleAssignSuccess = () => {
    refresh(); // Refresh customer list after assignment
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Hồ Sơ Khách Hàng
              </h1>
              <p className="text-gray-600 flex items-center">
                <FiUser className="w-4 h-4 mr-2" />
                Quản lý thông tin khách hàng của đại lý
              </p>
            </div>
            <button
              onClick={() => navigate(`${base}/customers/create`)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Thêm Khách Hàng
            </button>
          </div>
        </div>

        {/* Search Bar Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white text-base"
            />
          </div>
        </div>

        {/* Customer List Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khách hàng</h3>
            <p className="text-gray-500">Bắt đầu bằng cách thêm khách hàng đầu tiên</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thông tin khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Loại KH
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái & Ngày ĐK
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.customerId || customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {customer.firstName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{customer.firstName} {customer.lastName}</div>
                            <div className="text-sm text-gray-500">{customer.customerCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          customer.customerType === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' :
                          customer.customerType === 'CORPORATE' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.customerType === 'INDIVIDUAL' ? 'Cá nhân' :
                           customer.customerType === 'CORPORATE' ? 'Doanh nghiệp' :
                           customer.customerType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.registrationDate ? new Date(customer.registrationDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            customer.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                            customer.status === 'POTENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                            customer.status === 'PURCHASED' ? 'bg-green-100 text-green-800' :
                            customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                            // Fallback for old statuses
                            customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {customer.status === 'NEW' ? 'Khách hàng mới' :
                             customer.status === 'POTENTIAL' ? 'Tiềm năng' :
                             customer.status === 'PURCHASED' ? 'Đã mua xe' :
                             customer.status === 'INACTIVE' ? 'Không hoạt động' :
                             // Fallback for old statuses
                             customer.status === 'ACTIVE' ? 'Hoạt động' :
                             customer.status === 'BLOCKED' ? 'Bị khóa' :
                             customer.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(customer.customerId || customer.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Xem chi tiết"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button
                              onClick={() => isDealerManager && handleAssignStaff(customer)}
                              disabled={!isDealerManager}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDealerManager
                                  ? 'text-purple-600 hover:bg-purple-50 cursor-pointer'
                                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              }`}
                              title={isDealerManager ? "Phân công nhân viên" : ""}
                            >
                              <FiUsers className="w-4 h-4" />
                            </button>
                            
                            {/* Tooltip for Staff role */}
                            {!isDealerManager && (
                              <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                Chỉ Manager mới có quyền phân công
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleEdit(customer.customerId || customer.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Chỉnh sửa"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.customerId || customer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {paginatedCustomers.map((customer) => (
                <div key={customer.customerId || customer.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{customer.firstName} {customer.lastName}</h3>
                        <p className="text-sm text-gray-500 mb-2">{customer.customerCode}</p>
                        
                        {/* Customer Type Badge */}
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full mr-2 ${
                          customer.customerType === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' :
                          customer.customerType === 'CORPORATE' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.customerType === 'INDIVIDUAL' ? 'Cá nhân' :
                           customer.customerType === 'CORPORATE' ? 'Doanh nghiệp' :
                           customer.customerType || 'N/A'}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                          customer.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          customer.status === 'POTENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          customer.status === 'PURCHASED' ? 'bg-green-100 text-green-800' :
                          customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {customer.status === 'NEW' ? 'Khách hàng mới' :
                           customer.status === 'POTENTIAL' ? 'Tiềm năng' :
                           customer.status === 'PURCHASED' ? 'Đã mua xe' :
                           customer.status === 'INACTIVE' ? 'Không hoạt động' :
                           customer.status === 'ACTIVE' ? 'Hoạt động' :
                           customer.status === 'BLOCKED' ? 'Bị khóa' :
                           customer.status}
                        </span>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.address}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleView(customer.customerId || customer.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer.customerId || customer.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.customerId || customer.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, customers.length)} - {Math.min(currentPage * itemsPerPage, customers.length)} của {customers.length} khách hàng
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>
      
      {/* Assign Staff Modal */}
      <AssignStaffModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        customer={selectedCustomer}
        onAssignSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default CustomerList;
