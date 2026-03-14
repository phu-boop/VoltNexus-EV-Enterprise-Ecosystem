import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiShoppingCart } from "react-icons/fi";
// Import các service
import { getAllVariantsPaginated } from "../../../evm/catalog/services/vehicleCatalogService"; // API lấy danh mục xe
import { createB2BOrder } from "../services/dealerSalesService"; // API tạo đơn hàng
import { useAuthContext } from "../../../auth/AuthProvider"; // Để lấy thông tin người dùng

const B2BOrderForm = () => {
  // Lấy thông tin người dùng (chứa email và dealerId) từ AuthContext
  // Giả sử AuthProvider của bạn lưu profileId chính là dealerId cho DEALER_MANAGER
  const { email, profileId: dealerId } = useAuthContext();

  const [allVariants, setAllVariants] = useState([]); // Danh sách xe để chọn
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // State cho "Giỏ hàng" (các xe đang chọn)
  const [orderItems, setOrderItems] = useState([]);

  // State cho việc gọi API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State cho form thêm xe
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);

  // Load danh sách xe (variants) khi component được tải
  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoadingVariants(true);
      try {
        const params = {
          page: 0,
          size: 200, // Tăng size để lấy được nhiều xe hơn cho dropdown
          sort: ["vehicleModel.modelName,asc", "versionName,asc"],
        };
        // Gọi API lấy tất cả các phiên bản xe
        const response = await getAllVariantsPaginated(params);
        setAllVariants(response.data.data.content || []);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setIsLoadingVariants(false);
      }
    };
    fetchVariants();
  }, []);

  // Hàm thêm xe vào giỏ hàng
  const handleAddItem = () => {
    if (!selectedVariantId || currentQuantity <= 0) {
      setError("Vui lòng chọn xe và nhập số lượng hợp lệ.");
      return;
    }

    const variantId = Number(selectedVariantId); // Chuyển sang số
    const quantity = Number(currentQuantity);

    // Kiểm tra xem xe đã có trong giỏ chưa
    const existingItem = orderItems.find(
      (item) => item.variantId === variantId
    );

    if (existingItem) {
      // Cập nhật số lượng
      setOrderItems(
        orderItems.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Thêm mới
      const variantDetails = allVariants.find((v) => v.variantId === variantId);
      setOrderItems([
        ...orderItems,
        {
          variantId: variantId,
          quantity: quantity,
          // Thêm thông tin hiển thị (tùy chọn)
          name: `${variantDetails.modelName} - ${variantDetails.versionName} (${variantDetails.color})`,
          sku: variantDetails.skuCode,
        },
      ]);
    }

    // Reset form
    setSelectedVariantId("");
    setCurrentQuantity(1);
    setError(null);
  };

  // Hàm xóa xe khỏi giỏ
  const handleRemoveItem = (variantId) => {
    setOrderItems(orderItems.filter((item) => item.variantId !== variantId));
  };

  // Hàm Gửi Đơn Hàng (Submit)
  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      setError("Giỏ hàng đang trống. Vui lòng thêm sản phẩm.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Chuẩn bị payload theo DTO 'CreateB2BOrderRequest'
    const orderData = {
      items: orderItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      // Backend sẽ tự lấy email và dealerId từ @RequestHeader
    };

    try {
      // Gọi API tạo đơn hàng
      await createB2BOrder(orderData);
      setSuccess(
        "Đã gửi đơn hàng thành công! Vui lòng chờ Hãng (EVM) xác nhận."
      );
      setOrderItems([]); // Xóa giỏ hàng
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gửi đơn hàng thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Tạo Đơn Đặt Hàng Xe (B2B)
      </h1>

      {/* 1. Form chọn xe */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Thêm sản phẩm vào đơn hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn xe
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              disabled={isLoadingVariants}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">
                {isLoadingVariants
                  ? "Đang tải danh mục..."
                  : "-- Chọn một phiên bản xe --"}
              </option>
              {allVariants.map((v) => (
                <option key={v.variantId} value={v.variantId}>
                  {v.modelName} - {v.versionName} ({v.color}) - (SKU:{" "}
                  {v.skuCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              min="1"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(e.target.value)}
              className="p-2 border rounded-lg w-full"
            />
          </div>
        </div>
        <button
          onClick={handleAddItem}
          disabled={!selectedVariantId || isLoadingVariants}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:bg-gray-400"
        >
          <FiPlus className="mr-2" /> Thêm vào đơn
        </button>
      </div>

      {/* 2. Giỏ hàng (Tóm tắt đơn hàng) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiShoppingCart className="mr-2" /> Đơn hàng chờ gửi
        </h2>
        {orderItems.length === 0 ? (
          <p className="text-gray-500">Chưa có sản phẩm nào trong đơn hàng.</p>
        ) : (
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.variantId}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {item.sku} | Số lượng:{" "}
                    <span className="font-bold">{item.quantity}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.variantId)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                  title="Xóa"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Thông báo và Nút Submit */}
        <div className="mt-6 border-t pt-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || orderItems.length === 0}
            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-lg disabled:bg-gray-400"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi Đơn Đặt Hàng Lên Hãng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default B2BOrderForm;
