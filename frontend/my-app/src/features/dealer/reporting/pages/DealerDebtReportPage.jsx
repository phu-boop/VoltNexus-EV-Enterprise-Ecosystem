// File: src/features/dealer/reporting/pages/DealerDebtReportPage.jsx
// (FINAL VERSION: Dashboard Phân tích + Xuất Excel Đa Sheet)

import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Typography, Spin, Button, List, Avatar } from "antd";
import { FileExcelOutlined, ShopOutlined, WarningOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { getB2BDebtReport, getB2CDebtReport } from "../services/dealerReportingService";

// --- Import Chart.js ---
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
const { Title, Text } = Typography;

const DealerDebtReportPage = () => {
  const [b2bData, setB2bData] = useState(null);
  const [b2cData, setB2cData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [b2bRes, b2cRes] = await Promise.all([
          getB2BDebtReport(),
          getB2CDebtReport()
        ]);
        setB2bData(b2bRes);
        setB2cData(b2cRes);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // --- LOGIC: Top 5 Hóa đơn B2B (Nợ nhiều nhất) ---
  const topDebtsB2B = useMemo(() => {
    if (!b2bData?.details) return [];
    return [...b2bData.details]
      .sort((a, b) => (b.remainingAmount || 0) - (a.remainingAmount || 0))
      .slice(0, 5);
  }, [b2bData]);

  // --- LOGIC: Top 5 Đơn hàng B2C (Khách nợ nhiều nhất) ---
  const topDebtsB2C = useMemo(() => {
    if (!b2cData?.details) return [];
    return [...b2cData.details]
      .map(item => {
         const total = Number(item.totalAmount) || 0;
         const paid = Number(item.downPayment) || 0;
         const remain = total - paid;
         return { ...item, remain };
      })
      .filter(item => item.remain > 0) // Chỉ lấy khách còn nợ
      .sort((a, b) => b.remain - a.remain)
      .slice(0, 5);
  }, [b2cData]);


  // --- CHART OPTIONS ---
  const barChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  const doughnutOptions = { 
    responsive: true, 
    cutout: '70%', 
    plugins: { legend: { display: false } } 
  };

  // --- CHART DATA ---
  const b2bBarChartData = useMemo(() => {
    return {
      labels: topDebtsB2B.map(item => `#${String(item.dealerInvoiceId || '').substring(0,6)}`),
      datasets: [
        {
          label: 'Tổng tiền',
          data: topDebtsB2B.map(item => item.totalAmount),
          backgroundColor: '#1890ff',
        },
        {
          label: 'Còn nợ',
          data: topDebtsB2B.map(item => item.remainingAmount),
          backgroundColor: '#ff4d4f',
        }
      ]
    };
  }, [topDebtsB2B]);
  
  const b2bPieData = useMemo(() => {
    const paid = b2bData?.summary?.totalPaid || 0;
    const remaining = b2bData?.summary?.totalRemaining || 0;
    if (!paid && !remaining) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return { labels: ['Đã trả', 'Còn nợ'], datasets: [{ data: [paid, remaining], backgroundColor: ['#52c41a', '#ff4d4f'], borderWidth: 0 }] };
  }, [b2bData]);
  
  const b2cPieData = useMemo(() => {
    const collected = b2cData?.summary?.totalCollected || 0;
    const outstanding = b2cData?.summary?.totalOutstanding || 0;
    if (!collected && !outstanding) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return { labels: ['Đã thu', 'Còn nợ'], datasets: [{ data: [collected, outstanding], backgroundColor: ['#1890ff', '#faad14'], borderWidth: 0 }] };
  }, [b2cData]);

  // --- XUẤT EXCEL ĐA SHEET (FIXED) ---
  const handleExportExcel = () => {
    try {
        const wb = XLSX.utils.book_new();

        // Sheet 1: B2B (Nợ Hãng)
        const b2bExport = (b2bData?.details || []).map(item => ({ 
            'Mã HĐ': item.dealerInvoiceId, 
            'Ngày tạo': item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '',
            'Tổng tiền': item.totalAmount,
            'Đã trả': item.amountPaid,
            'Còn nợ': item.remainingAmount,
            'Trạng thái': item.status
        }));
        const ws1 = XLSX.utils.json_to_sheet(b2bExport);
        // Chỉnh độ rộng cột B2B
        ws1['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}];
        XLSX.utils.book_append_sheet(wb, ws1, "No_Voi_Hang_B2B");

        // Sheet 2: B2C (Khách Nợ)
        const b2cExport = (b2cData?.details || []).map(item => ({
             'Mã Đơn': item.orderId,
             'Khách hàng': item.customerId ? `KH-${item.customerId}` : 'Khách lẻ',
             'Ngày đặt': item.orderDate ? new Date(item.orderDate).toLocaleDateString('vi-VN') : '',
             'Tổng tiền': item.totalAmount,
             'Đã thu': item.downPayment,
             // Tính toán lại cột còn nợ cho chính xác trong excel
             'Còn lại': (Number(item.totalAmount) || 0) - (Number(item.downPayment) || 0)
        }));
        const ws2 = XLSX.utils.json_to_sheet(b2cExport);
        // Chỉnh độ rộng cột B2C
        ws2['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}];
        XLSX.utils.book_append_sheet(wb, ws2, "B2C_KhachNo");

        XLSX.writeFile(wb, "BaoCao_PhanTich_CongNo.xlsx");
    } catch (e) {
        console.error("Lỗi xuất Excel:", e);
        alert("Có lỗi khi xuất file Excel");
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3} style={{ margin: 0 }}>📊 Phân Tích Tài Chính & Công Nợ</Title></Col>
        <Col><Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel Chi Tiết</Button></Col>
      </Row>

      {/* PHẦN 1: KPI CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* B2B Card */}
        <Col xs={24} md={12}>
          <Card bordered={false} style={{borderLeft: '4px solid #ff4d4f'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <Text type="secondary">Tổng nợ phải trả hãng (B2B)</Text>
                    <Title level={2} style={{margin: '5px 0', color: '#ff4d4f'}}>{formatCurrency(b2bData?.summary?.totalRemaining)}</Title>
                    <Text type="secondary">Trên tổng nhập: {formatCurrency(b2bData?.summary?.totalDebt)}</Text>
                </div>
                <div style={{width: 80, height: 80}}><Doughnut data={b2bPieData} options={doughnutOptions} /></div>
             </div>
          </Card>
        </Col>
        {/* B2C Card */}
        <Col xs={24} md={12}>
          <Card bordered={false} style={{borderLeft: '4px solid #faad14'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <Text type="secondary">Tổng khách còn nợ (B2C)</Text> 
                    <Title level={2} style={{margin: '5px 0', color: '#faad14'}}>{formatCurrency(b2cData?.summary?.totalOutstanding)}</Title>
                    <Text type="secondary">Doanh số bán: {formatCurrency(b2cData?.summary?.totalReceivable)}</Text>
                </div>
                <div style={{width: 80, height: 80}}><Doughnut data={b2cPieData} options={doughnutOptions} /></div>
             </div>
          </Card>
        </Col>
      </Row>

      {/* PHẦN 2: CHI TIẾT */}
      <Row gutter={[24, 24]}>
        
        {/* CỘT TRÁI: Top 5 Hóa đơn nợ lớn nhất (B2B) */}
        <Col xs={24} xl={12}>
            <Card title={<span><WarningOutlined style={{color: 'red'}}/> Top 5 Hóa đơn nợ lớn nhất (B2B)</span>} bordered={false} style={{height: '100%'}}>
                <div style={{height: 300}}>
                    <Bar data={b2bBarChartData} options={barChartOptions} />
                </div>
            </Card>
        </Col>

        {/* CỘT PHẢI: Top 5 Khách nợ nhiều nhất (B2C) */}
        <Col xs={24} xl={12}>
             <Card title={<span><UserOutlined style={{color: '#faad14'}}/> Top 5 Khách hàng còn nợ nhiều nhất</span>} bordered={false} style={{height: '100%'}}>
                <List
                    itemLayout="horizontal"
                    dataSource={topDebtsB2C}
                    renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                        avatar={<Avatar style={{backgroundColor: '#faad14', verticalAlign: 'middle'}} size="large">{index + 1}</Avatar>}
                        title={<div style={{display:'flex', justifyContent:'space-between'}}>
                                {/* An toàn: String() tránh lỗi substring */}
                                <Text strong>KH-{String(item.customerId || '').substring(0,6)}</Text>
                                <Text type="warning" strong>{formatCurrency(item.remain)}</Text>
                              </div>}
                        description={
                            <div>
                                <span>Mã đơn: {String(item.orderId || '').substring(0,8)}...</span> <br/>
                                <span>Ngày: {item.orderDate ? new Date(item.orderDate).toLocaleDateString('vi-VN') : '-'}</span>
                                <span style={{marginLeft: 10, fontSize: 12}}>(Tổng đơn: {formatCurrency(item.totalAmount)})</span>
                            </div>
                        }
                        />
                    </List.Item>
                    )}
                />
                {topDebtsB2C.length === 0 && <div style={{textAlign:'center', padding: 20, color: 'green'}}>Tuyệt vời! Không có khách hàng nào đang nợ.</div>}
            </Card>
        </Col>
      </Row>

    </div>
  );
};

export default DealerDebtReportPage;