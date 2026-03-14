import React from "react";
import { Edit3, Trash2, Eye, User, CheckSquare, Square } from "lucide-react";

export default function UserTable({ 
    users, 
    onEdit, 
    onView, 
    onDelete, 
    isLoading,
    selectedUsers = [],
    onSelectionChange 
}) {
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectionChange(users.map(user => user.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectUser = (userId, checked) => {
        if (checked) {
            onSelectionChange([...selectedUsers, userId]);
        } else {
            onSelectionChange(selectedUsers.filter(id => id !== userId));
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <User size={64} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có user nào</h3>
                <p className="text-gray-500">Hãy thêm nhân viên mới để bắt đầu</p>
            </div>
        );
    }

    const formatRoles = (roles) => {
        return roles.map(role => role.name).join(", ");
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                <input
                                    type="checkbox"
                                    checked={users.length > 0 && selectedUsers.length === users.length}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thông tin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Liên hệ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vai trò & Quyền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0 h-10 w-10">
                                            {user.url ? (
                                                <img
                                                    src={user.url}
                                                    alt={user.fullName || user.name}
                                                    className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.nextElementSibling.style.display = "flex";
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-gray-200 shadow-sm ${user.url ? 'hidden' : 'flex'}`}>
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {user.name?.charAt(0)?.toUpperCase() ||
                                                        user.fullName?.charAt(0)?.toUpperCase() ||
                                                        "U"}
                                                </span>
                                            </div>

                                            {/* Status indicator */}
                                            <span
                                                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                                    user.status === "ACTIVE"
                                                        ? "bg-green-500"
                                                        : user.status === "INACTIVE"
                                                        ? "bg-red-500"
                                                        : user.status === "SUSPENDED"
                                                        ? "bg-amber-500"
                                                        : "bg-gray-400"
                                                }`}
                                            ></span>
                                        </div>

                                        {/* User info */}
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.fullName || user.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {user.status === "ACTIVE" && (
                                                    <span className="text-green-600 font-medium">Đang hoạt động</span>
                                                )}
                                                {user.status === "INACTIVE" && (
                                                    <span className="text-red-600 font-medium">Ngưng hoạt động</span>
                                                )}
                                                {user.status === "SUSPENDED" && (
                                                    <span className="text-amber-600 font-medium">Tạm khóa</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                ID: {user.id.substring(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500 mt-1">{user.phone || "Chưa cập nhật"}</div>
                                    {user.address && (
                                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                                            <span className="truncate max-w-xs">{user.address}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatRoles(user.roles)}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onView(user)}
                                            className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="flex items-center justify-center w-8 h-8 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(user.id)}
                                            className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Selection info bar */}
            {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                                Đã chọn {selectedUsers.length} người dùng
                            </span>
                        </div>
                        <button
                            onClick={() => onSelectionChange([])}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Bỏ chọn tất cả
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}