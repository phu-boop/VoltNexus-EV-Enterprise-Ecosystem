import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
        {/* Header - Fixed */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiPackage className="text-blue-600" />
              Xác Nhận Xuất Kho & Giao Hàng
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Đơn hàng: <span className="font-mono text-gray-700">{order.orderId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Danh sách các xe cần nhập VIN - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {order.orderItems.map((item) => {
            const itemErrors = vinErrors[item.variantId] || {};
            const hasItemError = Object.keys(itemErrors).length > 0;
            const isItemVerifying = isVerifying[item.variantId];
            const availableVins = availableVinsMap[item.variantId] || [];
            const enteredVins = (vinInputs[item.variantId] || "")
              .split("\n")
              .filter(Boolean);
            return (
              <div key={item.variantId} className="border border-gray-200 p-5 rounded-xl bg-white hover:border-blue-200 transition-colors shadow-sm">
                {/* Thông tin item */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {item.versionName || "Tên xe..."}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {item.color || "Màu..."}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        SKU: {item.skuCode || "..."}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-2xl text-blue-600 leading-none">{item.quantity}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Chiếc</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nhập {item.quantity} số VIN (mỗi VIN một dòng):
                    </label>
                    <textarea
                      value={vinInputs[item.variantId] || ""}
                      onChange={(e) =>
                        handleVinChange(item.variantId, e.target.value)
                      }
                      onBlur={() => handleVinInputBlur(item.variantId)}
                      rows={item.quantity > 5 ? 5 : item.quantity}
                      placeholder="Quét hoặc dán số VIN vào đây..."
                      className={`w-full p-3 border rounded-xl font-mono text-sm transition-all focus:ring-2 outline-none ${hasItemError
                          ? "border-red-300 bg-red-50/30 focus:ring-red-200 focus:border-red-400"
                          : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"
                        }`}
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <p className={`text-xs font-medium ${enteredVins.length === item.quantity ? 'text-green-600' : 'text-gray-500'}`}>
                        Đã nhập: <span className="font-bold">{enteredVins.length}</span> / {item.quantity}
                      </p>
                      {isItemVerifying && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <p className="text-xs text-blue-500 font-medium">Đang kiểm tra...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VINs khả dụng */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      VINs có sẵn trong kho
                    </label>
                    {availableVins.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        Không tìm thấy VIN khả dụng cho mẫu xe này.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {availableVins.map((vin) => {
                          const isSelected = enteredVins.includes(vin);
                          return (
                            <button
                              key={vin}
                              type="button"
                              onClick={() =>
                                handleVinTagClick(item.variantId, vin)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all duration-200 ${isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 transform scale-105"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                }`}
                            >
                              {vin}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lỗi chi tiết */}
                  {hasItemError && (
                    <div className="text-sm text-red-600 bg-red-50/50 border border-red-100 p-4 rounded-xl">
                      <p className="font-bold flex items-center gap-2 mb-2">
                        <FiX className="text-red-500" />
                        VIN không hợp lệ:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-1">
                        {Object.entries(itemErrors)
                          .slice(0, 10)
                          .map(([vin, msg]) => (
                            <li key={vin} className="text-xs flex items-start gap-1">
                              <span className="font-mono font-bold text-red-700 whitespace-nowrap">{vin}:</span>
                              <span className="text-red-600">{msg}</span>
                            </li>
                          ))}
                      </ul>
                      {Object.keys(itemErrors).length > 10 && (
                        <p className="text-[10px] text-red-400 italic mt-2">
                          + {Object.keys(itemErrors).length - 10} lỗi khác...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <FiX className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmitShipment}
            disabled={isLoading || hasValidationErrors || isCurrentlyVerifying}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiChevronsRight />
            )}
            {isLoading ? "Đang xử lý..." : "Xác Nhận Giao Hàng"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShipmentModal;
