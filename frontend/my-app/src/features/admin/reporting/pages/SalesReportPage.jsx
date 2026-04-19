// File: SalesReportPage.jsx (Nâng cấp BƯỚC 5.2: Dynamic Select & Local Filter)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSalesSummary } from "../services/reportingService";
import SalesReportTable from "../components/SalesReportTable";
import { Card, Row, Col, Typography, Space, Select, Button } from "antd";
import { Doughnut, Bar } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
  CategoryScale, 
  LinearScale,   
  BarElement,    
} from 'chart.js';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { Option } = Select;

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartTitle,
  CategoryScale, 
  LinearScale,   
  BarElement     
);

// ... (Giữ nguyên style, skeleton, options mặc định) ...
const errorBoxStyle = { border: "1px solid #ffccc7", backgroundColor: "#fff2f0", padding: "16px", borderRadius: "8px", color: "#d4380d", textAlign: "center" };
const retryButtonStyle = { marginLeft: "8px", padding: "5px 10px", border: "1px solid #d4380d", background: "transparent", color: "#d4380d", borderRadius: "4px", cursor: "pointer" };
const TableSkeleton = () => ( <div style={{ padding: "20px" }}> <div style={{ height: "40px", backgroundColor: "#f0f0f0", marginBottom: "10px", borderRadius: "4px" }}></div> <div style={{ height: "40px", backgroundColor: "#f0f0f0", marginBottom: "10px", borderRadius: "4px" }}></div> </div> );
const doughnutChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
const baseBarChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };


