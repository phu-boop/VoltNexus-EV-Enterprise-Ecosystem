import React, { useState, useEffect } from "react";
import { FiX, FiPackage, FiChevronsRight } from "react-icons/fi";
import { shipB2BOrder } from "../services/evmSalesService";
import { validateVins, getAvailableVins } from "../services/inventoryService";
import Swal from "sweetalert2";

/**
 * Modal để EVM Staff nhập số VIN và thực hiện giao hàng.
 * @param {object} order - Toàn bộ đối tượng đơn hàng (SalesOrder)
 */
const ShipmentModal = ({ isOpen, onClose, order }) => {
  // State để lưu trữ các số VIN được nhập,
  // ví dụ: { 4: "VIN1\nVIN2", 5: "VIN3\nVIN4" }
  const [vinInputs, setVinInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cấu trúc: { 4: { "VIN123": "Lỗi A", "VIN456": "Lỗi B" }, 5: {} }
  // (key là variantId)
  const [vinErrors, setVinErrors] = useState({});
  // State báo đang kiểm tra (ví dụ: { 4: true })
  const [isVerifying, setIsVerifying] = useState({});
  // Cấu trúc: { 4: ["VIN-A", "VIN-B"], 5: ["VIN-C"] }
  const [availableVinsMap, setAvailableVinsMap] = useState({});

  useEffect(() => {
    if (isOpen && order?.orderItems) {
      // Đặt lại state
      setVinInputs({});
      setVinErrors({});
      setError("");
      setAvailableVinsMap({});

      // Gọi API cho từng item
      order.orderItems.forEach((item) => {
        fetchAvailableVins(item.variantId);
      });
    }
  }, [isOpen, order]); // Chạy lại khi modal mở hoặc đơn hàng thay đổi

  // (MỚI) Hàm helper gọi API
  const fetchAvailableVins = async (variantId) => {
    try {
      const response = await getAvailableVins(variantId);
      setAvailableVinsMap((prev) => ({
        ...prev,
        [variantId]: response.data.data || [],
      }));
    } catch (err) {
      console.error("Lỗi khi lấy VINs khả dụng:", err);
      // Đặt mảng rỗng nếu lỗi
      setAvailableVinsMap((prev) => ({ ...prev, [variantId]: [] }));
    }
  };

  // (MỚI) Hàm khi bấm vào tag VIN
  const handleVinTagClick = (variantId, vin) => {
    // Lấy text hiện tại
    const currentText = vinInputs[variantId] || "";
    // Tách thành mảng, lọc bỏ vin nếu đã có (để toggle)
    let vinsArray = currentText
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    if (vinsArray.includes(vin)) {
      // Nếu đã có -> Xóa đi
      vinsArray = vinsArray.filter((v) => v !== vin);
    } else {
      // Nếu chưa có -> Thêm vào
      vinsArray.push(vin);
    }

    // Cập nhật lại state
    handleVinChange(variantId, vinsArray.join("\n"));
  };

  // Xử lý khi nội dung textarea (danh sách VIN) thay đổi
  const handleVinChange = (variantId, textValue) => {
    setVinInputs((prev) => ({
      ...prev,
      [variantId]: textValue,
    }));
    if (vinErrors[variantId]) {
      setVinErrors((prev) => ({ ...prev, [variantId]: {} }));
    }
    setError("");
  };

  // --- Hàm kiểm tra VINs khi click ra ngoài (onBlur) ---
  const handleVinInputBlur = async (variantId) => {
    const vinText = vinInputs[variantId] || "";
    const vins = vinText
      .split("\n")
      .map((vin) => vin.trim())
      .filter(Boolean); // Lọc bỏ các dòng trống

    // Nếu không có VIN nào thì không cần kiểm tra
    if (vins.length === 0) {
      setVinErrors((prev) => ({ ...prev, [variantId]: {} })); // Xóa lỗi (nếu có)
      return;
    }

    setIsVerifying((prev) => ({ ...prev, [variantId]: true }));
    setError(""); // Xóa lỗi chung

    try {
      // Gọi API validate mới
      const response = await validateVins(vins);
      const result = response.data.data; // Lấy { invalidVins, validVins }

      // Lưu lỗi chi tiết vào state
      setVinErrors((prev) => ({
        ...prev,
        [variantId]: result.invalidVins || {},
      }));
    } catch (err) {
      // Lỗi này là lỗi hệ thống (ví dụ: service bị sập)
      const serviceError =
        err.response?.data?.message || "Lỗi máy chủ khi kiểm tra VIN";
      setError(serviceError);
      // Gán lỗi chung cho ô này để biết
      setVinErrors((prev) => ({
        ...prev,
        [variantId]: { "Lỗi hệ thống": serviceError },
      }));
    } finally {
      setIsVerifying((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  // --- Kiểm tra xem có lỗi validate nào không ---
  const hasValidationErrors = Object.values(vinErrors).some(
    (errors) => Object.keys(errors).length > 0
  );
  // Kiểm tra xem có đang verify không
  const isCurrentlyVerifying = Object.values(isVerifying).some((v) => v);

  // Hàm xử lý gửi đi
  const handleSubmitShipment = async () => {
    if (hasValidationErrors) {
      setError("Vui lòng sửa các lỗi VIN không hợp lệ trước khi giao hàng.");
      return;
    }
    if (isCurrentlyVerifying) {
      setError("Đang kiểm tra VIN, vui lòng chờ...");
      return;
    }

    setIsLoading(true);
    setError("");

    // Phân tích và xác thực dữ liệu VIN
    const items = [];
    for (const item of order.orderItems) {
      const variantId = item.variantId; // Lấy ID từ OrderItem
      const requiredQuantity = item.quantity;

      const vinText = vinInputs[variantId] || "";
      // Tách các VIN bằng cách xuống dòng, xóa các dòng trống
      const vins = vinText
        .split("\n")
        .map((vin) => vin.trim())
        .filter((vin) => vin);

      // 2. So sánh số lượng
      if (vins.length !== requiredQuantity) {
        setError(
          `Lỗi: Sản phẩm (ID: ${variantId}) yêu cầu ${requiredQuantity} VIN, nhưng bạn đã nhập ${vins.length}.`
        );
        setIsLoading(false);
        return;
      }

      items.push({ variantId, vins });
    }

    // 3. Tạo payload (ShipmentRequestDto) để gửi lên backend
    const shipmentData = {
      orderId: order.orderId,
      dealerId: order.dealerId,
      items: items,
    };

    // 4. Gọi API
    try {
      await shipB2BOrder(order.orderId, shipmentData);
      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Giao hàng đã được xác nhận thành công.",
      });
      onClose(true); // Đóng modal và báo hiệu đã giao hàng (true)
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi giao hàng");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header (Giữ nguyên) */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Xác Nhận Xuất Kho & Giao Hàng</h3>
            <p className="text-sm text-gray-500">Đơn hàng: {order.orderId}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        {/* Danh sách các xe cần nhập VIN */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {order.orderItems.map((item) => {
            const itemErrors = vinErrors[item.variantId] || {};
            const hasItemError = Object.keys(itemErrors).length > 0;
            const isItemVerifying = isVerifying[item.variantId];
            const availableVins = availableVinsMap[item.variantId] || [];
            const enteredVins = (vinInputs[item.variantId] || "")
              .split("\n")
              .filter(Boolean);
            return (
              <div key={item.variantId} className="border p-4 rounded-lg">
                {/* Thông tin item */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">
                      {item.versionName || "Tên xe..."} -{" "}
                      {item.color || "Màu..."}
                    </p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.skuCode || "..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">{item.quantity}</p>
                    <p className="text-sm text-gray-500">Chiếc</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhập {item.quantity} số VIN (mỗi VIN một dòng):
                  </label>
                  <textarea
                    value={vinInputs[item.variantId] || ""}
                    onChange={(e) =>
                      handleVinChange(item.variantId, e.target.value)
                    }
                    // --- (THÊM) Thêm onBlur ---
                    onBlur={() => handleVinInputBlur(item.variantId)}
                    rows={item.quantity > 5 ? 5 : item.quantity}
                    placeholder="Quét hoặc dán số VIN vào đây..."
                    // --- (CẬP NHẬT) Thêm className động ---
                    className={`w-full p-2 border rounded-lg font-mono text-sm ${
                      hasItemError
                        ? "border-red-500 focus:ring-red-500" // Đỏ khi lỗi
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {/* --- (CẬP NHẬT) Hiển thị trạng thái/số lượng --- */}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Đã nhập:{" "}
                      {vinInputs[item.variantId]?.split("\n").filter(Boolean)
                        .length || 0}{" "}
                      / {item.quantity}
                    </p>
                    {/* (THÊM) Hiển thị trạng thái đang kiểm tra */}
                    {isItemVerifying && (
                      <p className="text-xs text-blue-500 animate-pulse">
                        Đang kiểm tra...
                      </p>
                    )}
                  </div>
                  {/* --- (MỚI) Hiển thị VINs khả dụng --- */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      VINs khả dụng (bấm để chọn/bỏ chọn):
                    </label>
                    {availableVins.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        Không tìm thấy VIN khả dụng.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded">
                        {availableVins.map((vin) => {
                          // Kiểm tra xem VIN này đã được chọn chưa
                          const isSelected = enteredVins.includes(vin);
                          return (
                            <button
                              key={vin}
                              type="button"
                              onClick={() =>
                                handleVinTagClick(item.variantId, vin)
                              }
                              className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              {vin}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* --- (THÊM) Khu vực hiển thị lỗi chi tiết --- */}
                  {hasItemError && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      <p className="font-bold">VIN không hợp lệ:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {/* Chỉ hiển thị 5 lỗi đầu tiên */}
                        {Object.entries(itemErrors)
                          .slice(0, 5)
                          .map(([vin, msg]) => (
                            <li key={vin}>
                              <strong className="font-mono">{vin}:</strong>{" "}
                              {msg}
                            </li>
                          ))}
                        {Object.keys(itemErrors).length > 5 && (
                          <li className="italic">
                            ... và {Object.keys(itemErrors).length - 5} lỗi
                            khác.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  {/* ----------------------------------------------------------------- */}
                </div>
              </div>
            );
          })}
          {error && (
            <p className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmitShipment}
            disabled={isLoading || hasValidationErrors || isCurrentlyVerifying}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang xử lý..." : "Xác Nhận Giao Hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentModal;
