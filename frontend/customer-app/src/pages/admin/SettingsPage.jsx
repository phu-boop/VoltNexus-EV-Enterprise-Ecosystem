import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Divider, message } from 'antd';
import { RefreshCw, Server, Database } from 'lucide-react';
import reportingService from '../../services/reportingService';

const { Title, Text, Paragraph } = Typography;

export default function AdminSettingsPage() {
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const handleSyncSales = async () => {
    setLoadingSales(true);
    try {
      await reportingService.syncData();
      message.success("Đồng bộ dữ liệu đơn hàng thành công!");
    } catch (error) {
      console.error("Sync sales failed", error);
      message.error("Đồng bộ thất bại. Vui lòng kiểm tra console.");
    } finally {
      setLoadingSales(false);
    }
  };

  const handleSyncInventory = async () => {
    setLoadingInventory(true);
    try {
        await reportingService.syncInventoryData();
        message.success("Đồng bộ tồn kho thành công!");
    } catch (error) {
       console.error("Sync inventory failed", error);
       message.error("Đồng bộ tồn kho thất bại.");
    } finally {
        setLoadingInventory(false);
    }
  };

  const handleSyncMetadata = async () => {
       try {
            message.loading("Đang đồng bộ Metadata...", 1);
            await reportingService.syncMetadata();
            message.success("Đồng bộ danh mục (xe, đại lý) hoàn tất!");
       } catch (error) {
            message.error("Lỗi khi đồng bộ Metadata.");
       }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Title level={2}>Cài đặt hệ thống</Title>
        <Text type="secondary">Quản lý đồng bộ dữ liệu và cấu hình hệ thống</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
           <Card 
             title={<><Server size={20} className="inline mr-2 text-blue-600"/> Đồng bộ Dữ liệu Báo cáo</>} 
             variant="borderless" 
             className="shadow-sm"
           >
             <div className="flex items-start justify-between">
                <div>
                    <Text strong className="block text-lg mb-1">Dữ liệu Bán hàng (Sales Orders)</Text>
                    <Paragraph type="secondary" className="mb-0 max-w-lg">
                        Đồng bộ tất cả đơn hàng từ Sales Service về Reporting Service. 
                        Hành động này giúp đảm bảo dữ liệu báo cáo lịch sử là chính xác nhất.
                        <br/>
                        <span className="text-orange-500 text-xs">Lưu ý: Quá trình này có thể mất vài phút nếu dữ liệu lớn.</span>
                    </Paragraph>
                </div>
                <Button 
                    type="primary" 
                    icon={<RefreshCw size={16} className={loadingSales ? "animate-spin" : ""} />} 
                    onClick={handleSyncSales} 
                    loading={loadingSales}
                >
                    Đồng bộ ngay
                </Button>
             </div>

             <Divider />

             <div className="flex items-start justify-between">
                <div>
                    <Text strong className="block text-lg mb-1">Dữ liệu Tồn kho (Inventory)</Text>
                    <Paragraph type="secondary" className="mb-0 max-w-lg">
                        Cập nhật trạng thái tồn kho mới nhất từ Inventory Service.
                        Dữ liệu này được sử dụng cho các biểu đồ phân tích hàng tồn.
                    </Paragraph>
                </div>
                 <Button 
                    type="default" 
                    icon={<Database size={16} />} 
                    onClick={handleSyncInventory} 
                    loading={loadingInventory}
                >
                    Đồng bộ Inventory
                </Button>
             </div>

             <Divider />

             <div className="flex items-start justify-between">
                <div>
                    <Text strong className="block text-lg mb-1">Dữ liệu Xe & Đại lý (Metadata)</Text>
                    <Paragraph type="secondary" className="mb-0 max-w-lg">
                        Làm mới thông tin danh mục xe, phiên bản và danh sách đại lý.
                        Giúp các bộ lọc báo cáo hiển thị đầy đủ thông tin nhất.
                    </Paragraph>
                </div>
                 <Button 
                    type="dashed" 
                    icon={<Database size={16} />} 
                    onClick={handleSyncMetadata} 
                >
                    Đồng bộ Metadata
                </Button>
             </div>
           </Card>
        </Col>
      </Row>
    </div>
  );
}
