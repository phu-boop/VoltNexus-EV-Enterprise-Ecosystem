import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency, calculateTotalRevenue } from "../../../dashboard/utils/calculations";
import {
  FiShoppingCart,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiArrowRight,
} from "react-icons/fi";

/**
 * My Orders Component
 * Hiển thị đơn hàng của staff
 */
const MyOrders = ({ orders = [] }) => {
  const navigate = useNavigate();

  // Phân loại orders theo trạng thái
  const ordersByStatus = useMemo(() => {
    const processing = orders.filter(order => {
      const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
      return status === "PENDING" || status === "CONFIRMED" || status === "IN_PRODUCTION" || status === "IN_TRANSIT";
    });

    const pendingApproval = orders.filter(order => {
      const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
      return status === "PENDING" || status === "EDITED";
    });

    const delivered = orders.filter(order => {
      const status = order.orderStatus || order.orderStatusB2C || order.order_status_b2c;
      return status === "DELIVERED";
    });

    return { processing, pendingApproval, delivered };
  }, [orders]);

  // Tính tổng giá trị
  const totalValue = calculateTotalRevenue(orders);

  const handleViewOrders = (status = null) => {
    navigate("/dealer/orders", { state: { filterStatus: status } });
  };

  const orderCards = [
    {
      title: "Đơn Hàng Đang Xử Lý",
      count: ordersByStatus.processing.length,
      description: "Cần theo dõi",
      icon: FiClock,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      orders: ordersByStatus.processing.slice(0, 3), // Hiển thị 3 đơn đầu tiên
      onClick: () => handleViewOrders("PROCESSING"),
    },
    {
      title: "Đơn Hàng Chờ Duyệt",
      count: ordersByStatus.pendingApproval.length,
      description: "Cần phê duyệt",
      icon: FiShoppingCart,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      orders: ordersByStatus.pendingApproval.slice(0, 3),
      onClick: () => handleViewOrders("PENDING"),
    },
    {
      title: "Đơn Hàng Đã Giao Thành Công",
      count: ordersByStatus.delivered.length,
      description: "Hoàn thành",
      icon: FiCheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      orders: ordersByStatus.delivered.slice(0, 3),
      onClick: () => handleViewOrders("DELIVERED"),
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đơn Hàng Của Tôi</h2>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <FiDollarSign className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">Tổng Giá Trị</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orderCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{card.count}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{card.title}</h3>

              {/* Orders List */}
              {card.orders.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {card.orders.map((order, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          #{order.orderId?.slice(0, 8) || order.id?.slice(0, 8) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(order.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  Không có đơn hàng
                </div>
              )}

              {/* View All Button */}
              <button
                onClick={card.onClick}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Xem tất cả
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;

