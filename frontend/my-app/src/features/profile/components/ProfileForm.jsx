import profileService from "../services/profileService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../auth/AuthProvider.jsx";
import { Save, Shield } from "lucide-react";
import Swal from "sweetalert2";

// Import components
import { AvatarSection } from "./components/AvatarSection";
import { BasicInfoSection } from "./components/BasicInfoSection";
import { ContactInfoSection } from "./components/ContactInfoSection";
import AddressInfoSection from "./components/AddressInfoSection";
import { RoleSpecificInfo } from "./components/RoleSpecificInfo";
import { InfoField } from "./components/InfoField";

const ProfileForm = () => {
  const { id_user, updateProfile } = useAuthContext();
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    birthday: "",
    gender: "MALE",
    url: "",
  });

  const [userProfile, setUserProfile] = useState({
    dealerStaffProfile: null,
    dealerManagerProfile: null,
    evmStaffProfile: null,
    adminProfile: null,
    roleToString: "",
    createdAt: "",
    lastLogin: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      if (response.data.code === "1000") {
        const userData = response.data.data.user;

        setFormData({
          name: userData.name || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "",
          birthday: userData.birthday || "",
          gender: userData.gender || "MALE",
          url: userData.url || "",
        });

        setUserProfile({
          dealerStaffProfile: userData.dealerStaffProfile,
          dealerManagerProfile: userData.dealerManagerProfile,
          evmStaffProfile: userData.evmStaffProfile,
          adminProfile: userData.adminProfile,
          roleToString: userData.roleToString,
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin,
          status: userData.status,
        });
      } else {
        setMessage("Lỗi khi tải thông tin");
      }
    } catch (error) {
      setMessage(
        "Lỗi khi tải thông tin: " +
          (error.response?.data?.data?.message || "Vui lòng thử lại")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage("");

      const updateData = {
        userId: id_user,
        name: formData.name,
        fullName: formData.fullName,
        // KHÔNG gửi email trong updateData
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        birthday: formData.birthday,
        gender: formData.gender,
        url: formData.url,
      };

      const response = await profileService.updateProfile(updateData);
      if (response.data.code === "1000") {
        setMessage("Cập nhật thông tin thành công!");
        // Sync name, fullName, avatar to context + sessionStorage
        // so Header/Sidebar re-render immediately
        if (updateProfile) {
          updateProfile({
            name: formData.name,
            fullName: formData.fullName,
            avatarUrl: formData.url || null,
          });
        }

        // Show success toast
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Thông tin cá nhân đã được cập nhật.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(
          "Lỗi khi cập nhật: " + (response.data.message || "Vui lòng thử lại")
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      setMessage(
        "Lỗi khi cập nhật: " +
          (error.response.data.data || error.message || "Vui lòng thử lại")
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Tên là bắt buộc";
    if (!formData.fullName?.trim())
      newErrors.fullName = "Họ và tên là bắt buộc";
    // Bỏ validate email vì không cho sửa
    if (!formData.phone?.trim()) newErrors.phone = "Số điện thoại là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const getRoleDisplayName = useCallback(() => {
    const roleMap = {
      DEALER_STAFF: "Nhân viên Đại lý",
      DEALER_MANAGER: "Quản lý Đại lý",
      EVM_STAFF: "Nhân viên EVM",
      ADMIN: "Quản trị viên",
    };
    return roleMap[userProfile.roleToString] || userProfile.roleToString;
  }, [userProfile.roleToString]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Invalid date";
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (!amount) return "Chưa cập nhật";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-8xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-slate-300 mt-1">
                  Quản lý thông tin tài khoản của bạn
                </p>
              </div>
              <div className="text-right text-black">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {getRoleDisplayName()}
                </div>
                <p className="text-slate-300 text-sm mt-1">{formData.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.includes("thành công")
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <AvatarSection formData={formData} handleChange={handleChange} />

              <BasicInfoSection
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <ContactInfoSection
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <AddressInfoSection
                formData={formData}
                handleChange={handleChange}
              />

              {/* System Information */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-slate-600 mr-2" />
                  Thông tin hệ thống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoField label="Trạng thái" value={userProfile.status} />
                  <InfoField
                    label="Ngày tạo"
                    value={formatDate(userProfile.createdAt)}
                  />
                  <InfoField
                    label="Đăng nhập cuối"
                    value={formatDate(userProfile.lastLogin)}
                  />
                </div>
              </div>

              {/* Role Specific Information */}
              <RoleSpecificInfo
                userProfile={userProfile}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save size={18} className="mr-2" />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