// --- COMPONENT CHÍNH ---
const SalesReportPage = () => {
  const [reportData, setReportData] = useState([]); // Dữ liệu gốc từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho bộ lọc API (chỉ dùng cho Region nếu cần)
  const [apiFilters, setApiFilters] = useState({
    region: "",
    // modelId: "", // Tạm bỏ modelId ra khỏi API filter để lọc local
  });

  // State cho bộ lọc Local (Mẫu xe)
  const [selectedModel, setSelectedModel] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesSummary(apiFilters);
      setReportData(response.data); 
    } catch (err) {
      setError("Không thể tải báo cáo doanh số. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFilters]); // Chỉ gọi lại khi apiFilters thay đổi

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRegionChange = (value) => {
    setApiFilters(prev => ({ ...prev, region: value }));
  };

  // Hàm xử lý khi chọn Mẫu xe (Lọc local)
  const handleModelFilterLocal = (value) => {
    setSelectedModel(value);
  };

  // === LOGIC MỚI 1: Lấy danh sách Mẫu xe ĐỘNG (Unique) ===
  // Tự động tìm tất cả các mẫu xe có trong dữ liệu để đổ vào ô Select
  const uniqueModels = useMemo(() => {
    if (!reportData) return [];
    const models = reportData.map(item => item.modelName).filter(Boolean);
    // Dùng Set để loại bỏ trùng lặp
    return [...new Set(models)];
  }, [reportData]);

  // === LOGIC MỚI 2: Dữ liệu hiển thị (đã lọc) ===
  // Nếu có selectedModel, ta chỉ hiển thị các dòng khớp với model đó
  const displayData = useMemo(() => {
    if (!selectedModel) return reportData; // Nếu không chọn gì, hiển thị hết
    return reportData.filter(item => item.modelName === selectedModel);
  }, [reportData, selectedModel]);


  // === LOGIC BIỂU ĐỒ (Dùng displayData thay vì reportData) ===
  const chartDataByRegion = useMemo(() => {
    if (displayData.length === 0) return { labels: [], datasets: [] };
    const summary = displayData.reduce((acc, item) => {
      const region = item.region || 'Chưa xác định';
      const revenue = Number(item.totalRevenue) || 0;
      if (!acc[region]) acc[region] = 0;
      acc[region] += revenue;
      return acc;
    }, {});
    return {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Doanh thu',
        data: Object.values(summary),
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)'],
        borderWidth: 1,
      }],
    };
  }, [displayData]); // <-- Phụ thuộc displayData

  const chartDataByModel = useMemo(() => {
    if (displayData.length === 0) return { labels: [], datasets: [] };
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Chưa xác định';
      const quantity = Number(item.totalUnitsSold) || 0;
      if (!acc[model]) acc[model] = 0;
      acc[model] += quantity;
      return acc;
    }, {});
    return {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Số lượng bán',
        data: Object.values(summary),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    };
  }, [displayData]); // <-- Phụ thuộc displayData

  const dynamicBarChartOptions = useMemo(() => {
    const barDataValues = chartDataByModel.datasets[0]?.data || [];
    const maxQuantity = barDataValues.length > 0 ? Math.max(...barDataValues) : 0;
    const newMax = maxQuantity > 0 ? (Math.ceil(maxQuantity / 5) * 5) + 5 : 10;
    
    return {
      ...baseBarChartOptions, 
      scales: {
        y: { beginAtZero: true, max: newMax }
      }
    };
  }, [chartDataByModel]);

  // === LOGIC XUẤT EXCEL (Dùng displayData) ===
  const handleExportExcel = () => {
    if (displayData.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    const dataForExport = displayData.map(item => ({
      'Khu vực': item.region,
      'Tên Đại lý': item.dealershipName,
      'Mẫu xe': item.modelName,
      'Phiên bản': item.variantName,
      'Số lượng bán': Number(item.totalUnitsSold),
      'Tổng doanh thu (VND)': Number(item.totalRevenue),
      'Ngày bán cuối': new Date(item.lastSaleAt)
    }));
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    dataForExport.forEach((row, index) => {
      const cellIndex = index + 2; 
      const revenueCell = `F${cellIndex}`;
      ws[revenueCell] = { ...ws[revenueCell], t: 'n', z: '#,##0 "₫"' }; 
      const dateCell = `G${cellIndex}`;
      ws[dateCell] = { ...ws[dateCell], t: 'd', z: 'dd/mm/yyyy' };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoDoanhSo');
    XLSX.writeFile(wb, 'BaoCaoDoanhSo.xlsx');
  };

  return (
    <Card style={{ margin: "24px", backgroundColor: "#f9fbfd" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: "#333" }}>
            💰 Báo cáo Doanh số theo Khu vực & Đại lý
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              placeholder="Chọn khu vực"
              style={{ width: 200 }}
              onChange={handleRegionChange}
              allowClear
            >
              <Option value="Miền Bắc">Miền Bắc</Option>
              <Option value="Miền Trung">Miền Trung</Option>
              <Option value="Miền Nam">Miền Nam</Option>
            </Select>

            {/* --- SELECT MẪU XE ĐỘNG (Dynamic) --- */}
            <Select
              placeholder="Chọn mẫu xe"
              style={{ width: 200 }}
              onChange={handleModelFilterLocal} // Dùng hàm lọc local
              allowClear
              value={selectedModel}
            >
              {/* Tự động tạo Option từ uniqueModels */}
              {uniqueModels.map(model => (
                <Option key={model} value={model}>{model}</Option>
              ))}
            </Select>
            
            <Button 
              type="primary" 
              onClick={handleExportExcel}
              disabled={loading || displayData.length === 0}
            >
              Xuất Excel
            </Button>
          </Space>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: '16px' }}>Tổng quan</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card>
            <Title level={5}>Doanh thu theo Khu vực</Title>
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p>Lỗi tải biểu đồ.</p>}
            <div style={{ height: '250px' }}> 
              {!loading && !error && chartDataByRegion.labels.length > 0 && (
                <Doughnut data={chartDataByRegion} options={doughnutChartOptions} />
              )}
              {!loading && !error && chartDataByRegion.labels.length === 0 && <p>Chưa có dữ liệu.</p>}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Title level={5}>Số lượng bán theo Mẫu xe</Title>
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p>Lỗi tải biểu đồ.</p>}
            <div style={{ height: '250px' }}>
              {!loading && !error && chartDataByModel.labels.length > 0 && (
                <Bar data={chartDataByModel} options={dynamicBarChartOptions} />
              )}
               {!loading && !error && chartDataByModel.labels.length === 0 && <p>Chưa có dữ liệu.</p>}
            </div>
          </Card>
        </Col>
      </Row>

      <Title level={5}>Báo cáo Chi tiết</Title>
      <div className="report-content">
        {loading && <TableSkeleton />}
        {error && (
          <div style={errorBoxStyle}>
             <p>{error}</p>
             <button style={retryButtonStyle} onClick={fetchReport}>
               🔄 Thử lại
             </button>
          </div>
        )}
        {/* Dùng displayData cho bảng */}
        {!loading && !error && displayData.length === 0 && (
          <p>Không có dữ liệu nào khớp với bộ lọc.</p>
        )}
        {!loading && !error && displayData.length > 0 && (
          <SalesReportTable data={displayData} />
        )}
      </div>
    </Card>
  );
};

export default SalesReportPage;