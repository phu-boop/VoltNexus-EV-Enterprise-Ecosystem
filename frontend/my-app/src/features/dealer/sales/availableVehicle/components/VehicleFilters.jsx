import React from "react";
import { FiX, FiCheck, FiFilter } from "react-icons/fi";

const VehicleFilters = ({ filters, setFilters, onReset }) => {
  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const bodyTypes = ["Sedan", "SUV", "Hatchback", "MPV", "Coupe", "Truck"];
  const brands = ["VinFast", "Tesla", "Hyundai", "Toyota", "Ford"];
  const colors = [
    { name: "Trắng", hex: "#FFFFFF", border: true },
    { name: "Đen", hex: "#1A202C" },
    { name: "Xám", hex: "#718096" },
    { name: "Xanh Dương", hex: "#3182CE" },
    { name: "Đỏ", hex: "#E53E3E" },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <FiFilter size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Bộ lọc</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
        >
          Làm mới
        </button>
      </div>

      <div className="space-y-8">
        {/* Hãng xe */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
            Thương hiệu
          </label>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleChange("brand", filters.brand === brand ? "" : brand)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  filters.brand === brand
                    ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Kiểu dáng */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
            Kiểu dáng
          </label>
          <div className="space-y-2">
            {bodyTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => handleChange("bodyType", filters.bodyType === type ? "" : type)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    filters.bodyType === type
                      ? "bg-blue-600 border-blue-600 shadow-sm"
                      : "border-slate-300 group-hover:border-blue-400 bg-white"
                  }`}
                >
                  {filters.bodyType === type && <FiCheck className="text-white" size={12} />}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    filters.bodyType === type ? "font-bold text-slate-800" : "text-slate-600 group-hover:text-slate-800"
                  }`}
                >
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Màu sắc */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
            Màu sắc
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleChange("color", filters.color === color.name ? "" : color.name)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                  filters.color === color.name ? "border-blue-500 scale-110 shadow-lg shadow-blue-100" : "border-slate-100 hover:border-slate-300"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {filters.color === color.name && (
                  <div className={color.name === "Trắng" ? "text-slate-800" : "text-white"}>
                    <FiCheck size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
            Khoảng giá (Triệu VNĐ)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Từ"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              onChange={(e) => handleChange("minPrice", e.target.value)}
              value={filters.minPrice || ""}
            />
            <div className="w-4 h-px bg-slate-300"></div>
            <input
              type="number"
              placeholder="Đến"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              value={filters.maxPrice || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
