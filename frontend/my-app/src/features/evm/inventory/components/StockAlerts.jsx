import React, { useState, useEffect } from "react";
import { FiAlertCircle, FiChevronRight, FiBell } from "react-icons/fi";
import { getActiveAlerts } from "../services/inventoryService";

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getActiveAlerts();
        setAlerts(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (isLoading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-rose-50 border border-rose-100 p-5 mb-8 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200">
            <FiBell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">Cảnh báo tồn kho tới hạn</h3>
              <span className="px-2 py-0.5 bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg">
                {alerts.length} PHIÊN BẢN
              </span>
            </div>
            <div className="space-y-1.5 mt-2">
              {alerts.slice(0, 2).map((alert) => (
                <div key={alert.alertId} className="flex items-center gap-2 text-xs font-medium text-rose-700/80">
                  <FiAlertCircle size={14} className="text-rose-400" />
                  <span>Sản phẩm <strong className="text-rose-800">ID: {alert.variantId}</strong> đang thấp hơn ngưỡng an toàn ({alert.currentStock} / {alert.threshold})</span>
                </div>
              ))}
              {alerts.length > 2 && (
                <p className="text-[10px] text-rose-500 font-bold italic mt-1 ml-6">
                  + và {alerts.length - 2} cảnh báo khác đang chờ xử lý...
                </p>
              )}
            </div>
          </div>
        </div>

        <button className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 transition-all shadow-sm active:scale-95 group">
          Xử lý ngay
          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default StockAlerts;
