import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiEdit,
  FiCheck,
  FiX,
  FiSend,
  FiUserPlus,
  FiMessageSquare,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getComplaintById,
  assignComplaint,
  addProgressUpdate,
  resolveComplaint,
  closeComplaint,
  sendNotificationToCustomer,
  COMPLAINT_TYPES,
  COMPLAINT_SEVERITIES,
  COMPLAINT_STATUSES,
  COMPLAINT_CHANNELS,
} from "../services/feedbackService";
import staffService from "../../assignment/services/staffService";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Form state
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [internalResolution, setInternalResolution] = useState(""); // Ghi chú nội bộ
  const [customerMessage, setCustomerMessage] = useState(""); // Thông điệp gửi khách hàng
  const [selectedStatus, setSelectedStatus] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [contactMethod, setContactMethod] = useState("PHONE");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get role-based info
  const rolesString = sessionStorage.getItem("roles");
  const roles = rolesString ? JSON.parse(rolesString) : [];
  const isManager = roles.includes("DEALER_MANAGER");
  const isStaff = roles.includes("DEALER_STAFF");

  // Try multiple sources for dealerId and userId
  const dealerId =
    sessionStorage.getItem("dealerId") ||
    sessionStorage.getItem("profileId") ||
    "6c8c229d-c8f6-43d8-b2f6-01261b46baa3"; // Fallback UUID
  const currentUserId =
    sessionStorage.getItem("id_user") ||
    sessionStorage.getItem("memberId") ||
    sessionStorage.getItem("userId") ||
    sessionStorage.getItem("profileId");
  const basePath = isManager ? "/dealer/manager" : "/dealer/staff";

  // Lock body scroll when any modal is open
  const isAnyModalOpen =
    showAssignModal ||
    showResolveModal ||
    showStatusModal ||
    showContactModal ||
    showNoteModal;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAnyModalOpen]);

  // Helper function to create modal with Portal
  const createModal = (content) => {
    return createPortal(
      <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        {content}
      </div>,
      document.body
    );
  };

  // Check if current user can perform actions on this complaint
  const canPerformAction = () => {
    if (!complaint) return false;

    // Manager can always perform actions
    if (isManager) return true;

    // Staff can only perform actions if they are assigned to this complaint
    if (isStaff) {
      // Try to match by ID first
      if (complaint.assignedStaffId === currentUserId) {
        return true;
      }

      // Try to find current user's staffId from staffList by matching email
      const currentEmail = sessionStorage.getItem("email");
      const currentStaff = staffList.find((s) => s.email === currentEmail);

      if (currentStaff) {
        if (currentStaff.staffId === complaint.assignedStaffId) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    loadComplaint();
    loadStaffList(); // Always load staff list
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      const response = await getComplaintById(id);

      setComplaint(response.data);
    } catch (error) {
      console.error("Error loading complaint:", error);
      toast.error("Không thể tải thông tin phản hồi");
      navigate(`${basePath}/feedback`);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      setLoadingStaff(true);
      const data = await staffService.getStaffByDealerId(dealerId);

      if (data && data.length > 0) {
      }
      setStaffList(data || []);
      if (!data || data.length === 0) {
        toast.warning("Không tìm thấy nhân viên nào");
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Không thể tải danh sách nhân viên");
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssign = async () => {
    // Only Manager can assign
    if (!isManager) {
      toast.error("Chỉ Manager mới có quyền phân công nhân viên");
      return;
    }

    if (!selectedStaffId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    const selectedStaff = staffList.find((s) => s.staffId === selectedStaffId);
    if (!selectedStaff) {
      toast.error("Không tìm thấy thông tin nhân viên");
      return;
    }

    try {
      setIsSubmitting(true);

      // Tạo tên hiển thị giống format trong dropdown
      const staffName = selectedStaff.fullName || selectedStaff.name || "N/A";
      const displayName = `${staffName} (${selectedStaff.email})`;

      await assignComplaint(id, {
        assignedStaffId: selectedStaffId,
        assignedStaffName: displayName,
        internalNotes: `Đã gán cho ${displayName}`,
      });

      toast.success("Đã gán nhân viên xử lý!");
      setShowAssignModal(false);
      setSelectedStaffId("");
      loadComplaint();
    } catch (error) {
      console.error("Error assigning:", error);
      toast.error("Không thể gán nhân viên");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ẨN ĐI - Không cần chức năng thêm tiến độ
  /* const handleAddProgress = async () => {
    if (!progressNote.trim()) {
      toast.error('Vui lòng nhập nội dung cập nhật');
      return;
    }

    try {
      setIsSubmitting(true);
      await addProgressUpdate(id, {
        note: progressNote,
        updatedBy: 'Current Staff' // TODO: Get from session
      });
      
      toast.success('Đã thêm cập nhật tiến độ!');
      setShowProgressModal(false);
      setProgressNote('');
      loadComplaint();
    } catch (error) {
      console.error('Error adding progress:', error);
      toast.error('Không thể thêm cập nhật');
    } finally {
      setIsSubmitting(false);
    }
  }; */

  const handleContactCustomer = async () => {
    // Check permission first
    if (!canPerformAction()) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    if (!contactNote.trim()) {
      toast.error("Vui lòng nhập nội dung liên hệ");
      return;
    }

    try {
      setIsSubmitting(true);
      // Gọi API addProgressUpdate để ghi lại đã liên hệ khách hàng
      const contactMethodLabels = {
        PHONE: "điện thoại",
        EMAIL: "email",
        SMS: "SMS",
        IN_PERSON: "trực tiếp",
      };

      const updateData = {
        updateNote: `📞 Đã liên hệ khách hàng qua ${contactMethodLabels[contactMethod]}:\n${contactNote}`,
        updatedByStaffId: currentUserId,
        updatedByStaffName: sessionStorage.getItem("fullName") || "Staff",
      };

      const result = await addProgressUpdate(id, updateData);

      toast.success("Đã ghi nhận liên hệ với khách hàng!");
      setShowContactModal(false);
      setContactNote("");
      setContactMethod("PHONE");

      // Reload complaint to get updated progressUpdates
      await loadComplaint();
    } catch (error) {
      console.error("Error logging contact:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Không thể ghi nhận liên hệ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    // Check permission first
    if (!canPerformAction()) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    if (!internalNote.trim()) {
      toast.error("Vui lòng nhập ghi chú");
      return;
    }

    try {
      setIsSubmitting(true);
      await addProgressUpdate(id, {
        updateNote: `📝 Ghi chú: ${internalNote}`,
        updatedByStaffId: currentUserId,
        updatedByStaffName: sessionStorage.getItem("fullName") || "Staff",
      });

      toast.success("Đã thêm ghi chú!");
      setShowNoteModal(false);
      setInternalNote("");
      await loadComplaint();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Không thể thêm ghi chú");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    // Check permission first
    if (!canPerformAction()) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    if (!customerMessage.trim()) {
      toast.error("Vui lòng nhập thông điệp gửi khách hàng");
      return;
    }

    try {
      setIsSubmitting(true);
      await resolveComplaint(id, {
        internalResolution: internalResolution.trim() || null,
        customerMessage: customerMessage.trim(),
        resolvedBy: "Current Staff", // TODO: Get from session
      });

      toast.success("Đã đánh dấu phản hồi là đã giải quyết!");
      setShowResolveModal(false);
      setInternalResolution("");
      setCustomerMessage("");
      loadComplaint();
    } catch (error) {
      console.error("Error resolving:", error);
      toast.error("Không thể giải quyết phản hồi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    // Only Manager can close
    if (!isManager) {
      toast.error("Chỉ Manager mới có quyền đóng phản hồi");
      return;
    }

    const result = await Swal.fire({
      title: "Đóng phản hồi?",
      text: "Bạn có chắc muốn đóng phản hồi này? Phản hồi đã đóng không thể mở lại.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Đóng phản hồi",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await closeComplaint(id);
        toast.success("Đã đóng phản hồi!");
        loadComplaint();
      } catch (error) {
        console.error("Error closing:", error);
        toast.error("Không thể đóng phản hồi");
      }
    }
  };

  const handleSendNotification = async () => {
    // Kiểm tra xem có customer message chưa (check both new and old field)
    const hasMessage =
      (complaint?.customerMessage && complaint.customerMessage.trim() !== "") ||
      (complaint?.resolution && complaint.resolution.trim() !== "");
    if (!hasMessage) {
      toast.error(
        "Chưa có kết quả xử lý. Vui lòng cập nhật kết quả trước khi gửi thông báo."
      );
      return;
    }

    const result = await Swal.fire({
      title: "Gửi thông báo cho khách hàng?",
      html: `
        <div class="text-left">
          <p class="mb-2">Thông báo sẽ được gửi đến:</p>
          <ul class="list-disc ml-5 mb-3">
            <li><strong>Email:</strong> ${
              complaint.customerEmail || "Không có"
            }</li>
            <li><strong>Số điện thoại:</strong> ${
              complaint.customerPhone || "Không có"
            }</li>
          </ul>
          <p class="text-sm text-gray-600">Nội dung: Kết quả xử lý phản hồi</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Gửi ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await sendNotificationToCustomer(id);
        toast.success("Đã gửi thông báo đến khách hàng!");
        loadComplaint(); // Reload để cập nhật trạng thái notificationSent
      } catch (error) {
        console.error("Error sending notification:", error);
        const message =
          error.response?.data?.message || "Không thể gửi thông báo";
        toast.error(message);
      }
    }
  };

  const handleStatusChange = async () => {
    // Only Manager can change status
    if (!isManager) {
      toast.error("Chỉ Manager mới có quyền thay đổi trạng thái");
      return;
    }

    if (!selectedStatus) {
      toast.error("Vui lòng chọn trạng thái mới");
      return;
    }

    if (selectedStatus === complaint.status) {
      toast.warning("Trạng thái mới giống trạng thái hiện tại");
      return;
    }

    try {
      setIsSubmitting(true);

      // Backend không có API update status trực tiếp
      // Status được tự động cập nhật qua các hành động:
      // - assignComplaint → IN_PROGRESS
      // - resolveComplaint → RESOLVED
      // - closeComplaint → CLOSED

      // Vì vậy, khi Manager chọn status mới, ta cần gọi API tương ứng
      switch (selectedStatus) {
        case "IN_PROGRESS":
          // Nếu chưa assign, cần assign nhân viên trước
          if (!complaint.assignedStaffId) {
            toast.warning(
              'Vui lòng gán nhân viên trước khi chuyển sang "Đang xử lý"'
            );
            setShowStatusModal(false);
            setShowAssignModal(true);
            return;
          }
          // Đã assign rồi thì status đã là IN_PROGRESS
          toast.info('Phản hồi đã ở trạng thái "Đang xử lý"');
          break;

        case "RESOLVED":
          // Cần có resolution text
          setShowStatusModal(false);
          setShowResolveModal(true);
          toast.info("Vui lòng nhập giải pháp xử lý");
          return;

        case "CLOSED":
          setShowStatusModal(false);
          await handleClose();
          return;

        case "NEW":
          toast.warning('Không thể chuyển về trạng thái "Mới nhận"');
          break;

        default:
          toast.error("Trạng thái không hợp lệ");
      }

      setShowStatusModal(false);
      setSelectedStatus("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseProgressUpdates = (updatesJson) => {
    if (!updatesJson) {
      return [];
    }

    try {
      // If already an array, return it
      if (Array.isArray(updatesJson)) {
        return updatesJson;
      }

      // If string, parse it
      const parsed = JSON.parse(updatesJson);

      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing progress updates:", e);
      console.error("Raw value:", updatesJson);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy phản hồi
          </h3>
          <button
            onClick={() => navigate(`${basePath}/feedback`)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = COMPLAINT_TYPES[complaint.complaintType] || {};
  const severityInfo = COMPLAINT_SEVERITIES[complaint.severity] || {};
  const statusInfo = COMPLAINT_STATUSES[complaint.status] || {};
  const channelInfo = COMPLAINT_CHANNELS[complaint.channel] || {};
  // Backend trả về progressHistory, không phải progressUpdates
  const progressUpdates = parseProgressUpdates(
    complaint.progressHistory || complaint.progressUpdates
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`${basePath}/feedback`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    {typeInfo.icon ? (
                      <typeInfo.icon className="w-6 h-6" />
                    ) : (
                      <FiFileText className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {complaint.complaintCode}
                    </h1>
                    <p className="text-sm text-gray-600">{typeInfo.label}</p>
                  </div>
                </div>
              </div>

              {/* Trạng thái và Mức độ - NỔI BẬT */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b flex-wrap">
                <span className="text-sm font-semibold text-gray-700">
                  Trạng thái
                </span>
                <span
                  className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full ${
                    complaint.status === "NEW"
                      ? "bg-blue-100 text-blue-800"
                      : complaint.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-800"
                      : complaint.status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusInfo.icon && (
                    <span className="mr-2">{statusInfo.icon}</span>
                  )}
                  {statusInfo.label}
                </span>

                <span className="text-sm font-semibold text-gray-700 ml-2">
                  Mức độ
                </span>
                <span
                  className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full ${
                    complaint.severity === "CRITICAL"
                      ? "bg-red-100 text-red-800"
                      : complaint.severity === "HIGH"
                      ? "bg-orange-100 text-orange-800"
                      : complaint.severity === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {severityInfo.label}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Nội dung phản hồi
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {complaint.description || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kênh tiếp nhận</p>
                    <p className="text-gray-900 font-medium flex items-center">
                      {channelInfo.icon && (
                        <channelInfo.icon className="w-4 h-4 mr-2 text-blue-600" />
                      )}
                      {channelInfo.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                    <p className="text-gray-900 font-medium flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-blue-600" />
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline / Progress Updates */}
            {complaint.status === "IN_PROGRESS" && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FiClock className="w-5 h-5 mr-2 text-blue-600" />
                    Tiến trình xử lý
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {progressUpdates.length} cập nhật
                  </span>
                </div>

                {progressUpdates && progressUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {progressUpdates.map((update, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                            <FiMessageSquare className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap break-words leading-relaxed">
                              {update.updateNote || update.note}
                            </p>
                            <div className="flex items-center mt-3 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg inline-flex">
                              <FiClock className="w-3 h-3 mr-1.5" />
                              {formatDate(update.updatedAt || update.timestamp)}
                              {(update.updatedByStaffName ||
                                update.updatedBy) && (
                                <>
                                  <span className="mx-2">•</span>
                                  <FiUser className="w-3 h-3 mr-1.5" />
                                  {update.updatedByStaffName ||
                                    update.updatedBy}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiMessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Chưa có cập nhật nào
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Sử dụng "Liên hệ khách hàng" hoặc "Thêm ghi chú" để cập
                      nhật tiến độ
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline for other statuses - simpler view */}
            {complaint.status !== "IN_PROGRESS" &&
              progressUpdates &&
              progressUpdates.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FiClock className="w-5 h-5 mr-2 text-gray-600" />
                    Lịch sử xử lý
                  </h3>
                  <div className="space-y-3">
                    {progressUpdates.map((update, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiMessageSquare className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {update.updateNote || update.note}
                          </p>
                          <div className="flex items-center mt-1.5 text-xs text-gray-500">
                            <FiClock className="w-3 h-3 mr-1" />
                            {formatDate(update.updatedAt || update.timestamp)}
                            {(update.updatedByStaffName ||
                              update.updatedBy) && (
                              <>
                                <span className="mx-2">•</span>
                                <FiUser className="w-3 h-3 mr-1" />
                                {update.updatedByStaffName || update.updatedBy}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Resolution (if resolved) */}
            {complaint.status === "RESOLVED" &&
              (complaint.customerMessage || complaint.internalResolution) && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <FiCheck className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      {complaint.customerMessage && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-green-900 mb-2">
                            Thông điệp gửi khách hàng
                          </h3>
                          <p className="text-green-800 mb-3 whitespace-pre-wrap">
                            {complaint.customerMessage}
                          </p>
                        </div>
                      )}
                      {complaint.internalResolution && (
                        <div
                          className={
                            complaint.customerMessage
                              ? "pt-4 border-t border-green-200"
                              : ""
                          }
                        >
                          <h3 className="text-sm font-semibold text-green-700 mb-2">
                            Ghi chú nội bộ
                          </h3>
                          <p className="text-green-700 text-sm mb-3 whitespace-pre-wrap">
                            {complaint.internalResolution}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {complaint.resolvedAt && (
                          <p className="text-sm text-green-600 flex items-center">
                            <FiClock className="w-4 h-4 mr-2" />
                            Giải quyết lúc: {formatDate(complaint.resolvedAt)}
                          </p>
                        )}
                        {complaint.notificationSent &&
                          complaint.notificationSentAt && (
                            <p className="text-sm text-green-600 flex items-center">
                              <FiSend className="w-4 h-4 mr-2" />
                              Đã gửi thông báo lúc:{" "}
                              {formatDate(complaint.notificationSentAt)}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Feedback Summary Info */}

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin khách hàng
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <FiUser className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tên khách hàng</p>
                    <p className="font-medium">
                      {complaint.customerName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiPhone className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">
                      {complaint.customerPhone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiMail className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">
                      {complaint.customerEmail || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Phân công xử lý
              </h3>

              {complaint.assignedStaffName ? (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <FiUser className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Nhân viên phụ trách
                      </p>
                      <p className="font-medium">
                        {complaint.assignedStaffName}
                      </p>
                    </div>
                  </div>
                  {complaint.firstResponseAt && (
                    <div className="flex items-center text-gray-700">
                      <FiClock className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Phản hồi lần đầu
                        </p>
                        <p className="font-medium">
                          {formatDate(complaint.firstResponseAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Only Manager can reassign */}
                  {isManager && complaint.status !== "CLOSED" && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="w-full mt-3 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                    >
                      Thay đổi người xử lý
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FiUserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">Chưa gán nhân viên</p>
                  {/* Only Manager can assign staff */}
                  {isManager && complaint.status !== "CLOSED" && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Gán nhân viên
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {complaint.status !== "CLOSED" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Thao tác
                </h3>

                {!canPerformAction() ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm text-yellow-800 font-medium">
                      Bạn không có quyền xử lý phản hồi này
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Chỉ nhân viên được phân công hoặc Manager mới có thể thực
                      hiện thao tác
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Actions for IN_PROGRESS status */}
                    {complaint.status === "IN_PROGRESS" && (
                      <>
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                        >
                          <FiPhone className="w-5 h-5 mr-2" />
                          Liên hệ khách hàng
                        </button>

                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center"
                        >
                          <FiFileText className="w-5 h-5 mr-2" />
                          Thêm ghi chú
                        </button>
                      </>
                    )}

                    {/* Change Status - Manager only */}
                    {isManager && (
                      <button
                        onClick={() => {
                          setSelectedStatus(complaint.status);
                          setShowStatusModal(true);
                        }}
                        className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center"
                      >
                        <FiEdit className="w-5 h-5 mr-2" />
                        Thay đổi trạng thái
                      </button>
                    )}

                    {/* Resolve - Show for all statuses except RESOLVED */}
                    {complaint.status !== "RESOLVED" && (
                      <button
                        onClick={() => setShowResolveModal(true)}
                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                      >
                        <FiCheck className="w-5 h-5 mr-2" />
                        Đánh dấu đã giải quyết
                      </button>
                    )}

                    {/* Send Notification - Show when there is customer message */}
                    {((complaint.customerMessage &&
                      complaint.customerMessage.trim() !== "") ||
                      (complaint.resolution &&
                        complaint.resolution.trim() !== "")) && (
                      <button
                        onClick={handleSendNotification}
                        className={`w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center ${
                          complaint.notificationSent
                            ? "bg-gray-100 text-gray-600 border border-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <FiSend className="w-5 h-5 mr-2" />
                        {complaint.notificationSent
                          ? "Đã gửi thông báo"
                          : "Gửi thông báo cho KH"}
                      </button>
                    )}

                    {/* Close - Manager only, when RESOLVED */}
                    {complaint.status === "RESOLVED" && isManager && (
                      <button
                        onClick={handleClose}
                        className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center"
                      >
                        <FiX className="w-5 h-5 mr-2" />
                        Đóng phản hồi
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal &&
        createModal(
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Gán nhân viên xử lý
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn nhân viên
              </label>

              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingStaff}
              >
                <option value="">-- Chọn nhân viên --</option>
                {staffList.map((staff) => {
                  // Format giống CreateCustomer: Tên (Email) - Position
                  const staffName = staff.fullName || staff.name || "N/A";
                  return (
                    <option key={staff.staffId} value={staff.staffId}>
                      {staffName} ({staff.email})
                      {staff.position ? ` - ${staff.position}` : ""}
                    </option>
                  );
                })}
              </select>

              {loadingStaff && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Đang tải danh sách nhân viên...
                </p>
              )}

              {!loadingStaff && staffList.length === 0 && (
                <p className="text-sm text-amber-600 mt-2 flex items-center">
                  ⚠️ Không có nhân viên nào trong đại lý
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStaffId("");
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                disabled={isSubmitting || !selectedStaffId}
              >
                {isSubmitting ? "Đang gán..." : "Gán"}
              </button>
            </div>
          </div>
        )}

      {/* Progress Modal - ẨN ĐI VÌ KHÔNG CẦN THIẾT */}
      {/* Có thể bỏ comment để hiển thị lại nếu cần
      {showProgressModal && (
        ...modal code...
      )}
      */}

      {/* Resolve Modal */}
      {showResolveModal &&
        createModal(
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Giải pháp xử lý
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Vui lòng nhập thông điệp sẽ gửi cho khách hàng. Ghi chú nội bộ là
              tùy chọn.
            </p>

            {/* Customer Message - Required */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Thông điệp gửi khách hàng{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Nội dung này sẽ được gửi qua email cho khách hàng. Hãy viết một
                cách lịch sự và chuyên nghiệp.
              </p>
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="VD: Chúng tôi đã kiểm tra và xử lý vấn đề của xe. Xin chân thành xin lỗi quý khách về sự bất tiện này. Xe đã được bảo dưỡng và sẵn sàng giao lại cho quý khách."
                rows={5}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-blue-50"
              />
            </div>

            {/* Internal Notes - Optional */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú nội bộ (không gửi cho khách hàng)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Ghi chú này chỉ dành cho nhân viên và quản lý, không hiển thị
                trong email gửi khách hàng.
              </p>
              <textarea
                value={internalResolution}
                onChange={(e) => setInternalResolution(e.target.value)}
                placeholder="VD: Đã kiểm tra hệ thống phanh, thay má phanh mới, test lái OK. Gửi mail xin lỗi và tặng voucher giảm giá 10% lần bảo dưỡng sau."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setCustomerMessage("");
                  setInternalResolution("");
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleResolve}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
                disabled={isSubmitting || !customerMessage.trim()}
              >
                {isSubmitting ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        )}

      {/* Contact Customer Modal */}
      {showContactModal &&
        createModal(
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiPhone className="w-6 h-6 mr-2 text-blue-600" />
              Liên hệ khách hàng
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình thức liên hệ
              </label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PHONE">Điện thoại</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="IN_PERSON">Gặp trực tiếp</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung trao đổi
              </label>
              <textarea
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="Ghi lại nội dung trao đổi với khách hàng, vấn đề đã được xác nhận, các yêu cầu của khách hàng..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Ghi chi tiết để dễ theo dõi quá trình xử lý
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setContactNote("");
                  setContactMethod("PHONE");
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleContactCustomer}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                disabled={isSubmitting || !contactNote.trim()}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}

      {/* Add Note Modal */}
      {showNoteModal &&
        createModal(
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiFileText className="w-6 h-6 mr-2 text-purple-600" />
              Thêm ghi chú nội bộ
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Ghi chú về tiến trình xử lý, các bước đã thực hiện, kết quả tạm thời..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Ví dụ: "Đã kiểm tra xe, phát hiện lỗi động cơ. Đang liên hệ
                kỹ thuật viên."
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setInternalNote("");
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleAddNote}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium disabled:opacity-50"
                disabled={isSubmitting || !internalNote.trim()}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}

      {/* Status Change Modal */}
      {showStatusModal &&
        createModal(
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thay đổi trạng thái
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái hiện tại
              </label>
              <div
                className={`px-4 py-3 rounded-xl mb-4 ${
                  COMPLAINT_STATUSES[complaint.status]?.color
                }`}
              >
                <p className="font-semibold">
                  {COMPLAINT_STATUSES[complaint.status]?.label}
                </p>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái mới
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn trạng thái --</option>
                {Object.entries(COMPLAINT_STATUSES).map(([key, status]) => (
                  <option key={key} value={key}>
                    {status.label}
                  </option>
                ))}
              </select>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Thay đổi trạng thái sẽ được ghi lại
                  trong tiến trình xử lý
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus("");
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleStatusChange}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                disabled={isSubmitting || !selectedStatus}
              >
                {isSubmitting ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default FeedbackDetail;
