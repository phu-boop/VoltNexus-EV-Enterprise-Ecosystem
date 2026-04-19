import { useState } from 'react';
import { Filter } from 'lucide-react';

const TestDriveFilter = ({ onFilter, onReset }) => {
  const [filters, setFilters] = useState({
    statuses: [],
    startDate: '',
    endDate: '',
    customerName: '',
    location: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        statuses: checked
          ? [...prev.statuses, value]
          : prev.statuses.filter(s => s !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert dates to ISO format
    const filterData = {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate).toISOString() : null,
      endDate: filters.endDate ? new Date(filters.endDate).toISOString() : null,
    };
    onFilter(filterData);
  };

  const handleReset = () => {
    setFilters({
      statuses: [],
      startDate: '',
      endDate: '',
      customerName: '',
      location: '',
    });
    onReset();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <Filter size={20} />
          <span className="font-medium">Bộ lọc</span>
        </div>
        <span className="text-sm text-gray-500">
          {showFilters ? '▲ Ẩn' : '▼ Hiện'}
        </span>
      </button>

      {showFilters && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Status Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex flex-wrap gap-3">
              {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="statuses"
                    value={status}
                    checked={filters.statuses.includes(status)}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {status === 'SCHEDULED' && '🟠 Đã đặt lịch'}
                    {status === 'CONFIRMED' && '🟢 Đã xác nhận'}
                    {status === 'COMPLETED' && '🔵 Đã hoàn thành'}
                    {status === 'CANCELLED' && '🔴 Đã hủy'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khách hàng
            </label>
            <input
              type="text"
              name="customerName"
              value={filters.customerName}
              onChange={handleChange}
              placeholder="Tìm theo tên khách hàng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa điểm
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Tìm theo địa điểm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Áp dụng
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ↺ Đặt lại
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TestDriveFilter;
