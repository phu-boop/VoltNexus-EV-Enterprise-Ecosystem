import React from "react";
import { FiPackage, FiTruck, FiBox } from "react-icons/fi";
import StatCard from "../../../dealer/dashboard/components/StatCard";

/**
 * Inventory Management Component
 * Hiển thị thông tin quản lý kho
 */
const InventoryManagement = ({
  totalVehiclesInWarehouse = 0,
  vehiclesInTransit = 0,
  vehiclesShippedToday = 0
}) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quản Lý Kho</h2>
        <p className="text-gray-600">Thống kê tồn kho và vận chuyển</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tổng số xe trong kho trung tâm */}
        <StatCard
          title="Tổng Số Xe Trong Kho"
          value={totalVehiclesInWarehouse.toString()}
          subtitle="Xe có sẵn trong kho trung tâm"
          icon={FiPackage}
          color="blue"
        />

        {/* Xe đang điều phối */}
        <StatCard
          title="Xe Đang Điều Phối"
          value={vehiclesInTransit.toString()}
          subtitle="Xe đang vận chuyển đến đại lý"
          icon={FiTruck}
          color="orange"
        />

        {/* Xe đã xuất kho hôm nay */}
        <StatCard
          title="Xe Đã Xuất Kho Hôm Nay"
          value={vehiclesShippedToday.toString()}
          subtitle="Xe đã xuất kho trong ngày"
          icon={FiBox}
          color="green"
        />
      </div>
    </div>
  );
};

export default InventoryManagement;

