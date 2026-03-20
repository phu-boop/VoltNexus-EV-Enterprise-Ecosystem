import { useState, useEffect } from 'react';
import { Users, ChevronDown, Search, X } from 'lucide-react';
import apiConstCustomerService from '../../../../services/apiConstCustomerService';

const CustomerSelect = ({ value, onChange, error, disabled = false }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm) {
      const filtered = customers.filter(customer => {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const phone = (customer.phone || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || 
               email.includes(search) || 
               phone.includes(search);
      });
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiConstCustomerService.get('');
      
      // API trả về format: {code: '1000', message: '...', data: [...]}
      const customersData = response.data?.data || [];
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customerId) => {
    onChange(customerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const selectedCustomer = customers.find(c => c.customerId === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        👤 Khách hàng *
      </label>
      
      <div className="relative">
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        
        {/* Display selected customer or dropdown trigger */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg cursor-pointer transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-400'}`}
        >
          {selectedCustomer ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({selectedCustomer.email})
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400">-- Chọn khách hàng --</span>
          )}
        </div>

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search box */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Customer list */}
            <div className="overflow-y-auto max-h-64">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    onClick={() => handleSelect(customer.customerId)}
                    className={`px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      value === customer.customerId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span>📧 {customer.email}</span>
                      {customer.phone && <span>📞 {customer.phone}</span>}
                    </div>
                    {customer.customerType && (
                      <span className={`inline-block px-2 py-0.5 text-xs rounded mt-1 ${
                        customer.customerType === 'INDIVIDUAL' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {customer.customerType === 'INDIVIDUAL' ? '👤 Cá nhân' : '🏢 Doanh nghiệp'}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? (
                    <>
                      <p className="text-sm">Không tìm thấy khách hàng</p>
                      <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </>
                  ) : (
                    <p className="text-sm">Chưa có khách hàng nào</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer info */}
            {filteredCustomers.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                Hiển thị {filteredCustomers.length} / {customers.length} khách hàng
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerSelect;
