import { useState, useEffect, useRef } from "react";
import { Search, User, X, ChevronDown } from "lucide-react";
import apiConstCustomerService from "../../../../services/apiConstCustomerService";

const CustomerAutocomplete = ({ value, onChange, error, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load initial customer if value is provided
  useEffect(() => {
    if (value && !selectedCustomer) {
      loadCustomerById(value);
    }
  }, [value]);

  // Search customers with debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounce = setTimeout(() => {
        searchCustomers(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else if (searchTerm.length === 0) {
      loadAllCustomers();
    } else {
      setCustomers([]);
    }
  }, [searchTerm]);

  const loadCustomerById = async (customerId) => {
    try {
      const response = await apiConstCustomerService.get(`/${customerId}`);
      if (response.data.success) {
        setSelectedCustomer(response.data.data);
      }
    } catch (error) {
      console.error("Error loading customer:", error);
    }
  };

  const loadAllCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiConstCustomerService.get("");
      if (response.data.success) {
        setCustomers(response.data.data.slice(0, 10)); // Limit to 10
        setIsOpen(true); // ✅ Mở dropdown khi có kết quả
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (keyword) => {
    try {
      setLoading(true);

      // Use the search parameter in the main endpoint
      const response = await apiConstCustomerService.get("", {
        params: { search: keyword },
      });

      if (response.data.success) {
        const results = response.data.data.slice(0, 10);

        setCustomers(results);
        setIsOpen(true); // ✅ Mở dropdown khi có kết quả
      } else {
        console.warn("⚠️ Response not successful:", response.data);
        setCustomers([]);
      }
    } catch (error) {
      // If search fails, fallback to client-side filtering
      console.warn("⚠️ Search failed, using client-side filter:", error);
      try {
        const response = await apiConstCustomerService.get("");
        if (response.data.success) {
          const filtered = response.data.data.filter((customer) => {
            const fullName =
              `${customer.firstName} ${customer.lastName}`.toLowerCase();
            const email = (customer.email || "").toLowerCase();
            const phone = (customer.phone || "").toLowerCase();
            const search = keyword.toLowerCase();

            return (
              fullName.includes(search) ||
              email.includes(search) ||
              phone.includes(search)
            );
          });
          setCustomers(filtered.slice(0, 10));
          setIsOpen(true); // ✅ Mở dropdown khi có kết quả
        }
      } catch (fallbackError) {
        console.error("❌ Error in fallback search:", fallbackError);
        setCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    onChange(customer.customerId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    onChange("");
    setSearchTerm("");
    setCustomers([]);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (customers.length === 0 && searchTerm.length === 0) {
      loadAllCustomers();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Selected Customer Display */}
      {selectedCustomer ? (
        <div
          className={`flex items-center justify-between px-3 py-2 border rounded-lg bg-white ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div
            className="flex items-center space-x-3 flex-1"
            onClick={() => !disabled && setIsOpen(true)}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCustomer.phone} • {selectedCustomer.email}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            disabled={disabled}
            placeholder="Tìm kiếm khách hàng theo tên, email, SĐT..."
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          ) : customers.length > 0 ? (
            <ul className="py-1">
              {customers.map((customer) => (
                <li
                  key={customer.customerId}
                  onClick={() => handleSelect(customer)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {customer.phone} • {customer.email}
                      </p>
                      {customer.customerType && (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                            customer.customerType === "INDIVIDUAL"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {customer.customerType === "INDIVIDUAL"
                            ? "Cá nhân"
                            : "Doanh nghiệp"}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm.length >= 2 ? (
                <>
                  <p className="text-sm">Không tìm thấy khách hàng</p>
                  <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                </>
              ) : searchTerm.length > 0 ? (
                <p className="text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
              ) : (
                <p className="text-sm">Nhập tên, email hoặc SĐT để tìm kiếm</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerAutocomplete;
