import React, { useState } from 'react';
import { CheckSquare, Square, Settings, Download, Upload } from 'lucide-react';

const BulkActions = ({ 
    selectedUsers, 
    onBulkAction, 
    onExport, 
    onImport,
    totalUsers 
}) => {
    const [showActions, setShowActions] = useState(false);

    const bulkActions = [
        {
            label: 'Kích hoạt tài khoản',
            value: 'activate',
            description: 'Kích hoạt các tài khoản đã chọn'
        },
        {
            label: 'Tạm khóa tài khoản',
            value: 'suspend',
            description: 'Tạm khóa các tài khoản đã chọn'
        },
        {
            label: 'Vô hiệu hóa tài khoản',
            value: 'deactivate',
            description: 'Vô hiệu hóa các tài khoản đã chọn'
        },
        {
            label: 'Gửi email thông báo',
            value: 'notify',
            description: 'Gửi email đến các user đã chọn'
        }
    ];

    const handleBulkAction = (action) => {
        onBulkAction(selectedUsers, action);
        setShowActions(false);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Đã chọn: {selectedUsers.length} / {totalUsers}
                        </span>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Hành động hàng loạt</span>
                            </button>

                            {showActions && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    <div className="p-2">
                                        {bulkActions.map((action) => (
                                            <button
                                                key={action.value}
                                                onClick={() => handleBulkAction(action.value)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <div className="font-medium">{action.label}</div>
                                                <div className="text-xs text-gray-500">
                                                    {action.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={onExport}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Xuất Excel</span>
                    </button>

                    <label className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Nhập Excel</span>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => onImport(e.target.files[0])}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default BulkActions;