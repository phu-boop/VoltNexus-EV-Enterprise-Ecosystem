import React, { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiChevronDown } from "react-icons/fi";
import {
  createModelWithVariants,
  updateModel,
} from "../services/vehicleCatalogService";

const SPEC_TEMPLATES = [
  { key: "Động cơ", value: "VD: Electric 150kW" },
  { key: "Công suất tối đa", value: "VD: 201 (mã lực)" },
  { key: "Mô-men xoắn cực đại", value: "VD: 310 (Nm)" },
  { key: "Dung lượng pin", value: "VD: 77 (kWh)" },
  { key: "Quãng đường di chuyển", value: "VD: 420 (km)" },
  { key: "Thời gian sạc nhanh", value: "VD: 25 (phút)" },
  { key: "Kích thước (D x R x C)", value: "VD: 4750 x 1921 x 1624 (mm)" },
  { key: "Chiều dài cơ sở", value: "VD: 2950 (mm)" },
];

const STATUS_OPTIONS = {
  COMING_SOON: "Sắp ra mắt",
  IN_PRODUCTION: "Đang sản xuất",
  DISCONTINUED: "Ngừng sản xuất",
};

// Tách riêng phần quản lý thông số kỹ thuật để tái sử dụng
const SpecificationInputs = ({
  specifications,
  onChange,
  onAdd,
  onRemove,
  onSelectTemplate, // THAY ĐỔI 2: Thêm prop mới
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold text-lg mb-2 col-span-full">
        Thông số kỹ thuật
      </h3>
      {specifications.map((spec, index) => (
        <div key={index} className="flex items-stretch gap-2">
          {/* Bọc ô input và nút chọn mẫu vào một div */}
          <div className="flex-1 relative flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <input
              type="text"
              placeholder="Tên thuộc tính"
              value={spec.key}
              onChange={(e) => onChange(index, "key", e.target.value)}
              className="p-2 w-full outline-none rounded-l-lg"
            />
            <div className="group relative">
              <button
                type="button"
                className="p-2 border-l rounded-r-lg h-full bg-gray-50 hover:bg-gray-100"
              >
                <FiChevronDown />
              </button>
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  {SPEC_TEMPLATES.map((template) => (
                    <a
                      key={template.key}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTemplate(index, template);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {template.key}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder={spec.placeholder || "Giá trị"} // Dùng placeholder động
            value={spec.value}
            onChange={(e) => onChange(index, "value", e.target.value)}
            className="p-2 border rounded-lg flex-1"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-red-500 hover:bg-red-100 rounded-full self-center"
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mt-4"
      >
        <FiPlus className="mr-2" /> Thêm thuộc tính
      </button>
    </div>
  );
};

const ModelForm = ({ isOpen, onClose, onSuccess, model }) => {
  const isEditMode = !!model;

  const initialFormState = {
    modelName: "",
    brand: "",
    thumbnailUrl: "",
    status: "",
    // --- State cho thông số cốt lõi ---
    baseRangeKm: "",
    baseMotorPower: "",
    baseBatteryCapacity: "",
    baseChargingTime: "",
    // --- State cho thông số mở rộng ---
    extendedSpecifications: [{ key: "", value: "", placeholder: "" }],
    variants: [
      {
        versionName: "",
        color: "",
        price: "",
        skuCode: "",
        imageUrl: "",
        batteryCapacity: "",
        rangeKm: "",
        motorPower: "",
        status: "IN_PRODUCTION",
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showExtendedSpecs, setShowExtendedSpecs] = useState(false);
  const [showInitialVariants, setShowInitialVariants] = useState(false);

  useEffect(() => {
    // Reset trạng thái hiển thị mỗi khi mở form
    setShowExtendedSpecs(false);
    setShowInitialVariants(false);

    if (isEditMode && model) {
      let extendedSpecsArray = [{ key: "", value: "", placeholder: "" }];
      if (model.extendedSpecs) {
        const convertedSpecs = Object.entries(model.extendedSpecs).map(
          ([key, value]) => ({ key, value: String(value) })
        );
        if (convertedSpecs.length > 0) {
          extendedSpecsArray = convertedSpecs;
          setShowExtendedSpecs(true); // Nếu có dữ liệu, tự động hiển thị
        }
      }

      setFormData({
        modelName: model.modelName || "",
        brand: model.brand || "",
        thumbnailUrl: model.thumbnailUrl || "",
        status: model.status || "",
        baseRangeKm: model.baseRangeKm || "",
        baseMotorPower: model.baseMotorPower || "",
        baseBatteryCapacity: model.baseBatteryCapacity || "",
        baseChargingTime: model.baseChargingTime || "",
        extendedSpecifications:
          extendedSpecsArray.length > 0
            ? extendedSpecsArray
            : [{ key: "", value: "" }],
        variants: initialFormState.variants,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEditMode, model, isOpen]);

  const handleModelChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SỬA LỖI: Các handler này DÀNH RIÊNG cho thông số mở rộng ---
  const handleExtendedSpecChange = (index, field, value) => {
    const newSpecs = [...formData.extendedSpecifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, extendedSpecifications: newSpecs });
  };

  const addExtendedSpec = () => {
    setFormData({
      ...formData,
      extendedSpecifications: [
        ...formData.extendedSpecifications,
        { key: "", value: "", placeholder: "" },
      ],
    });
  };

  const removeExtendedSpec = (index) => {
    const newSpecs = formData.extendedSpecifications.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, extendedSpecifications: newSpecs });
  };

  const handleSelectExtendedSpecTemplate = (index, template) => {
    const newSpecs = [...formData.extendedSpecifications];
    newSpecs[index].key = template.key;
    newSpecs[index].placeholder = template.value;
    newSpecs[index].value = "";
    setFormData({ ...formData, extendedSpecifications: newSpecs });
  };
  // -------------------------------------------------------------------
  // --- KẾT THÚC CÁC HÀM MỚI ---

  const handleVariantChange = (index, e) => {
    const newVariants = [...formData.variants];
    newVariants[index][e.target.name] = e.target.value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          versionName: "",
          color: "",
          price: "",
          skuCode: "",
          imageUrl: "",
          batteryCapacity: "",
          rangeKm: "",
          motorPower: "",
          status: "IN_PRODUCTION",
        },
      ],
    });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const extendedSpecsObject = formData.extendedSpecifications
      .filter((spec) => spec.key.trim() !== "")
      .reduce((obj, spec) => {
        obj[spec.key] = spec.value;
        return obj;
      }, {});

    const finalStatus = formData.status || "COMING_SOON";

    const payload = {
      modelName: formData.modelName,
      brand: formData.brand,
      thumbnailUrl: formData.thumbnailUrl,
      status: finalStatus,
      baseRangeKm: Number(formData.baseRangeKm) || null,
      baseMotorPower: Number(formData.baseMotorPower) || null,
      baseBatteryCapacity: Number(formData.baseBatteryCapacity) || null,
      baseChargingTime: Number(formData.baseChargingTime) || null,
      extendedSpecs: extendedSpecsObject,
    };

    try {
      if (isEditMode) {
        await updateModel(model.modelId, payload);
      } else {
        const variantsPayload = showInitialVariants
          ? formData.variants.map((v) => ({
              versionName: v.versionName,
              color: v.color,
              price: Number(v.price) || 0,
              skuCode: v.skuCode,
              imageUrl: v.imageUrl,
              batteryCapacity: Number(v.batteryCapacity) || null,
              baseChargingTime: Number(v.baseChargingTime) || null,
              rangeKm: Number(v.rangeKm) || null,
              motorPower: Number(v.motorPower) || null,
              status: v.status || "IN_PRODUCTION",
            }))
          : []; // Nếu không hiển thị, gửi mảng rỗng

        await createModelWithVariants({
          ...payload,
          createdBy: "evm.staff@example.com",
          variants: variantsPayload,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đã xảy ra lỗi.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh Sửa Mẫu Xe" : "Tạo Mẫu Xe Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="font-semibold text-lg mb-2 col-span-full">
              Thông tin chung
            </h3>
            <input
              name="modelName"
              value={formData.modelName}
              onChange={handleModelChange}
              placeholder="Tên mẫu xe (VD: VF 8)"
              required
              className="p-2 border rounded-lg"
            />
            <input
              name="brand"
              value={formData.brand}
              onChange={handleModelChange}
              placeholder="Hãng xe (VD: VinFast)"
              required
              className="p-2 border rounded-lg"
            />
            <div className="col-span-full">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleModelChange}
                className="p-2 border rounded-lg w-full"
              >
                <option value="">-- Mặc định (Sắp ra mắt) --</option>
                {Object.entries(STATUS_OPTIONS).map(
                  ([enumValue, displayText]) => (
                    <option key={enumValue} value={enumValue}>
                      {displayText}
                    </option>
                  )
                )}
              </select>
            </div>
            <input
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleModelChange}
              placeholder="URL Ảnh đại diện"
              className="p-2 border rounded-lg col-span-full"
            />
          </div>

          {/*Thêm giao diện cho thông số cốt lõi */}
          <fieldset className="p-4 border rounded-lg">
            <legend className="px-2 font-semibold text-gray-700">
              Thông số kỹ thuật chính
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <input
                type="number"
                name="baseRangeKm"
                value={formData.baseRangeKm}
                onChange={handleModelChange}
                placeholder="Quãng đường cơ bản (km)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="baseMotorPower"
                value={formData.baseMotorPower}
                onChange={handleModelChange}
                placeholder="Công suất cơ bản (kW)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="baseBatteryCapacity"
                value={formData.baseBatteryCapacity}
                onChange={handleModelChange}
                placeholder="Dung lượng pin cơ bản (kWh)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="baseChargingTime"
                value={formData.baseChargingTime}
                onChange={handleModelChange}
                placeholder="Thời gian sạc cơ bản (giờ)"
                className="p-2 border rounded-lg w-full"
              />
            </div>
          </fieldset>

          {/*Sử dụng component mới thay cho textarea */}
          {showExtendedSpecs ? (
            <SpecificationInputs
              specifications={formData.extendedSpecifications}
              onChange={handleExtendedSpecChange}
              onAdd={addExtendedSpec}
              onRemove={removeExtendedSpec}
              onSelectTemplate={handleSelectExtendedSpecTemplate}
            />
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowExtendedSpecs(true)}
                className="px-4 py-2 border border-dashed rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <FiPlus className="inline mr-2" /> Thêm thông số kỹ thuật mở
                rộng
              </button>
            </div>
          )}
          {/*  QUẢN LÝ VARIANTS KHI TẠO MỚI */}
          {!isEditMode &&
            (showInitialVariants ? (
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold text-lg mb-2">
                  Các phiên bản ban đầu
                </h3>
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="space-y-4 border-t pt-4 first:border-t-0"
                  >
                    {/* --- Thông tin cơ bản của Variant (yêu cầu required) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        name="versionName"
                        value={variant.versionName}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="Tên phiên bản*"
                        required
                        className="p-2 border rounded-lg"
                      />
                      <input
                        name="color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="Màu sắc*"
                        required
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        name="price"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="Giá bán*"
                        required
                        className="p-2 border rounded-lg"
                      />
                      <input
                        name="skuCode"
                        value={variant.skuCode}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="Mã SKU*"
                        required
                        className="p-2 border rounded-lg"
                      />
                    </div>
                    <input
                      name="imageUrl"
                      value={variant.imageUrl}
                      onChange={(e) => handleVariantChange(index, e)}
                      placeholder="URL Hình ảnh (tùy chọn)"
                      className="p-2 border rounded-lg w-full"
                    />

                    {/* --- Thông số kỹ thuật của Variant (không yêu cầu required) --- */}
                    <fieldset className="border px-3 pt-2 pb-3 rounded-lg">
                      <legend className="px-2 text-sm text-gray-600">
                        Thông số kỹ thuật (tùy chọn)
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="number"
                          name="batteryCapacity"
                          value={variant.batteryCapacity}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="Dung lượng pin (kWh)"
                          className="p-2 border rounded-lg w-full"
                        />
                        <input
                          type="number"
                          name="rangeKm"
                          value={variant.rangeKm}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="Quãng đường (km)"
                          className="p-2 border rounded-lg w-full"
                        />
                        <input
                          type="number"
                          name="motorPower"
                          value={variant.motorPower}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="Công suất (kW)"
                          className="p-2 border rounded-lg w-full"
                        />
                      </div>
                    </fieldset>

                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="..."
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="...">
                  Thêm phiên bản khác
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowInitialVariants(true)}
                  className="px-4 py-2 border border-dashed rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  <FiPlus className="inline mr-2" /> Thêm các phiên bản ban đầu
                  (tùy chọn)
                </button>
              </div>
            ))}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {isLoading ? "Đang lưu..." : isEditMode ? "Cập Nhật" : "Tạo Mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelForm;
