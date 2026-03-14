import React, { useState, useEffect } from 'react';
import { useSalesOrders } from '../hooks/useSalesOrders';
import OrderStatus from '../components/OrderStatus';
import { Link } from 'react-router-dom';
import { message, Modal, DatePicker, Select, Card, Tag, Statistic, Row, Col } from 'antd';
import { 
  ExclamationCircleOutlined, 
  SearchOutlined, 
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Trang danh sách đơn hàng B2C - Phiên bản cải tiến
 */
const SalesOrderListPage = () => {
  const { orders, loading, error, fetchOrders, approveOrder } = useSalesOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingOrderId, setApprovingOrderId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    approvalStatus: 'all'
  });
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Lấy thông tin user từ session store
  const user = sessionStorage.getItem('roles');
  const userRoles = user || [];
  const isManager = userRoles.includes('["DEALER_MANAGER"]');
  const memberId = sessionStorage.getItem('memberId');

  // Áp dụng bộ lọc
  useEffect(() => {
    let result = orders;

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId?.toString().includes(searchTerm) ||
        order.quotation?.variantId?.toString().includes(searchTerm)
      );
    }

    // Lọc theo trạng thái
    if (filters.status !== 'all') {
      result = result.filter(order => order.orderStatusB2C === filters.status);
    }

    // Lọc theo trạng thái phê duyệt
    if (filters.approvalStatus !== 'all') {
      result = result.filter(order => 
        filters.approvalStatus === 'approved' ? order.managerApproval : !order.managerApproval
      );
    }

    // Lọc theo khoảng thời gian
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      result = result.filter(order => {
        const orderDate = dayjs(order.orderDate);
        return orderDate.isAfter(start.startOf('day')) && orderDate.isBefore(end.endOf('day'));
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, filters]);

  // Xử lý duyệt đơn hàng
  const handleApproveOrder = async (orderId) => {
    if (!isManager) {
      message.warning('Chỉ quản lý mới có quyền duyệt đơn hàng');
      return;
    }

    confirm({
      title: 'Xác nhận duyệt đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn duyệt đơn hàng này? Sau khi duyệt, đơn hàng sẽ chuyển sang trạng thái APPROVED.',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-blue-600 hover:bg-blue-700' },
      onOk: async () => {
        try {
          setApprovingOrderId(orderId);
          await approveOrder(orderId, memberId);
          message.success('Duyệt đơn hàng thành công');
          await fetchOrders();
        } catch (error) {
          console.error('Approve order error:', error);
          message.error('Duyệt đơn hàng thất bại');
        } finally {
          setApprovingOrderId(null);
        }
      }
    });
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      dateRange: null,
      approvalStatus: 'all'
    });
  };

  // Thống kê
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatusB2C === 'PENDING').length,
    edited: orders.filter(o => o.orderStatusB2C === 'EDITED').length,
    approved: orders.filter(o => o.orderStatusB2C === 'APPROVED').length,
    confirmed: orders.filter(o => o.orderStatusB2C === 'CONFIRMED').length,
    inProduction: orders.filter(o => o.orderStatusB2C === 'IN_PRODUCTION').length,
    delivered: orders.filter(o => o.orderStatusB2C === 'DELIVERED').length,
    cancelled: orders.filter(o => o.orderStatusB2C === 'CANCELLED').length,
    waitingApproval: orders.filter(o => !o.managerApproval).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-600 mb-6">Không thể tải danh sách đơn hàng. Vui lòng thử lại.</p>
          <button 
            onClick={fetchOrders}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Quản lý đơn hàng B2C
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý tất cả đơn hàng của đại lý</p>
            </div>
            {isManager && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <div>
                    <div className="font-semibold">Quyền: Quản lý</div>
                    <div className="text-sm opacity-90">Có thể duyệt đơn hàng</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thống kê nhanh */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6} lg={3}>
            <Card className="shadow-sm border-0 rounded-2xl hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Tổng DH"
                value={stats.total}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1f2937' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="shadow-sm border-0 rounded-2xl hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Chờ duyệt"
                value={stats.waitingApproval}
                prefix={<ExclamationCircleOutlined className="text-yellow-600" />}
                valueStyle={{ color: '#d97706' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="shadow-sm border-0 rounded-2xl hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Đã duyệt"
                value={stats.approved}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: '#059669' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="shadow-sm border-0 rounded-2xl hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Đã giao"
                value={stats.delivered}
                prefix={<CheckCircleOutlined className="text-blue-600" />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc và Search */}
        <Card className="shadow-sm border-0 rounded-2xl mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn hàng, mã khách hàng hoặc mã biến thể..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                placeholder="Trạng thái đơn hàng"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                className="min-w-[180px] h-full%"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="PENDING">Chờ xử lý</Option>
                <Option value="EDITED">Đã chỉnh sửa</Option>
                <Option value="APPROVED">Đã duyệt</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="IN_PRODUCTION">Đang sản xuất</Option>
                <Option value="DELIVERED">Đã giao</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>

              <Select
                placeholder="Phê duyệt"
                value={filters.approvalStatus}
                onChange={(value) => setFilters(prev => ({ ...prev, approvalStatus: value }))}
                className="min-w-[150px]"
              >
                <Option value="all">Tất cả</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="pending">Chờ duyệt</Option>
              </Select>

              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                className="rounded-xl"
                suffixIcon={<CalendarOutlined />}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium flex items-center gap-2 min-w-[120px] justify-center"
                >
                  <ReloadOutlined />
                  Đặt lại
                </button>
                <button
                  onClick={fetchOrders}
                  className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium flex items-center gap-2 min-w-[120px] justify-center shadow-md hover:shadow-lg"
                >
                  <ReloadOutlined />
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Danh sách đơn hàng */}
        <Card className="shadow-sm border-0 rounded-2xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-300 text-8xl mb-6">📦</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-6">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== null) 
                  ? 'Không có đơn hàng nào phù hợp với bộ lọc của bạn.' 
                  : 'Chưa có đơn hàng B2C nào được tạo.'}
              </p>
              {(searchTerm || Object.values(filters).some(f => f !== 'all' && f !== null)) && (
                <button
                  onClick={handleResetFilters}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thông tin đơn hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phê duyệt
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <OrderRow 
                      key={order.orderId} 
                      order={order} 
                      isManager={isManager}
                      onApprove={handleApproveOrder}
                      approvingOrderId={approvingOrderId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Component cho mỗi dòng đơn hàng
const OrderRow = ({ order, isManager, onApprove, approvingOrderId }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
  };

  const formatDateTime = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const canApprove = isManager && order.orderStatusB2C === 'EDITED' && !order.managerApproval;
  const isApproving = approvingOrderId === order.orderId;

  return (
    <tr className="hover:bg-blue-50 transition-all duration-200 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ShoppingCartOutlined className="text-blue-600 text-lg" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 font-mono">
              #{order.orderId.slice(-8).toUpperCase()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Biến thể: {order.quotation?.variantId}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserOutlined className="text-gray-400 mr-2" />
          <div className="text-sm font-medium text-gray-900">KH-{order.customerId}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{formatDate(order.orderDate)}</div>
        <div className="text-xs text-gray-500">{formatDateTime(order.orderDate)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <DollarOutlined className="text-green-500 mr-2" />
          <div>
            <div className="text-sm font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </div>
            {order.quotation?.discountAmount > 0 && (
              <div className="text-xs text-red-500 line-through">
                {formatCurrency(order.quotation.basePrice)}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatus status={order.orderStatusB2C} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {order.managerApproval ? (
          <Tag color="green" className="rounded-lg px-3 py-1">
            <CheckCircleOutlined className="mr-1" />
            Đã duyệt
          </Tag>
        ) : (
          <Tag color="orange" className="rounded-lg px-3 py-1">
            <ExclamationCircleOutlined className="mr-1" />
            Chờ duyệt
          </Tag>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end items-center space-x-2">
          <Link
            to={`/dealer/orders/${order.orderId}`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <EyeOutlined className="mr-2" />
            Chi tiết
          </Link>
          
          {canApprove && (
            <button
              onClick={() => onApprove(order.orderId)}
              disabled={isApproving}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md ${
                isApproving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              }`}
            >
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang duyệt...
                </>
              ) : (
                <>
                  <CheckCircleOutlined className="mr-2" />
                  Duyệt đơn
                </>
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SalesOrderListPage;