import PropTypes from 'prop-types';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const CustomerCard = ({ customer, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'BLOCKED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {customer.firstName} {customer.lastName}
            </h3>
            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {customer.email && (
          <div className="flex items-center text-sm text-gray-600">
            <FiMail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{customer.phone}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-start text-sm text-gray-600">
            <FiMapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(customer.id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Xem chi tiết"
        >
          <FiEye className="w-5 h-5" />
        </button>
        <button
          onClick={() => onEdit(customer.id)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(customer.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

CustomerCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CustomerCard;
