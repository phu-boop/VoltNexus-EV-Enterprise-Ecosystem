// Trong SalesOrderDetailPage.jsx
import React, { useState } from "react";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { Tabs, Button, Space, Alert, message, Tag, Spin } from "antd";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSalesOrders } from "../hooks/useSalesOrders";
import { useSalesContracts } from "../../salesContract/hooks/useSalesContracts";
import { useOrderItems } from "../../orderItem/hooks/useOrderItems";
import { useOrderTracking } from "../../orderTracking/hooks/useOrderTracking";
import OrderSummary from "../components/OrderSummary";
import OrderItemList from "../../orderItem/components/OrderItemList";
import TrackingTimeline from "../../orderTracking/components/TrackingTimeline";
import ContractDetails from "../../salesContract/components/ContractDetails";
import ContractSignModal from "../../salesContract/components/ContractSignModal";
import {
  ShoppingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const SalesOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Hooks với xử lý lỗi
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    recalcOrderItems,
    sendOrderForApproval,
  } = useSalesOrders();

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
  } = useOrderItems(orderId);

  const {
    trackings,
    currentStatus,
    loading: trackingLoading,
    error: trackingError,
    createTracking,
    updateTracking,
    deleteTracking,
  } = useOrderTracking(orderId);

  const {
    contract,
    loading: contractLoading,
    error: contractError,
    signContract,
    generateFromTemplate,
    createContract,
    updateContract,
    deleteContract,
  } = useSalesContracts(orderId);

  const [signModalVisible, setSignModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Tìm đơn hàng theo ID
  const order = orders.find((o) => o.orderId === orderId);

  // Xác định quyền truy cập dựa trên trạng thái - ĐÃ SỬA THEO ENUM
  const getPermissions = () => {
    const status = order?.orderStatusB2C;
    const userRoles = sessionStorage.getItem("roles") || "";
    const isManager = userRoles.includes('["DEALER_MANAGER"]');

    switch (status) {
      case "PENDING":
        return {
          canCRUDOrderItems: true,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: false,
          canApprove: isManager,
          canRecalc: true,
        };
      case "EDITED":
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: false,
          canApprove: isManager,
          canRecalc: false,
        };
      case "APPROVED":
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: false,
          canApprove: false,
          canRecalc: false,
        };
      case "CONFIRMED":
        return {
          canCRUDOrderItems: false,
          canCRUDContract: true,
          canCRUDTracking: false,
          canViewOnly: false,
          canApprove: false,
          canRecalc: false,
        };
      case "IN_PRODUCTION":
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: true,
          canViewOnly: true,
          canApprove: false,
          canRecalc: false,
        };
      case "DELIVERED":
      case "CANCELLED":
      case "REJECTED":
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: true,
          canApprove: false,
          canRecalc: false,
        };
      default:
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: true,
          canApprove: false,
          canRecalc: false,
        };
    }
  };

  const permissions = getPermissions();

  // Xử lý lỗi API
  const handleApiError = (error, defaultMessage = "Có lỗi xảy ra") => {
    console.error("API Error:", error);

    if (error?.response) {
      const { code, message: errorMessage } = error.response.data;
      if (code !== "1000") {
        message.error(errorMessage || defaultMessage);
        return;
      }
    }

    message.error(defaultMessage);
  };

  // Loading & Not Found với design đẹp hơn
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-gray-600 text-lg">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-6">
            Không thể tải thông tin đơn hàng.
          </p>
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h3>
          <p className="text-gray-500 mb-6">
            Đơn hàng với ID {orderId} không tồn tại.
          </p>
          <Button
            type="primary"
            onClick={() => navigate("/dealer/orders")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitForApproval = async () => {
    setActionLoading(true);
    try {
      // Giả sử bạn có hook hoặc API gọi sendForApproval
      const response = await sendOrderForApproval(
        orderId,
        sessionStorage.getItem("profileId")
      ); // implement API call
      if (response?.code === "1000") {
        message.success("Đơn hàng đã được gửi quản lý duyệt");
        // Có thể refresh dữ liệu để cập nhật trạng thái
        // reloadOrders(); hoặc call lại hook orders
      }
    } catch (error) {
      handleApiError(error, "Gửi quản lý duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý hợp đồng với bắt lỗi
  const handleGenerateContract = async () => {
    if (!permissions.canCRUDContract) {
      message.warning(
        "Không có quyền thao tác hợp đồng trong trạng thái hiện tại"
      );
      return;
    }

    setActionLoading(true);
    try {
      const response = await generateFromTemplate(orderId);
      if (response?.code === "1000") {
        message.success("Tạo hợp đồng từ mẫu thành công");
      } else {
        handleApiError(null, response?.message || "Tạo hợp đồng thất bại");
      }
    } catch (error) {
      handleApiError(error, "Tạo hợp đồng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateContract = () => {
    if (!permissions.canCRUDContract) {
      message.warning("Không có quyền tạo hợp đồng trong trạng thái hiện tại");
      return;
    }
    navigate(`/dealer/contracts/${contract.contractId}/edit`);
  };

  const handleSign = async (contractId, digitalSignature) => {
    setActionLoading(true);
    try {
      const response = await signContract(contractId, digitalSignature);
      if (response?.code === "1000") {
        message.success("Ký hợp đồng thành công");
        setSignModalVisible(false);
      } else {
        handleApiError(null, response?.message || "Ký hợp đồng thất bại");
      }
    } catch (error) {
      handleApiError(error, "Ký hợp đồng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý tính toán lại order items với bắt lỗi
  const handleRecalcOrderItems = async () => {
    if (!permissions.canRecalc) {
      message.warning("Không có quyền tính toán lại trong trạng thái hiện tại");
      return;
    }

    setRecalcLoading(true);
    try {
      const response = await recalcOrderItems(orderId);
      if (response?.code === "1000") {
        message.success("Tính toán lại thành công");
      } else {
      }
    } catch (error) {
    } finally {
      setRecalcLoading(false);
    }
  };

  // Xử lý tracking với bắt lỗi
  const handleCreateTracking = () => {
    if (!permissions.canCRUDTracking) {
      message.warning("Không có quyền tạo tracking trong trạng thái hiện tại");
      return;
    }
    navigate(`/dealer/orders/${orderId}/tracking`);
  };

  // Xử lý xóa với bắt lỗi
  const handleDeleteItem = async (itemId) => {
    try {
      const response = await deleteOrderItem(itemId);
      if (response?.code === "1000") {
        message.success("Xóa sản phẩm thành công");
      } else {
        handleApiError(null, response?.message || "Xóa sản phẩm thất bại");
      }
    } catch (error) {
      handleApiError(error, "Xóa sản phẩm thất bại");
    }
  };

  const handleDeleteTracking = async (trackId) => {
    try {
      const response = await deleteTracking(trackId);
      if (response?.code === "1000") {
        message.success("Xóa tracking thành công");
      } else {
        handleApiError(null, response?.message || "Xóa tracking thất bại");
      }
    } catch (error) {
      handleApiError(error, "Xóa tracking thất bại");
    }
  };

  const handleDeleteContract = async (contractId) => {
    try {
      const response = await deleteContract(contractId);
      if (response?.code === "1000") {
        message.success("Xóa hợp đồng thành công");
      } else {
        handleApiError(null, response?.message || "Xóa hợp đồng thất bại");
      }
    } catch (error) {
      handleApiError(error, "Xóa hợp đồng thất bại");
    }
  };

  return (
    <PageContainer
      header={{
        title: (
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dealer/orders")}
              className="flex items-center"
            >
              Quay lại
            </Button>
            <span>Đơn hàng #{orderId.slice(-8).toUpperCase()}</span>
          </div>
        ),
        breadcrumb: {
          items: [
            { title: "Bán hàng" },
            { title: <Link to="/dealer/orders">Đơn hàng</Link> },
            { title: `Đơn hàng #${orderId.slice(-8).toUpperCase()}` },
          ],
        },
      }}
      extra={[
        <Button
          key="submitForApproval"
          type="default"
          onClick={handleSubmitForApproval}
          disabled={order.orderStatusB2C !== "PENDING"} // Chỉ cho trạng thái chờ xử lý
          className="flex items-center bg-orange-500 hover:bg-orange-600 text-white"
        >
          Gửi quản lý duyệt
        </Button>,

        <Button
          key="contract"
          type="primary"
          icon={<FileTextOutlined />}
          onClick={handleCreateContract}
          disabled={!permissions.canCRUDContract}
          className="flex items-center bg-blue-600 hover:bg-blue-700"
        >
          Tạo hợp đồng
        </Button>,
        <Button
          key="tracking"
          icon={<BarChartOutlined />}
          onClick={handleCreateTracking}
          disabled={!permissions.canCRUDTracking}
          className="flex items-center"
        >
          Thêm tracking
        </Button>,
      ]}
      className="bg-transparent"
    >
      {/* Hiển thị trạng thái hiện tại */}
      <Alert
        message={
          <div className="flex items-center justify-between">
            <span>
              Trạng thái hiện tại:{" "}
              <Tag color={getStatusColor(order.orderStatusB2C)}>
                {getStatusLabel(order.orderStatusB2C)}
              </Tag>
            </span>
            <span className="text-sm text-gray-600">
              Ngày tạo: {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </span>
          </div>
        }
        description={getStatusDescription(order.orderStatusB2C)}
        type={getStatusType(order.orderStatusB2C)}
        showIcon
        style={{ marginBottom: 16, borderRadius: "12px" }}
      />

      {/* Hiển thị lỗi từ các API */}
      {(itemsError || trackingError || contractError) && (
        <Alert
          message="Lỗi tải dữ liệu"
          description="Một số thông tin có thể không được hiển thị đầy đủ. Vui lòng thử lại."
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: "12px" }}
        />
      )}

      {/* Thông tin đơn hàng */}
      <OrderSummary order={order} />

      <ProCard
        style={{ marginTop: 16, borderRadius: "12px" }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          defaultActiveKey="items"
          size="large"
          tabBarStyle={{ padding: "0 24px", marginBottom: 0 }}
        >
          {/* Tab sản phẩm */}
          <TabPane
            tab={
              <span className="flex items-center">
                <ShoppingOutlined />
                <span className="ml-2">Sản phẩm</span>
              </span>
            }
            key="items"
          >
            <div style={{ padding: "24px" }}>
              <Space style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  onClick={handleRecalcOrderItems}
                  loading={recalcLoading}
                  disabled={!permissions.canRecalc}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Tính toán lại
                </Button>
                {permissions.canCRUDOrderItems && (
                  <Button
                    type="default"
                    onClick={() =>
                      navigate(`/dealer/orders/${orderId}/items/create`)
                    }
                  >
                    Thêm sản phẩm
                  </Button>
                )}
              </Space>

              {itemsError ? (
                <Alert
                  message="Lỗi tải danh sách sản phẩm"
                  description={itemsError.message}
                  type="error"
                  showIcon
                />
              ) : (
                <OrderItemList
                  items={items}
                  loading={itemsLoading || recalcLoading}
                  orderId={orderId}
                  readOnly={
                    !permissions.canCRUDOrderItems || permissions.canViewOnly
                  }
                  onEdit={
                    permissions.canCRUDOrderItems
                      ? (itemId) =>
                          navigate(
                            `/dealer/orders/${orderId}/items/${itemId}/edit`
                          )
                      : undefined
                  }
                  onDelete={
                    permissions.canCRUDOrderItems ? handleDeleteItem : undefined
                  }
                />
              )}
            </div>
          </TabPane>

          {/* Tab hợp đồng */}
          <TabPane
            tab={
              <span className="flex items-center">
                <FileTextOutlined />
                <span className="ml-2">Hợp đồng</span>
              </span>
            }
            key="contract"
          >
            <div style={{ padding: "24px" }}>
              {contractError ? (
                <Alert
                  message="Lỗi tải thông tin hợp đồng"
                  description={contractError.message}
                  type="error"
                  showIcon
                />
              ) : contract ? (
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  {contract.contractStatus === "PENDING_SIGNATURE" &&
                    permissions.canCRUDContract && (
                      <Alert
                        message="Hợp đồng đang chờ ký"
                        description="Vui lòng ký hợp đồng để hoàn tất quá trình."
                        type="warning"
                        showIcon
                        action={
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => setSignModalVisible(true)}
                            loading={actionLoading}
                          >
                            Ký ngay
                          </Button>
                        }
                      />
                    )}
                  {contract.contractStatus === "SIGNED" && (
                    <Alert
                      message="Hợp đồng đã được ký"
                      description="Hợp đồng đã có hiệu lực pháp lý."
                      type="success"
                      showIcon
                    />
                  )}

                  <ContractDetails
                    contract={contract}
                    onEdit={
                      permissions.canCRUDContract
                        ? () =>
                            navigate(
                              `/dealer/contracts/${contract.contractId}/edit`
                            )
                        : undefined
                    }
                    onDownload={() =>
                      contract.contractFileUrl &&
                      window.open(contract.contractFileUrl, "_blank")
                    }
                    onSign={
                      permissions.canCRUDContract
                        ? () => setSignModalVisible(true)
                        : undefined
                    }
                    onDelete={
                      permissions.canCRUDContract
                        ? () => handleDeleteContract(contract.contractId)
                        : undefined
                    }
                    readOnly={
                      !permissions.canCRUDContract || permissions.canViewOnly
                    }
                  />
                </Space>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div className="text-gray-300 text-6xl mb-4">📄</div>
                  <p
                    style={{
                      fontSize: "16px",
                      marginBottom: "16px",
                      color: "#666",
                    }}
                  >
                    Chưa có hợp đồng cho đơn hàng này.
                  </p>
                  {permissions.canCRUDContract && (
                    <Space>
                      <Button
                        type="primary"
                        onClick={handleCreateContract}
                        size="large"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Tạo hợp đồng mới
                      </Button>
                      <Button
                        onClick={handleGenerateContract}
                        loading={contractLoading || actionLoading}
                        size="large"
                      >
                        Tạo từ mẫu
                      </Button>
                    </Space>
                  )}
                  {!permissions.canCRUDContract && (
                    <Alert
                      message="Không có quyền tạo hợp đồng"
                      description="Trạng thái đơn hàng hiện tại không cho phép tạo hoặc chỉnh sửa hợp đồng."
                      type="info"
                      showIcon
                      style={{ maxWidth: 400, margin: "0 auto" }}
                    />
                  )}
                </div>
              )}
            </div>
          </TabPane>

          {/* Tab theo dõi */}
          <TabPane
            tab={
              <span className="flex items-center">
                <BarChartOutlined />
                <span className="ml-2">Theo dõi</span>
              </span>
            }
            key="tracking"
          >
            <div style={{ padding: "24px" }}>
              {trackingError ? (
                <Alert
                  message="Lỗi tải lịch sử tracking"
                  description={trackingError.message}
                  type="error"
                  showIcon
                />
              ) : (
                <TrackingTimeline
                  trackings={trackings}
                  currentStatus={currentStatus}
                  loading={trackingLoading}
                  orderId={orderId}
                  readOnly={!permissions.canCRUDTracking}
                  onCreate={
                    permissions.canCRUDTracking
                      ? handleCreateTracking
                      : undefined
                  }
                  onEdit={
                    permissions.canCRUDTracking
                      ? (trackId) =>
                          navigate(
                            `/dealer/orders/${orderId}/tracking/${trackId}/edit`
                          )
                      : undefined
                  }
                  onDelete={
                    permissions.canCRUDTracking
                      ? handleDeleteTracking
                      : undefined
                  }
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </ProCard>

      {/* Modal ký hợp đồng */}
      {contract && (
        <ContractSignModal
          visible={signModalVisible}
          contract={contract}
          onSign={handleSign}
          onCancel={() => setSignModalVisible(false)}
          loading={contractLoading || actionLoading}
        />
      )}
    </PageContainer>
  );
};

// Helper functions
const getStatusDescription = (status) => {
  const descriptions = {
    PENDING:
      "Đơn hàng mới được tạo, chưa được duyệt. Bạn có thể thêm/sửa sản phẩm và tính toán lại giá.",
    EDITED: "Đơn hàng đã được chỉnh sửa và đang chờ quản lý duyệt.",
    APPROVED: "Đơn hàng đã được quản lý duyệt, đang chờ khách hàng xác nhận.",
    CONFIRMED: "Khách hàng đã xác nhận đơn hàng. Hãy tiến hành ký hợp đồng.",
    REJECTED: "Khách hàng đã từ chối xác nhận đơn hàng.",
    IN_PRODUCTION: "Đơn hàng đang trong quá trình sản xuất / chuẩn bị hàng.",
    DELIVERED: "Đơn hàng đã được giao thành công đến khách hàng.",
    CANCELLED: "Đơn hàng đã bị hủy (do khách hàng hoặc hệ thống).",
  };
  return descriptions[status] || "Trạng thái không xác định";
};

const getStatusType = (status) => {
  const types = {
    PENDING: "info",
    EDITED: "warning",
    APPROVED: "success",
    CONFIRMED: "success",
    REJECTED: "error",
    IN_PRODUCTION: "warning",
    DELIVERED: "success",
    CANCELLED: "error",
  };
  return types[status] || "info";
};

const getStatusColor = (status) => {
  const colors = {
    PENDING: "blue",
    EDITED: "orange",
    APPROVED: "green",
    CONFIRMED: "green",
    REJECTED: "red",
    IN_PRODUCTION: "purple",
    DELIVERED: "cyan",
    CANCELLED: "red",
  };
  return colors[status] || "default";
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "Chờ xử lý",
    EDITED: "Đã chỉnh sửa",
    APPROVED: "Đã duyệt",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Đã từ chối",
    IN_PRODUCTION: "Đang sản xuất",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
  };
  return labels[status] || status;
};

export default SalesOrderDetailPage;
