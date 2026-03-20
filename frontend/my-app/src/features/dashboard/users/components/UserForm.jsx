import React, {useState, useEffect} from "react";
import {X, Save, User, Mail, Phone, MapPin, Calendar, Eye, EyeOff, Edit} from "lucide-react";
import {dealerService} from "../services/dealerService";
export default function UserForm({isOpen, onClose, onSubmit, initialData, mode = "add"}) {
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        name: "",
        fullName: "",
        password: "",
        address: "",
        city: "",
        country: "",
        birthday: "",
        gender: "MALE",
        role: "",
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [dealers, setDealers] = useState([]); // Thêm state cho danh sách dealers
    const [availableRoles, setAvailableRoles] = useState([]);

    useEffect(() => {
        const roles = sessionStorage.getItem("roles");

        if (roles?.includes("ADMIN")) {
        setAvailableRoles(["ADMIN", "EVM_STAFF", "DEALER_MANAGER"]);
        } else if (roles?.includes("EVM_STAFF")) {
        setAvailableRoles(["DEALER_MANAGER"]);
        } else {
        setAvailableRoles(["DEALER_STAFF"]);
        } 
    }, []);
    // Thêm useEffect để fetch danh sách dealers
    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const response = (await dealerService.getAll()).data;
                if (response.code === "1000") {
                    setDealers(response.data);
                }
            } catch (error) {
                console.error("Error fetching dealers:", error);
            }
        };

        if (isOpen) {
            fetchDealers();
        }
    }, [isOpen]);

   useEffect(() => {
    if (initialData) {
        // Xác định role từ roles array
        const roles = initialData.roles || [];
        const mainRole = roles.length > 0 ? roles[0].name : '';
        
        // Chuẩn bị dữ liệu cơ bản
        const baseData = {
            ...initialData,
            role: mainRole,
            password: "", // Luôn để password trống khi edit
            gender: initialData.gender || 'MALE' // Đảm bảo gender không null
        };

        // Thêm dữ liệu profile-specific
        if (initialData.dealerStaffProfile) {
            Object.assign(baseData, initialData.dealerStaffProfile);
        } else if (initialData.dealerManagerProfile) {
            Object.assign(baseData, initialData.dealerManagerProfile);
        } else if (initialData.evmStaffProfile) {
            Object.assign(baseData, initialData.evmStaffProfile);
        } else if (initialData.adminProfile) {
            Object.assign(baseData, initialData.adminProfile);
        }

        setFormData(baseData);
    } else {
        setFormData({
            email: "",
            phone: "",
            name: "",
            fullName: "",
            password: "",
            address: "",
            city: "",
            country: "",
            birthday: "",
            gender: "MALE", // Mặc định là MALE
            role: "",
            // Dealer Staff fields
            dealerId: "",
            position: "",
            department: "",
            hireDate: "",
            salary: "",
            commissionRate: "",
            // Dealer Manager fields
            managementLevel: "",
            approvalLimit: "",
            // EVM Staff fields
            specialization: ""
        });
    }
    setErrors({});
    setIsEditing(mode === "edit");
}, [initialData, isOpen, mode]);

    if (!isOpen) return null;

   const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";

    if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc";

    if (!formData.name) newErrors.name = "Tên là bắt buộc";

    if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc";

    if (!initialData && !formData.password) {
        newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password && formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Đảm bảo gender không null
    if (!formData.gender) {
        newErrors.gender = "Giới tính là bắt buộc";
    }

    // Role-specific validation
    if (formData.role === "DEALER_STAFF") {
        if (!formData.dealerId) newErrors.dealerId = "Mã đại lý là bắt buộc";
        if (!formData.department) newErrors.department = "Phòng ban là bắt buộc";
    }

    if (formData.role === "DEALER_MANAGER") {
        if (!formData.dealerId) newErrors.dealerId = "Mã đại lý là bắt buộc";
        if (!formData.managementLevel) newErrors.managementLevel = "Cấp quản lý là bắt buộc";
    }

    if (formData.role === "EVM_STAFF") {
        if (!formData.department) newErrors.department = "Phòng ban là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleChange = (e) => {
        if (mode === "view" && !isEditing) return; // Không cho phép chỉnh sửa ở chế độ xem khi không bật chỉnh sửa

        const {name, value, type, checked} = e.target;

        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                roles: checked
                    ? [...prev.roles, value]
                    : prev.roles.filter((role) => role !== value),
            }));
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ""}));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "view") {
            if (isEditing) {
                // Nếu đang ở chế độ chỉnh sửa trong view mode
                if (validateForm()) {
                    onSubmit(formData);
                }
            } else {
                // Nếu chỉ đang xem, cho phép đóng form
                onClose();
            }
            return;
        }

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const isViewMode = mode === "view";
    const isReadOnly = isViewMode && !isEditing;

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full p-2 max-w-xl max-h-[100vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {mode === "add" && "Thêm nhân viên mới"}
                        {mode === "edit" && "Cập nhật nhân viên"}
                        {mode === "view" && "Chi tiết nhân viên"}
                    </h2>
                    <div className="flex items-center gap-2">
                        {isViewMode && (
                            <button
                                onClick={handleToggleEdit}
                                className={`p-2 rounded-full ${
                                    isEditing
                                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                } transition-colors`}
                                title={isEditing ? "Tắt chỉnh sửa" : "Chỉnh sửa"}
                            >
                                {isEditing ? <EyeOff size={18}/> : <Edit size={18}/>}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : "bg-gray-100 cursor-not-allowed"}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại *
                        </label>
                        <div className="relative">
                            <Phone
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="phone"
                                placeholder="0912345678"
                                value={formData.phone}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên *
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                <input
                                    name="name"
                                    placeholder="Tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.name ? "border-red-500" : "border-gray-300"
                                    } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                name="fullName"
                                placeholder="Họ và tên đầy đủ"
                                value={formData.fullName}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.fullName ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                            )}
                        </div>
                    </div>

                    {(!initialData || (isViewMode && isEditing)) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu {!initialData && "*"}
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? "border-red-500" : "border-gray-300"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            {isViewMode && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Để trống nếu không muốn thay đổi mật khẩu
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                name="address"
                                placeholder="Địa chỉ"
                                value={formData.address}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thành phố
                            </label>
                            <input
                                name="city"
                                placeholder="Thành phố"
                                value={formData.city}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quốc gia
                            </label>
                            <input
                                name="country"
                                placeholder="Quốc gia"
                                value={formData.country}
                                onChange={handleChange}
                                readOnly={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh
                            </label>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                <input
                                    name="birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                    }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới tính
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>


                    <div className="">

                        {/* Vai trò người dùng */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vai trò *
                            </label>
                            <select
                                name="role"
                                value={formData.role || ""}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                                }`}
                            >
                                  <option value="">Tất cả</option>
                                    {availableRoles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                    ))}
                            </select>
                        </div>

                        {/* EVM Staff */}
                        {formData.role === "EVM_STAFF" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department *
                                    </label>
                                    <input
                                        name="department"
                                        placeholder="Phòng ban"
                                        value={formData.department || ""}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialization *
                                    </label>
                                    <input
                                        name="specialization"
                                        placeholder="Chuyên môn"
                                        value={formData.specialization || ""}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}

                        {/* Dealer Manager */}
                        {formData.role === "DEALER_MANAGER" && (
                            <>
                                <div className="mb-4">
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Dealer ID <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="dealerId"
                                value={formData.dealerId || ""}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className={`w-full px-4 py-2 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-colors duration-200 ${
                                    errors.dealerId ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:bg-indigo-50"
                                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            >
                                <option value="">-- Chọn đại lý --</option>
                                {dealers.map((dealer) => (
                                    <option key={dealer.dealerId} value={dealer.dealerId}>
                                        {dealer.dealerName}
                                    </option>
                                ))}
                            </select>
                            {errors.dealerId && (
                                <p className="mt-1 text-sm text-red-600">{errors.dealerId}</p>
                            )}
                        </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department *
                                    </label>
                                    <input
                                        name="department"
                                        placeholder="Phòng ban"
                                        value={formData.department || ""}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Management Level *
                                    </label>
                                    <input
                                        name="managementLevel"
                                        placeholder="Cấp quản lý (VD: Senior Manager)"
                                        value={formData.managementLevel || ""}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Approval Limit *
                                    </label>
                                    <input
                                        name="approvalLimit"
                                        type="number"
                                        step="0.01"
                                        placeholder="Giới hạn phê duyệt (VNĐ)"
                                        value={formData.approvalLimit || ""}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        className=""
                                    />
                                </div>
                                <button>
                                    xem 
                                </button>
                            </>
                        )}

                        {/* Dealer Staff */}
                        {formData.role === "DEALER_STAFF" && (
                            <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    Thông tin nhân viên đại lý
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Dealer ID */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Mã đại lý *
                                        </label>
                                        <select
                                            name="dealerId"
                                            value={formData.dealerId || ""}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                                                errors.dealerId ? "border-red-500" : "border-gray-300"
                                            } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                        >
                                            <option value="">-- Chọn đại lý --</option>
                                            {sessionStorage.getItem("roles")?.includes("DEALER_MANAGER") ? (
                                                <option
                                                    value={sessionStorage.getItem("dealerId")
                                                }>
                                                    Đại lý của tôi
                                                </option>
                                            ) :   
                                            (dealers.map((dealer) => (
                                                <option key={dealer.dealerId} value={dealer.dealerId}>
                                                    {dealer.dealerName}
                                                </option>
                                            ))) }
                                        </select>
                                        {errors.dealerId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dealerId}</p>
                                        )}
                                    </div>

                                    {/* Department */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phòng ban *
                                        </label>
                                        <input
                                            name="department"
                                            placeholder="Nhập phòng ban"
                                            value={formData.department || ""}
                                            onChange={handleChange}
                                            readOnly={isReadOnly}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                        />
                                    </div>

                                    {/* Position */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Vị trí công việc *
                                        </label>
                                        <input
                                            name="position"
                                            placeholder="Vị trí công việc (VD: Sales)"
                                            value={formData.position || ""}
                                            onChange={handleChange}
                                            readOnly={isReadOnly}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Hire Date */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày vào làm *
                                        </label>
                                        <input
                                            name="hireDate"
                                            type="date"
                                            value={formData.hireDate || ""}
                                            onChange={handleChange}
                                            readOnly={isReadOnly}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                                        />
                                    </div>

                                    {/* Salary */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Lương cơ bản *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="salary"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.salary || ""}
                                                onChange={handleChange}
                                                readOnly={isReadOnly}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white pr-10"
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            VND
                                          </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Commission Rate */}
                                <div className="space-y-2 max-w-md">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tỷ lệ hoa hồng *
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="commissionRate"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.commissionRate || ""}
                                            onChange={handleChange}
                                            readOnly={isReadOnly}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white pr-10"
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                          %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {isViewMode && !isEditing ? "Đóng" : "Hủy"}
                            </button>
                            {(!isViewMode || isEditing) && (
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <Save size={18} className="mr-2"/>
                                    {mode === "add" ? "Thêm mới" : "Cập nhật"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}