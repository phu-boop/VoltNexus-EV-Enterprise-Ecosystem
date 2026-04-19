import profileService from "../services/profileService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../auth/AuthProvider.jsx";
import { Save, Shield, User, Mail, Phone, MapPin, Calendar, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 px-4 py-6 border-b border-slate-100 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/5 border border-indigo-600/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">
                  <Shield size={8} />
                  Secure Account Portal
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Hồ sơ cá nhân</h2>

              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/20 text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  {getRoleDisplayName()}
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100/50 border border-slate-200/50">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-sm font-black text-slate-600 tracking-tight">{formData.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-10 p-5 rounded-3xl flex items-center gap-4 font-bold text-xs uppercase tracking-tight ${message.includes("thành công")
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-lg shadow-emerald-100/20"
                    : "bg-red-50 text-red-600 border border-red-100 shadow-lg shadow-red-100/20"
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${message.includes("thành công") ? "bg-emerald-500" : "bg-red-500"}`}></div>
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="lg:grid lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Sidebar Info */}
              <div className="lg:col-span-4 space-y-8">
                <motion.div variants={itemVariants}>
                  <AvatarSection formData={formData} handleChange={handleChange} />
                </motion.div>

                <motion.div variants={itemVariants} className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full">
                  <h3 className="text-[11px] font-black text-slate-400 mb-8 flex items-center uppercase tracking-[0.2em] italic">
                    <Activity className="h-4 w-4 text-indigo-500 mr-2" />
                    System Metrics
                  </h3>
                  <div className="space-y-8 ">
                    <div className="group">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Trạng thái tài khoản</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-3 h-3">
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25"></span>
                          <span className="relative block w-full h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></span>
                        </div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{userProfile.status}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Đăng ký ngày</p>
                      <div className="flex items-center gap-3 text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <p className="text-sm font-bold">{formatDate(userProfile.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Truy cập cuối</p>
                      <div className="flex items-center gap-3 text-slate-700">
                        <Clock size={14} className="text-slate-400" />
                        <p className="text-sm font-bold">{formatDate(userProfile.lastLogin)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-200/60">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Bảo mật cấp độ cao</p>
                      <p className="text-[10px] text-indigo-400 font-medium leading-relaxed italic">
                        Dữ liệu của bạn được đồng bộ và mã hóa đầu cuối.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Main Form Sections */}
              <div className="lg:col-span-8 space-y-10 mt-12 lg:mt-0">
                <motion.div variants={itemVariants} className="space-y-12">
                  <div className="p-2 sm:p-0">
                    <BasicInfoSection
                      formData={formData}
                      errors={errors}
                      handleChange={handleChange}
                    />
                  </div>

                  <div className="p-2 sm:p-0">
                    <ContactInfoSection
                      formData={formData}
                      errors={errors}
                      handleChange={handleChange}
                    />
                  </div>

                  <div className="p-2 sm:p-0">
                    <AddressInfoSection
                      formData={formData}
                      handleChange={handleChange}
                    />
                  </div>

                  <motion.div variants={itemVariants}>
                    <RoleSpecificInfo
                      userProfile={userProfile}
                      formatDate={formatDate}
                      formatCurrency={formatCurrency}
                    />
                  </motion.div>
                </motion.div>

                {/* Submit Button Section */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100 mt-12">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Shield size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">An toàn & Bảo mật</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full sm:w-auto flex items-center justify-center px-12 py-4.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"></div>
                    {loading ? (
                      <Spin size="small" className="mr-3" />
                    ) : (
                      <Save size={18} className="mr-3 text-indigo-400 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                    )}
                    <span className="font-black text-xs uppercase tracking-[0.2em] italic relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      {loading ? "Đang xử lý dữ liệu..." : "Cập nhật tài khoản"}
                    </span>
                  </button>
                </motion.div>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileForm;
