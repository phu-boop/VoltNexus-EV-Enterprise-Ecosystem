import { useState } from 'react';
import PaymentRecordsList from '../../components/admin/Payment/PaymentRecordsList';
import PaymentStatistics from '../../components/admin/Payment/PaymentStatistics';
import PaymentApprovalList from '../../components/admin/Payment/PaymentApprovalList';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState('records');

  const tabs = [
    { id: 'records', label: 'Danh sách thanh toán' },
    { id: 'statistics', label: 'Thống kê & Báo cáo' },
    { id: 'approvals', label: 'Duyệt yêu cầu' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
        <p className="text-gray-600 mt-1">Quản lý thanh toán và công nợ khách hàng</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'records' && <PaymentRecordsList />}
        {activeTab === 'statistics' && <PaymentStatistics />}
        {activeTab === 'approvals' && <PaymentApprovalList />}
      </div>
    </div>
  );
}
