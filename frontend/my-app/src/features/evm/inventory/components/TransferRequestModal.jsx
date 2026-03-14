import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useAuthContext } from "../../../../features/auth/AuthProvider";
import { getAllDealersList } from "../../../dealer/ordervariants/services/dealerSalesService";
import {
  createB2BOrder,
  createB2BOrderByStaff,
} from "../services/evmSalesService";

const TransferRequestModal = ({ isOpen, onClose, onSuccess, variantId }) => {
  const { email, roles } = useAuthContext();
  const isStaffOrAdmin =
    roles?.includes("EVM_STAFF") || roles?.includes("ADMIN");

  const [quantity, setQuantity] = useState("");
  const [toDealerId, setToDealerId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [dealerList, setDealerList] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setQuantity("");
      setToDealerId("");
      setNotes("");
      setError("");

      const fetchDealers = async () => {
        setIsListLoading(true);
        try {
          const response = await getAllDealersList();
          setDealerList(response.data.data || []);
        } catch (err) {
          setError("Lỗi: Không thể tải danh sách đại lý.");
        } finally {
          setIsListLoading(false);
        }
      };
      fetchDealers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // basePayload cho API /sales-orders/b2b
      const basePayload = {
        dealerId: toDealerId,
        requestedByEmail: email, // EVM Staff yêu cầu
        notes: notes,
        items: [
          {
            variantId: variantId,
            quantity: Number(quantity),
          },
        ],
      };

      if (isStaffOrAdmin) {
        if (!toDealerId) {
          setError("Vui lòng chọn đại lý nhận.");
          setIsLoading(false);
          return;
        }
        const staffPayload = { ...basePayload, dealerId: toDealerId };
        // --- GỌI HÀM MỚI ---
        await createB2BOrderByStaff(staffPayload);
        alert(
          "Đã tạo lệnh điều chuyển thành công! Vui lòng vào trang 'Điều Phối Xe' để duyệt."
        );
      } else {
        // --- GỌI HÀM CŨ ---
        await createB2BOrder(basePayload); // Dealer tự đặt, không cần dealerId trong payload
        alert("Đã tạo đơn đặt hàng thành công!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Tạo Lệnh Điều Chuyển (Đẩy)</h3>
              <p className="text-sm text-gray-500">
                Cho sản phẩm Variant ID: {variantId}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Số lượng (theo SKU)*"
              min="1"
              required
              className="p-2 border rounded-lg w-full"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đại lý nhận *
              </label>
              <select
                value={toDealerId}
                onChange={(e) => setToDealerId(e.target.value)}
                required
                disabled={isListLoading}
                className="p-2 border rounded-lg w-full"
              >
                <option value="" disabled>
                  {isListLoading ? "Đang tải..." : "-- Chọn đại lý --"}
                </option>
                {dealerList.map((dealer) => (
                  <option key={dealer.dealerId} value={dealer.dealerId}>
                    {dealer.dealerName} {/* Giả sử trường tên là dealerName */}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú (tùy chọn)"
              className="p-2 border rounded-lg w-full h-24"
            ></textarea>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white rounded-lg disabled:bg-gray-400 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Đang gửi..." : "Tạo Lệnh Điều Chuyển"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferRequestModal;
