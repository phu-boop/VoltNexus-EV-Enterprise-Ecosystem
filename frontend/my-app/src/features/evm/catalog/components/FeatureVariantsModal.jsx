import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Empty, Spin, Button, Tooltip } from 'antd';
import { Car, Box, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getVariantsByFeature } from '../services/vehicleCatalogService';

const FeatureVariantsModal = ({ isOpen, onClose, feature }) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isOpen && feature?.featureId) {
            fetchVariants();
        }
    }, [isOpen, feature]);

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const response = await getVariantsByFeature(feature.featureId);
            setVariants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching variants for feature:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (record) => {
        // Xác định tiền tố route dựa trên URL hiện tại (admin hoặc staff)
        const isAdmin = location.pathname.includes('/admin/');
        const prefix = isAdmin ? '/evm/admin/products/variants' : '/evm/staff/products/variants';

        // Điều hướng với query params
        navigate(`${prefix}?modelId=${record.modelId}&variantId=${record.variantId}`);
        onClose();
    };

    const handleJumpToCatalog = (modelId) => {
        const isAdmin = location.pathname.includes('/admin/');
        const prefix = isAdmin ? '/evm/admin/products/catalog' : '/evm/staff/products/catalog';
        navigate(`${prefix}?modelId=${modelId}`);
        onClose();
    };

    const columns = [
        {
            title: 'Mẫu xe / Phiên bản',
            key: 'model',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span
                        className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                        onClick={() => handleJumpToCatalog(record.modelId)}
                        title="Xem trong danh mục"
                    >
                        {record.modelName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium tracking-wide uppercase px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded w-fit mt-1">
                        {record.versionName}
                    </span>
                </div>
            )
        },
        {
            title: 'Giá niêm yết',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span className="text-indigo-600 font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
            )
        },
        {
            title: 'Loại trang bị',
            key: 'type',
            render: (text, record) => (
                record.isStandard ? (
                    <Tag color="cyan" className="rounded-full px-3 border-none text-[10px] font-bold uppercase tracking-wider">Tiêu chuẩn</Tag>
                ) : (
                    <div className="flex flex-col">
                        <Tag color="geekblue" className="rounded-full px-3 border-none w-fit text-[10px] font-bold uppercase tracking-wider">Tùy chọn</Tag>
                        {record.additionalCost > 0 && (
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">
                                + {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.additionalCost)}
                            </span>
                        )}
                    </div>
                )
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết phiên bản">
                    <Button
                        type="text"
                        icon={<ExternalLink className="w-4 h-4 text-indigo-500" />}
                        onClick={() => handleViewDetails(record)}
                        className="hover:bg-indigo-50 flex items-center justify-center"
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <Car className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">Biến thể dòng xe</h3>
                        <p className="text-xs text-indigo-500 font-semibold mt-0.5">Tính năng: {feature?.featureName}</p>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={720}
            centered
            className="premium-modal-scroll"
        >
            <div className="pt-2 pb-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Spin size="large" />
                        <span className="text-sm text-slate-400 font-medium animate-pulse">Đang truy vấn dữ liệu biến thể...</span>
                    </div>
                ) : variants.length > 0 ? (
                    <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm bg-white mt-4">
                        <Table
                            dataSource={variants}
                            columns={columns}
                            rowKey="variantId"
                            pagination={false}
                            size="middle"
                            className="variant-list-table custom-table"
                        />
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center">
                        <Box className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium">Chưa có phiên bản nào được gán tính năng này</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FeatureVariantsModal;
