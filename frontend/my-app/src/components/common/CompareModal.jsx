import React from "react";
import { FiX } from "react-icons/fi";

// Định dạng tiền tệ
const formatPrice = (price) => {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Định dạng trạng thái kho
const formatStockStatus = (inventory) => {
  if (!inventory) return <span className="text-gray-500">N/A</span>;

  if (inventory.dealerStockAvailable > 0) {
    return (
      <span className="font-bold text-green-600">
        Có sẵn tại đại lý ({inventory.dealerStockAvailable})
      </span>
    );
  }
  if (inventory.centralStockAvailable > 0) {
    return (
      <span className="font-bold text-blue-600">
        Có tại kho hãng ({inventory.centralStockAvailable})
      </span>
    );
  }
  return <span className="font-bold text-red-600">Hết hàng</span>;
};

// Component Modal
const CompareModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || data.length === 0) return null;

  // Lấy danh sách các thuộc tính để so sánh
  const features = [
    { label: "Giá bán lẻ", key: "price", format: (val) => formatPrice(val) },
    {
      label: "Giá bán sỉ",
      key: "wholesalePrice",
      format: (val) => formatPrice(val),
    },
    {
      label: "Quãng đường",
      key: "rangeKm",
      format: (val) => (val != null ? `${val} km` : "N/A"),
    },
    {
      label: "Công suất",
      key: "motorPower",
      format: (val) => (val != null ? `${val} W` : "N/A"),
    },
    {
      label: "Pin",
      key: "batteryCapacity",
      format: (val) => (val != null ? `${val} kWh` : "N/A"),
    },
    {
      label: "Thời gian sạc",
      key: "chargingTime",
      format: (val) => (val != null ? `${val} giờ` : "N/A"),
    },
  ];

  return (
    // Lớp phủ
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-70 flex items-center justify-center z-[9999] p-4 transition-opacity">
      {/* Nội dung Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <h2 className="text-2xl font-bold">So sánh sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Bảng so sánh (cho phép cuộn) */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b bg-white">
                <th className="p-4 text-left w-1/4 sticky left-0 bg-white">
                  Sản phẩm
                </th>
                {data.map((item) => (
                  <th key={item.details.variantId} className="p-4">
                    <img
                      src={
                        item.details.imageUrl || "https://placehold.co/400x300"
                      }
                      alt={item.details.versionName}
                      className="w-32 h-24 object-cover mx-auto rounded"
                    />
                    <p className="mt-2 font-bold text-blue-700">
                      {item.details.modelName} {item.details.versionName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.details.color}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Hàng Tình trạng kho */}
              <tr className="bg-gray-50">
                <td className="p-4 font-semibold text-left sticky left-0 bg-gray-50">
                  Tình trạng kho
                </td>
                {data.map((item) => (
                  <td key={item.details.variantId} className="p-4 text-center">
                    {formatStockStatus(item.inventory)}
                  </td>
                ))}
              </tr>

              {/* Các hàng thông số */}
              {features.map((feature) => (
                <tr key={feature.key} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold text-left sticky left-0 bg-white">
                    {feature.label}
                  </td>
                  {data.map((item) => (
                    <td
                      key={item.details.variantId}
                      className="p-4 text-center"
                    >
                      {feature.format(item.details[feature.key])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Hàng Tính năng chi tiết */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-left align-top sticky left-0 bg-white">
                  Tính năng
                </td>
                {data.map((item) => (
                  <td
                    key={item.details.variantId}
                    className="p-4 text-left text-sm align-top"
                  >
                    <ul className="list-disc list-inside">
                      {item.details.features?.length > 0 ? (
                        item.details.features.map((f) => (
                          <li key={f.featureId}>
                            {f.featureName}
                            {!f.standard && (
                              <span className="text-xs text-gray-500">
                                {" "}
                                (Tùy chọn)
                              </span>
                            )}
                            {f.additionalCost > 0 && (
                              <span className="text-xs text-blue-500">
                                {" "}
                                (+{formatPrice(f.additionalCost)})
                              </span>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">(Không có)</li>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
