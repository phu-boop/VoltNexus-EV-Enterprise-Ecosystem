import React, { useState } from "react";
import {
  FiDownload,
  FiSettings,
  FiFileText,
  FiDatabase,
  FiArrowRight,
  FiCheckCircle,
  FiCalendar,
  FiLayout,
  FiActivity,
  FiLoader
} from "react-icons/fi";
import {
  exportInventoryReport,
  updateCentralReorderLevel,
} from "../services/inventoryService";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

const InventoryReportsTab = () => {
  const [reportParams, setReportParams] = useState({
    startDate: "",
    endDate: "",
    format: "xlsx",
  });
  const [reorderParams, setReorderParams] = useState({
    variantId: "",
    reorderLevel: "",
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    let errorMessage = "";

    if (!reportParams.startDate && !reportParams.endDate) {
      errorMessage = "Vui lòng chọn ngày bắt đầu và ngày kết thúc.";
    } else if (!reportParams.startDate) {
      errorMessage = "Vui lòng chọn ngày bắt đầu.";
    } else if (!reportParams.endDate) {
      errorMessage = "Vui lòng chọn ngày kết thúc.";
    }

    // 2. Nếu có lỗi thì hiển thị thông báo
    if (errorMessage) {
      await Swal.fire({
        icon: "info",
        title: "Cảnh báo",
        text: errorMessage, // Sử dụng thông báo tùy chỉnh
      });
      return;
    }
    setIsExporting(true);
    try {
      const response = await exportInventoryReport(reportParams);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      saveAs(
        blob,
        `inventory_report_${reportParams.startDate}_to_${reportParams.endDate}.${reportParams.format}`
      );
    } catch (error) {
      console.error("Failed to export report", error);
      await Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: "Xuất báo cáo thất bại.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateReorder = async (e) => {
    e.preventDefault();
    try {
      await updateCentralReorderLevel(reorderParams);
      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật ngưỡng tồn kho thành công!",
        timer: 1000, // Tự tắt sau 1 giây
        timerProgressBar: true,
      });
      setReorderParams({ variantId: "", reorderLevel: "" });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text:
          "Cập nhật ngưỡng tồn kho thất bại!" +
          (error.response?.data?.message || "Lỗi không xác định"),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cột 1: Xuất Báo Cáo */}
      <div className="flex flex-col h-full">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FiFileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Chiết Xuất Báo Cáo</h3>
            </div>
            <p className="text-sm text-slate-500">Kết xuất dữ liệu tồn kho định kỳ phục vụ kiểm kê.</p>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Khoảng thời gian</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="date"
                      value={reportParams.startDate}
                      onChange={(e) => setReportParams({ ...reportParams, startDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="date"
                      value={reportParams.endDate}
                      onChange={(e) => setReportParams({ ...reportParams, endDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Định dạng tệp tin</label>
                <div className="flex gap-3">
                  {['xlsx', 'pdf'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setReportParams({ ...reportParams, format: fmt })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${reportParams.format === fmt
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      <FiLayout size={16} />
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <ul className="text-xs text-emerald-800 space-y-2">
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500 shrink-0" />
                  Bao gồm chi tiết SKU, số VIN khả dụng
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500 shrink-0" />
                  Thống kê xuất/nhập trong kỳ
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 pt-0 mt-auto">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
              {isExporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
              {isExporting ? "Đang chuẩn bị file..." : "Xác nhận & Tải Báo Cáo"}
            </button>
          </div>
        </div>
      </div>

      {/* Cột 2: Cài Đặt Ngưỡng */}
      <div className="flex flex-col h-full text-slate-900">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FiSettings size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quản Trị Ngưỡng Kho</h3>
            </div>
            <p className="text-sm text-slate-500">Thiết lập giới hạn an toàn cho từng phiên bản sản phẩm.</p>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <form onSubmit={handleUpdateReorder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-black">ID Phiên bản (Variant ID)</label>
                <div className="relative">
                  <FiDatabase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number"
                    value={reorderParams.variantId}
                    onChange={(e) => setReorderParams({ ...reorderParams, variantId: e.target.value })}
                    placeholder="VD: 104"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Bạn có thể tìm thấy ID này trong Tab Trạng Thái Kho.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-black">Ngưỡng đặt lại (Reorder Level)</label>
                <div className="relative">
                  <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number"
                    value={reorderParams.reorderLevel}
                    onChange={(e) => setReorderParams({ ...reorderParams, reorderLevel: e.target.value })}
                    placeholder="Số lượng tối thiểu"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                <FiActivity className="text-blue-500 mt-0.5 shrink-0" size={16} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Hệ thống sẽ tự động tạo cảnh báo đỏ khi số lượng <strong>khả dụng</strong> chạm ngưỡng này. Hãy cân nhắc tốc độ bán hàng tại đại lý.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Cập Nhật Ngưỡng Kho
                <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsTab;
