import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrderItems } from "../hooks/useOrderItems";
import OrderItemForm from "../components/OrderItemForm";
import { showSuccess, showError } from "../../../../../utils/notification";

/**
 * Trang tạo mới Order Item độc lập
 * Cho phép tạo order item mà không cần vào trang chi tiết order
 */
const OrderItemCreatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { createItem, validateItems, loading } = useOrderItems();

  const [formData, setFormData] = useState({
    variantId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    itemNotes: "",
    color: "",
    specifications: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.variantId) {
      errors.variantId = "Mã biến thể là bắt buộc";
    } else if (formData.variantId <= 0) {
      errors.variantId = "Mã biến thể phải là số dương";
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      errors.unitPrice = "Đơn giá phải lớn hơn 0";
    }

    if (formData.discount < 0 || formData.discount > 100) {
      errors.discount = "Giảm giá phải từ 0% đến 100%";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate với backend trước
      await validateItems([
        {
          ...formData,
          orderId: orderId,
        },
      ]);

      // Nếu validate thành công, tạo order item
      await createItem({
        ...formData,
        orderId: orderId,
      });

      showSuccess("Thêm sản phẩm vào đơn hàng thành công");

      // Quay lại trang trước đó
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi tạo order item:", error);
      // Error đã được xử lý trong hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate final price
  const calculateFinalPrice = () => {
    const subtotal = formData.unitPrice * formData.quantity;
    const discountAmount = subtotal * (formData.discount / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const finalPrice = calculateFinalPrice();

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Thiếu thông tin đơn hàng
          </h3>
          <p className="text-gray-600 mb-4">
            Không tìm thấy mã đơn hàng để thêm sản phẩm.
          </p>
          <Link
            to="/dealer/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/dealer/orders" className="text-gray-400 hover:text-gray-500">
                  📦 Đơn hàng
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link to={`/dealer/orders/${orderId}`} className="text-gray-400 hover:text-gray-500">
                  Đơn hàng #{orderId.slice(-8)}
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Thêm sản phẩm</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thêm sản phẩm mới
              </h1>
              <p className="text-gray-600 mt-2">
                Thêm sản phẩm vào đơn hàng #{orderId.slice(-8)}
              </p>
            </div>
            <Link
              to={`/dealer/orders/${orderId}`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Quay lại
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin sản phẩm
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Nhập thông tin chi tiết về sản phẩm
                </p>
              </div>

              <div className="p-6">
                <OrderItemForm
                  item={formData}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate(-1)}
                  loading={isSubmitting}
                  validationErrors={validationErrors}
                  onChange={handleChange}
                  mode="create"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">#{orderId.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Đang thêm sản phẩm
                  </span>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt giá</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đơn giá × SL:</span>
                  <span>
                    {formatCurrency(formData.unitPrice * formData.quantity)}
                  </span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Giảm giá ({formData.discount}%):
                    </span>
                    <span className="text-red-600">
                      -
                      {formatCurrency(
                        formData.unitPrice *
                          formData.quantity *
                          (formData.discount / 100)
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Thành tiền:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                💡 Mẹo nhập liệu
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Mã biến thể phải tồn tại trong hệ thống</li>
                <li>• Giảm giá tính theo phần trăm (%)</li>
                <li>• Thông số kỹ thuật giúp mô tả chi tiết sản phẩm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

export default OrderItemCreatePage;
