import React, { useState, useEffect } from "react";
import { mngUserService } from "../services/mngUserService.js";
import UserForm from "../components/UserForm.jsx";
import UserTable from "../components/UserTable.jsx";
import UserFilters from "../components/UserFilters.jsx";
import UserPagination from "../components/UserPagination.jsx";
import UserProfileDetail from "../components/UserProfileDetail.jsx";
import UserStatistics from "../components/UserStatistics.jsx";
import BulkActions from "../components/BulkActions.jsx";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { formatUserDataForUpdate } from "../helpers/userDataHelper.jsx";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Search/Filter/Sort
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchUsers = async () => {
    const dealerId = sessionStorage.getItem("dealerId");
    try {
      setLoading(true);
      if (sessionStorage.getItem("roles").includes("EVM_STAFF")) {
        const response = await mngUserService.getAllDealerManager();
        if (response.data.code === "1000") {
          setUsers(response.data.data);
        } else {
          showMessage("Lỗi khi tải danh sách user");
        }
      } else if (sessionStorage.getItem("roles").includes("DEALER_MANAGER")) {
        const response = await mngUserService.getAllDealerStaff({
          dealerId: dealerId,
        });
        if (response.data.code === "1000") {
          setUsers(response.data.data);
        } else {
          showMessage("Lỗi khi tải danh sách user");
        }
      } else {
        const response = await mngUserService.getAll();
        if (response.data.code === "1000") {
          setUsers(response.data.data);
        } else {
          showMessage("Lỗi khi tải danh sách user");
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showMessage("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await mngUserService.getStatistics();
      if (response.data.code === "1000") {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setViewingUser(null);
    setMode("add");
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setViewingUser(null);
    setMode("edit");
    setModalOpen(true);
  };

  const handleViewUser = async (user) => {
    try {
      // Fetch detailed profile
      const response = await mngUserService.getProfile(user.id);
      if (response.data.code === "1000") {
        setViewingUser(response.data.data.user);
        setMode("view");
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Swal.fire("Lỗi!", "Không thể tải thông tin chi tiết user.", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, xóa người dùng!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await mngUserService.delete(userId);
        Swal.fire("Đã xóa!", "Người dùng đã được xóa.", "success");
        fetchUsers();
        fetchStatistics();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Lỗi!", "Không thể xóa người dùng.", "error");
      }
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      if (mode === "edit") {
        // 🧩 Tạo payload đầy đủ theo role
        let updateData = {
          email: userData.email || "",
          phone: userData.phone || "",
          name: userData.name || "",
          fullName: userData.fullName || "",
          password: userData.password || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "",
          birthday: userData.birthday || "",
          gender: userData.gender || "",
          role: userData.role || "",
          dealerId: userData.dealerId || "",
          position: userData.position || "",
          department: userData.department || "",
          hireDate: userData.hireDate || "",
          salary: userData.salary || "",
          commissionRate: userData.commissionRate || "",
          managementLevel: userData.managementLevel || "",
          approvalLimit: userData.approvalLimit || "",
          specialization: userData.specialization || "",
        };

        // 🧩 Bỏ roles nếu có (tránh gửi lên API)
        delete updateData.roles;

        // 🧩 Tùy theo role chỉnh field
        switch (userData.role) {
          case "EVM_STAFF":
            updateData = {
              ...updateData,
              dealerId: "", // Không dùng
              position: "",
              hireDate: "",
              salary: "",
              commissionRate: "",
              managementLevel: "",
              approvalLimit: "",
            };
            break;

          case "DEALER_STAFF":
            updateData = {
              ...updateData,
              managementLevel: "",
              approvalLimit: "",
              specialization: "",
            };
            break;

          case "DEALER_MANAGER":
            updateData = {
              ...updateData,
              position: "",
              hireDate: "",
              salary: "",
              commissionRate: "",
              specialization: "",
            };
            break;

          case "ADMIN":
            updateData = {
              ...updateData,
              dealerId: "",
              position: "",
              hireDate: "",
              salary: "",
              commissionRate: "",
              approvalLimit: "",
            };
            break;

          default:
            console.error("❌ Unknown role:", userData.role);
            throw new Error("Unknown user role");
        }

        // 🧩 Gọi API update đúng theo role
        try {
          let response;

          switch (userData.role) {
            case "EVM_STAFF":
              response = await mngUserService.updateEvmStaff(updateData);
              break;
            case "DEALER_MANAGER":
              response = await mngUserService.updateDealerManager(updateData);
              break;
            case "DEALER_STAFF":
              response = await mngUserService.updateDealerStaff(updateData);
              break;
            case "ADMIN":
              response = await mngUserService.updateEvmAdmin(updateData);
              break;
            default:
              throw new Error("Unknown user role");
          }

          showMessage("Cập nhật user thành công");
        } catch (error) {
          console.error(
            "❌ Update failed:",
            error.response?.data || error.message
          );
          showMessage("Lỗi khi cập nhật user!");
        }
      } else {
        // Tạo user mới

        if (userData.role === "EVM_STAFF") {
          await mngUserService.createEvmStaff(userData);
        } else if (userData.role === "DEALER_MANAGER") {
          await mngUserService.createDealerManager(userData);
        } else if (userData.role === "DEALER_STAFF") {
          await mngUserService.createDealerStaff(userData);
        } else if (userData.role === "ADMIN") {
          await mngUserService.createAmind(userData);
        } else {
          throw new Error("Vui lòng chọn vai trò hợp lệ");
        }
        showMessage("Thêm user thành công");
      }
      setModalOpen(false);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error("Error saving user:", error);
      console.error("Error response:", error.response);

      let errorMessage = "Có lỗi xảy ra";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Hiển thị chi tiết validation errors nếu có
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage += ": " + Object.values(validationErrors).join(", ");
      }

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };
  const handleBulkAction = async (userIds, action) => {
    try {
      switch (action) {
        case "activate":
          await Promise.all(
            userIds.map((id) => mngUserService.changeStatus(id, "ACTIVE"))
          );
          showMessage(`Đã kích hoạt ${userIds.length} tài khoản`);
          break;
        case "suspend":
          await Promise.all(
            userIds.map((id) => mngUserService.changeStatus(id, "SUSPENDED"))
          );
          showMessage(`Đã tạm khóa ${userIds.length} tài khoản`);
          break;
        case "deactivate":
          await Promise.all(
            userIds.map((id) => mngUserService.changeStatus(id, "INACTIVE"))
          );
          showMessage(`Đã vô hiệu hóa ${userIds.length} tài khoản`);
          break;
        default:
          break;
      }
      fetchUsers();
      fetchStatistics();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      Swal.fire("Lỗi!", "Không thể thực hiện hành động hàng loạt.", "error");
    }
  };

  const handleExport = async () => {
    try {
      const response = await mngUserService.exportUsers({
        searchText,
        filterRole,
        sortField,
        sortOrder,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage("Xuất file Excel thành công");
    } catch (error) {
      console.error("Error exporting users:", error);
      Swal.fire("Lỗi!", "Không thể xuất file Excel.", "error");
    }
  };

  const handleImport = async (file) => {
    if (!file) return;

    const result = await Swal.fire({
      title: "Nhập dữ liệu từ Excel?",
      text: `Bạn sắp nhập dữ liệu từ file: ${file.name}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Tiếp tục",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await mngUserService.importUsers(file);
        Swal.fire("Thành công!", "Nhập dữ liệu thành công.", "success");
        fetchUsers();
        fetchStatistics();
      } catch (error) {
        console.error("Error importing users:", error);
        Swal.fire("Lỗi!", "Không thể nhập dữ liệu từ file.", "error");
      }
    }
  };

  // Filter + Search + Sort
  const filteredUsers = users
    .filter((user) => {
      const textMatch =
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.includes(searchText);

      const roleMatch =
        !filterRole || user.roles.some((role) => role.name === filterRole);

      return textMatch && roleMatch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" && aValue) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý và theo dõi tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Statistics */}
      <UserStatistics statistics={statistics} />

      {/* Bulk Actions */}
      <BulkActions
        selectedUsers={selectedUsers}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        onImport={handleImport}
        totalUsers={totalItems}
      />

      {/* Filters */}
      <UserFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        filterRole={filterRole}
        onFilterRoleChange={setFilterRole}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onAddUser={handleAddUser}
      />

      {/* Table */}
      <UserTable
        users={paginatedUsers}
        onEdit={handleEditUser}
        onView={handleViewUser}
        onDelete={handleDeleteUser}
        isLoading={loading}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
      />

      {/* Pagination */}
      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />

      {/* Form Modal */}
      {mode === "view" && viewingUser ? (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết người dùng
              </h2>
              <button
                onClick={() => setMode("null")}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <UserProfileDetail userProfile={viewingUser} mode="view" />
            </div>
          </div>
        </div>
      ) : (
        <UserForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitUser}
          initialData={editingUser}
          mode={mode}
        />
      )}
    </div>
  );
}
