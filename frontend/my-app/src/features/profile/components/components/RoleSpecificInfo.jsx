import React from 'react';
import InfoField from './InfoField';
import { Building, Briefcase, Target, Shield, Lock } from 'lucide-react';

export const RoleSpecificInfo = ({ userProfile, formatDate, formatCurrency }) => {
    const renderReadOnlyRoleInfo = () => {
        const role = userProfile.roleToString;
        
        switch (role) {
            case 'DEALER_STAFF':
                return userProfile.dealerStaffProfile && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-blue-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-slate-800">Thông tin Nhân viên Đại lý</h3>
                            </div>
                            <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã nhân viên" value={userProfile.dealerStaffProfile.staffId} />
                            <InfoField label="Mã đại lý" value={userProfile.dealerStaffProfile.dealerId} />
                            <InfoField label="Chức vụ" value={userProfile.dealerStaffProfile.position} />
                            <InfoField label="Phòng ban" value={userProfile.dealerStaffProfile.department} />
                            <InfoField label="Ngày vào làm" value={formatDate(userProfile.dealerStaffProfile.hireDate)} />
                            <InfoField label="Lương" value={formatCurrency(userProfile.dealerStaffProfile.salary)} />
                        </div>
                    </div>
                );

            case 'DEALER_MANAGER':
                return userProfile.dealerManagerProfile && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Briefcase className="h-5 w-5 text-green-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-slate-800">Thông tin Quản lý Đại lý</h3>
                            </div>
                            <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã quản lý" value={userProfile.dealerManagerProfile.managerId} />
                            <InfoField label="Mã đại lý" value={userProfile.dealerManagerProfile.dealerId} />
                            <InfoField label="Cấp quản lý" value={userProfile.dealerManagerProfile.managementLevel} />
                            <InfoField label="Hạn mức phê duyệt" value={formatCurrency(userProfile.dealerManagerProfile.approvalLimit)} />
                        </div>
                    </div>
                );

            case 'EVM_STAFF':
                return userProfile.evmStaffProfile && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Target className="h-5 w-5 text-purple-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-slate-800">Thông tin Nhân viên EVM</h3>
                            </div>
                            <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Mã nhân viên" value={userProfile.evmStaffProfile.evmStaffId} />
                            <InfoField label="Phòng ban" value={userProfile.evmStaffProfile.department} />
                            <InfoField label="Chuyên môn" value={userProfile.evmStaffProfile.specialization} />
                        </div>
                    </div>
                );

            case 'ADMIN':
                return userProfile.adminProfile && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-red-600 mr-2"/>
                                <h3 className="text-lg font-semibold text-slate-800">Thông tin Quản trị viên</h3>
                            </div>
                            <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoField label="Mã quản trị" value={userProfile.adminProfile.admin_id} />
                            <InfoField label="Cấp quản trị" value={userProfile.adminProfile.adminLevel} />
                            <InfoField label="Quyền hệ thống" value={userProfile.adminProfile.systemPermissions} />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return renderReadOnlyRoleInfo();
};

export default React.memo(RoleSpecificInfo);