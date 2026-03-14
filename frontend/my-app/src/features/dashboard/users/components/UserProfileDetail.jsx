import React from 'react';
import { 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    Building, 
    DollarSign, 
    Percent, 
    Badge,
    Clock,
    UserCheck
} from 'lucide-react';

const UserProfileDetail = ({ userProfile, mode = 'view' }) => {
    
    if (!userProfile) return null;
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Chưa cập nhật';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getProfileSpecificInfo = () => {
        const profileTypes = ['dealerStaffProfile', 'dealerManagerProfile', 'evmStaffProfile', 'adminProfile'];
        for (const profileType of profileTypes) {
            if (userProfile[profileType]) {
                return { type: profileType, data: userProfile[profileType] };
            }
        }
        return null;
    };

    const profileInfo = getProfileSpecificInfo();

    return (
        mode === 'view' &&
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin cơ bản
                </h3>   
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem 
                        icon={<Mail className="w-4 h-4" />}
                        label="Email"
                        value={userProfile.email}
                    />
                    <InfoItem 
                        icon={<Phone className="w-4 h-4" />}
                        label="Số điện thoại"
                        value={userProfile.phone || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        icon={<Calendar className="w-4 h-4" />}
                        label="Ngày sinh"
                        value={formatDate(userProfile.birthday)}
                    />
                    <InfoItem 
                        label="Giới tính"
                        value={userProfile.gender === 'MALE' ? 'Nam' : 
                               userProfile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                    />
                    <InfoItem 
                        icon={<MapPin className="w-4 h-4" />}
                        label="Địa chỉ"
                        value={userProfile.address || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        label="Thành phố"
                        value={userProfile.city || 'Chưa cập nhật'}
                    />
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Badge className="w-5 h-5 mr-2 text-green-600" />
                    Thông tin tài khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem 
                        label="Vai trò"
                        value={userProfile.roleToString}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    />
                    <InfoItem 
                        label="Trạng thái"
                        value={
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userProfile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                userProfile.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {userProfile.status === 'ACTIVE' ? 'Đang hoạt động' :
                                 userProfile.status === 'INACTIVE' ? 'Ngừng hoạt động' : 'Tạm khóa'}
                            </span>
                        }
                    />
                    <InfoItem 
                        icon={<Clock className="w-4 h-4" />}
                        label="Ngày tạo"
                        value={formatDate(userProfile.createdAt)}
                    />
                    <InfoItem 
                        icon={<Clock className="w-4 h-4" />}
                        label="Đăng nhập cuối"
                        value={formatDate(userProfile.lastLogin)}
                    />
                </div>
            </div>

            {/* Profile Specific Information */}
            {profileInfo && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-purple-600" />
                        Thông tin chuyên sâu
                    </h3>
                    {renderProfileSpecificInfo(profileInfo)}
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ icon, label, value, className }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-gray-600 mb-1">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
        </div>
        <div className={className || "text-sm font-medium text-gray-900"}>
            {value}
        </div>
    </div>
);

const renderProfileSpecificInfo = (profileInfo) => {
    const { type, data } = profileInfo;

    switch (type) {
        case 'dealerStaffProfile':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem 
                        label="Mã nhân viên"
                        value={data.staffId}
                    />
                    <InfoItem 
                        label="Mã đại lý"
                        value={data.dealerId}
                    />
                    <InfoItem 
                        label="Vị trí"
                        value={data.position || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        label="Phòng ban"
                        value={data.department || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        icon={<Calendar className="w-4 h-4" />}
                        label="Ngày vào làm"
                        value={data.hireDate ? new Date(data.hireDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        icon={<DollarSign className="w-4 h-4" />}
                        label="Lương"
                        value={data.salary ? new Intl.NumberFormat('vi-VN').format(data.salary) + ' VND' : 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        icon={<Percent className="w-4 h-4" />}
                        label="Tỷ lệ hoa hồng"
                        value={data.commissionRate ? data.commissionRate + '%' : 'Chưa cập nhật'}
                    />
                </div>
            );

        case 'dealerManagerProfile':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem 
                        label="Mã quản lý"
                        value={data.managerId}
                    />
                    <InfoItem 
                        label="Mã đại lý"
                        value={data.dealerId}
                    />
                    <InfoItem 
                        label="Cấp quản lý"
                        value={data.managementLevel || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        label="Giới hạn phê duyệt"
                        value={data.approvalLimit ? new Intl.NumberFormat('vi-VN').format(data.approvalLimit) + ' VND' : 'Chưa cập nhật'}
                    />
                </div>
            );

        case 'evmStaffProfile':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem 
                        label="Mã nhân viên EVM"
                        value={data.staffId}
                    />
                    <InfoItem 
                        label="Phòng ban"
                        value={data.department || 'Chưa cập nhật'}
                    />
                    <InfoItem 
                        label="Chuyên môn"
                        value={data.specialization || 'Chưa cập nhật'}
                    />
                </div>
            );

        case 'adminProfile':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem 
                        label="Mã quản trị"
                        value={data.adminId}
                    />
                    <InfoItem 
                        label="Cấp quản trị"
                        value={data.adminLevel || 'Chưa cập nhật'}
                    />
                </div>
            );

        default:
            return null;
    }
};

export default UserProfileDetail;