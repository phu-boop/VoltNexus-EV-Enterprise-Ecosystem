import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye, TrendingUp, Filter, X, Save, UserPlus, Building, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getCustomerStatistics } from '../../services/customerService';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', idNumber: '',
    customerType: 'INDIVIDUAL', status: 'NEW', preferredDealerId: '', assignedStaffId: ''
  });

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { applyFiltersAndSort(); }, [searchTerm, filterStatus, filterType, sortBy, sortOrder, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
      setStatistics(await getCustomerStatistics(data));
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...customers];
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c => c.firstName?.toLowerCase().includes(search) || c.lastName?.toLowerCase().includes(search) || c.email?.toLowerCase().includes(search) || c.phone?.includes(search) || c.customerCode?.toLowerCase().includes(search));
    }
    if (filterStatus !== 'ALL') result = result.filter(c => c.status === filterStatus);
    if (filterType !== 'ALL') result = result.filter(c => c.customerType === filterType);
    result.sort((a, b) => {
      let aValue = sortBy === 'registrationDate' ? new Date(a[sortBy]) : a[sortBy];
      let bValue = sortBy === 'registrationDate' ? new Date(b[sortBy]) : b[sortBy];
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    setFilteredCustomers(result);
  };

  const handleViewDetail = async (customer) => {
    try {
      setSelectedCustomer(await getCustomerById(customer.customerId));
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết khách hàng');
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', idNumber: '', customerType: 'INDIVIDUAL', status: 'NEW', preferredDealerId: '', assignedStaffId: '' });
    setShowFormModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ firstName: customer.firstName || '', lastName: customer.lastName || '', email: customer.email || '', phone: customer.phone || '', address: customer.address || '', idNumber: customer.idNumber || '', customerType: customer.customerType || 'INDIVIDUAL', status: customer.status || 'NEW', preferredDealerId: customer.preferredDealerId || '', assignedStaffId: customer.assignedStaffId || '' });
    setShowFormModal(true);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.customerId, formData);
        toast.success('Cập nhật khách hàng thành công!');
      } else {
        await createCustomer(formData);
        toast.success('Thêm khách hàng mới thành công!');
      }
      setShowFormModal(false);
      await loadCustomers();
    } catch (error) {
      toast.error(editingCustomer ? 'Lỗi khi cập nhật khách hàng!' : 'Lỗi khi thêm khách hàng!');
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete.customerId);
      toast.success('Xóa khách hàng thành công!');
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
      await loadCustomers();
    } catch (error) {
      toast.error('Lỗi khi xóa khách hàng!');
    }
  };

  const getStatusColor = (status) => ({ 'NEW': 'bg-green-100 text-green-800', 'POTENTIAL': 'bg-yellow-100 text-yellow-800', 'PURCHASED': 'bg-blue-100 text-blue-800', 'INACTIVE': 'bg-gray-100 text-gray-800' }[status] || 'bg-gray-100 text-gray-800');
  const getStatusLabel = (status) => ({ 'NEW': 'Mới', 'POTENTIAL': 'Tiềm năng', 'PURCHASED': 'Đã mua', 'INACTIVE': 'Không hoạt động' }[status] || status);
  const getTypeLabel = (type) => ({ 'INDIVIDUAL': 'Cá nhân', 'CORPORATE': 'Doanh nghiệp' }[type] || type);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin khách hàng và lịch sử mua hàng</p>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Tổng số khách hàng</p><p className="text-3xl font-bold text-blue-600 mt-2">{statistics.total}</p></div>
              <div className="p-3 bg-blue-100 rounded-full"><Users className="text-blue-600" size={32} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Khách hàng mới</p><p className="text-3xl font-bold text-green-600 mt-2">{statistics.new}</p></div>
              <div className="p-3 bg-green-100 rounded-full"><UserPlus className="text-green-600" size={32} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Tiềm năng</p><p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.potential}</p></div>
              <div className="p-3 bg-yellow-100 rounded-full"><TrendingUp className="text-yellow-600" size={32} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Đã mua xe</p><p className="text-3xl font-bold text-purple-600 mt-2">{statistics.purchased}</p></div>
              <div className="p-3 bg-purple-100 rounded-full"><CreditCard className="text-purple-600" size={32} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Tìm kiếm theo tên, email, số điện thoại..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={20} /></button>)}
            </div>
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="ALL">Tất cả trạng thái</option><option value="NEW">Mới</option><option value="POTENTIAL">Tiềm năng</option><option value="PURCHASED">Đã mua</option><option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>
          <div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="ALL">Tất cả loại</option><option value="INDIVIDUAL">Cá nhân</option><option value="CORPORATE">Doanh nghiệp</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Filter size={18} className="text-gray-600" /><span className="text-sm text-gray-600">Hiển thị {filteredCustomers.length} / {customers.length} khách hàng</span></div>
            <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field); setSortOrder(order); }} className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="registrationDate-desc">Ngày đăng ký (Mới nhất)</option><option value="registrationDate-asc">Ngày đăng ký (Cũ nhất)</option><option value="firstName-asc">Tên (A-Z)</option><option value="firstName-desc">Tên (Z-A)</option>
            </select>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><Plus size={20} />Thêm Khách hàng</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12"><Users className="mx-auto text-gray-400 mb-3" size={48} /><p className="text-gray-600">{searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL' ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã KH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email & SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">{customer.customerType === 'CORPORATE' ? <Building className="text-blue-600" size={20} /> : <Users className="text-blue-600" size={20} />}</div>
                        <div className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1"><Mail size={14} className="text-gray-400" />{customer.email}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={14} className="text-gray-400" />{customer.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-900">{getTypeLabel(customer.customerType)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>{getStatusLabel(customer.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.registrationDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewDetail(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Xem chi tiết"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(customer)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Chỉnh sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteClick(customer)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS - Detail, Form, Delete Confirm - See next message for complete code */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-800 rounded-lg"><Users size={32} className="text-white" /></div>
                  <div><h2 className="text-2xl font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2><p className="text-blue-100">{selectedCustomer.customerCode}</p></div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition text-white"><X size={24} /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2"><h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-600">Họ</label><p className="font-medium text-gray-900">{selectedCustomer.firstName}</p></div>
                    <div><label className="text-sm text-gray-600">Tên</label><p className="font-medium text-gray-900">{selectedCustomer.lastName}</p></div>
                    <div><label className="text-sm text-gray-600 flex items-center gap-1"><Mail size={14} /> Email</label><p className="font-medium text-gray-900">{selectedCustomer.email}</p></div>
                    <div><label className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14} /> Số điện thoại</label><p className="font-medium text-gray-900">{selectedCustomer.phone || 'N/A'}</p></div>
                    <div className="col-span-2"><label className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={14} /> Địa chỉ</label><p className="font-medium text-gray-900">{selectedCustomer.address || 'N/A'}</p></div>
                    <div><label className="text-sm text-gray-600">CMND/CCCD</label><p className="font-medium text-gray-900">{selectedCustomer.idNumber || 'N/A'}</p></div>
                  </div>
                </div>
                <div className="col-span-2"><h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin hệ thống</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-600">Loại khách hàng</label><p className="font-medium text-gray-900">{getTypeLabel(selectedCustomer.customerType)}</p></div>
                    <div><label className="text-sm text-gray-600">Trạng thái</label><div><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedCustomer.status)}`}>{getStatusLabel(selectedCustomer.status)}</span></div></div>
                    <div><label className="text-sm text-gray-600 flex items-center gap-1"><Calendar size={14} /> Ngày đăng ký</label><p className="font-medium text-gray-900">{formatDate(selectedCustomer.registrationDate)}</p></div>
                    <div><label className="text-sm text-gray-600">Dealer ưu tiên</label><p className="font-medium text-gray-900">{selectedCustomer.preferredDealerId || 'N/A'}</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 bg-gray-50"><button onClick={() => setShowDetailModal(false)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Đóng</button></div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><UserPlus size={28} /><h2 className="text-2xl font-bold">{editingCustomer ? 'Chỉnh sửa Khách hàng' : 'Thêm Khách hàng Mới'}</h2></div>
                <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"><X size={24} /></button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Họ <span className="text-red-500">*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Nguyễn Văn" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Tên <span className="text-red-500">*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="A" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label><input type="email" name="email" value={formData.email} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="example@email.com" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label><input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="0912345678" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label><input type="text" name="address" value={formData.address} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="123 Đường ABC, Quận XYZ, TP. HCM" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">CMND/CCCD</label><input type="text" name="idNumber" value={formData.idNumber} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="079012345678" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Loại khách hàng <span className="text-red-500">*</span></label><select name="customerType" value={formData.customerType} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"><option value="INDIVIDUAL">Cá nhân</option><option value="CORPORATE">Doanh nghiệp</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái <span className="text-red-500">*</span></label><select name="status" value={formData.status} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"><option value="NEW">Mới</option><option value="POTENTIAL">Tiềm năng</option><option value="PURCHASED">Đã mua</option><option value="INACTIVE">Không hoạt động</option></select></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Hủy</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"><Save size={18} />{editingCustomer ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full"><Trash2 className="text-red-600" size={24} /></div>
                <div><h3 className="text-lg font-bold text-gray-800">Xác nhận xóa khách hàng</h3><p className="text-sm text-gray-600">{customerToDelete.firstName} {customerToDelete.lastName}</p></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><p className="text-yellow-800 font-medium mb-2">⚠️ Cảnh báo:</p><p className="text-yellow-700 text-sm">Xóa khách hàng sẽ xóa tất cả lịch hẹn test drive liên quan. Hành động này không thể hoàn tác!</p></div>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setCustomerToDelete(null); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Hủy</button>
                <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">Xóa khách hàng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
