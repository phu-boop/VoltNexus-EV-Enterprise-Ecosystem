import PropTypes from 'prop-types';
import { FiSearch, FiX } from 'react-icons/fi';

const CustomerFilter = ({ searchTerm, onSearchChange, onClearSearch }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              title="Xóa tìm kiếm"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {searchTerm && (
        <div className="mt-3 text-sm text-gray-600">
          Đang tìm kiếm: <span className="font-medium text-gray-900">&quot;{searchTerm}&quot;</span>
        </div>
      )}
    </div>
  );
};

CustomerFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
};

export default CustomerFilter;
