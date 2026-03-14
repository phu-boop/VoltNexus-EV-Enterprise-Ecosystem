import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function UserFilters({
  searchText,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  onAddUser,
})
{
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const roles = sessionStorage.getItem("roles");

    if (roles?.includes("ADMIN")) {
      setAvailableRoles(["ADMIN", "EVM_STAFF", "DEALER_MANAGER"]);
    } else if (roles?.includes("EVM_STAFF")) {
      setAvailableRoles(["DEALER_MANAGER"]);
    } else if (roles?.includes("DEALER_MANAGER")) {
      setAvailableRoles(["DEALER_STAFF"]);
    } else {
      setAvailableRoles([]); // Dealer Staff chỉ xem chính mình
    }
  }, []);
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm theo email, tên, số điện thoại..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lọc theo Role
      </label>
      <select
        value={filterRole}
        onChange={(e) => onFilterRoleChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Tất cả</option>
        {availableRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>

        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="id">ID</option>
            <option value="fullName">Họ tên</option>
            <option value="email">Email</option>
            <option value="createdAt">Ngày tạo</option>
          </select>
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </div>

        <button
          onClick={onAddUser}
          className="w-full lg:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus size={20} className="mr-2" />
          {sessionStorage.getItem("roles").includes("EVM_STAFF")
            ? "Thêm Quản lý đại lý"
            :  "Thêm Nhân viên"
 }
        </button>
      </div>
    </div>
  );
}