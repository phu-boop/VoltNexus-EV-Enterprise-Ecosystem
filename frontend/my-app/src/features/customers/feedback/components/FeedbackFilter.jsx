import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { COMPLAINT_TYPES, COMPLAINT_SEVERITIES, COMPLAINT_STATUSES } from '../services/feedbackService';

const FeedbackFilter = ({ onFilter, onCancel }) => {
  const [filterData, setFilterData] = useState({
    status: '',
    severity: '',
    complaintType: '',
    assignedStaffId: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (field, value) => {
    setFilterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    // Remove empty fields
    const cleanedFilter = {};
    Object.keys(filterData).forEach(key => {
      if (filterData[key]) {
        cleanedFilter[key] = filterData[key];
      }
    });
    onFilter(cleanedFilter);
  };

  const handleReset = () => {
    setFilterData({
      status: '',
      severity: '',
      complaintType: '',
      assignedStaffId: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div>
      {/* Status & Severity on Same Row */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start gap-6">
          {/* Status Filter */}
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Trạng thái
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChange('status', '')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterData.status === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {Object.entries(COMPLAINT_STATUSES).map(([key, status]) => (
                <button
                  key={key}
                  onClick={() => handleChange('status', key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterData.status === key
                      ? `${status.color} shadow-md ring-2 ring-offset-1 ring-gray-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mức độ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChange('severity', '')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterData.severity === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {Object.entries(COMPLAINT_SEVERITIES).map(([key, severity]) => (
                <button
                  key={key}
                  onClick={() => handleChange('severity', key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterData.severity === key
                      ? `${severity.color} shadow-md ring-2 ring-offset-1 ring-gray-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Loại phản hồi
          </label>
          <select
            value={filterData.complaintType}
            onChange={(e) => handleChange('complaintType', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
          >
            <option value="">Tất cả</option>
            {Object.entries(COMPLAINT_TYPES).map(([key, type]) => (
              <option key={key} value={key}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Từ ngày
          </label>
          <input
            type="date"
            value={filterData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Đến ngày
          </label>
          <input
            type="date"
            value={filterData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
        >
          Đặt lại
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center font-medium"
        >
          <FiX className="w-4 h-4 mr-2" />
          Hủy
        </button>
        <button
          onClick={handleApply}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FeedbackFilter;
