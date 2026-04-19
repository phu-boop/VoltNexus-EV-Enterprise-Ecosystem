import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Spin, Statistic, Row, Col, Typography, Alert, Divider } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Activity, BrainCircuit } from 'lucide-react';
import reportingService from '../../services/reportingService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  // New States for AI JSON
  const [forecastAnalysis, setForecastAnalysis] = useState("");
  const [forecastChartData, setForecastChartData] = useState([]);

  const [forecastResult, setForecastResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [forecastExists, setForecastExists] = useState(false);

  // Derived states
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [regionData, setRegionData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    checkForecastExistence();
  }, [selectedModel]);

  const checkForecastExistence = async () => {
    const status = await reportingService.checkForecastStatus(selectedModel);
    setForecastExists(status.exists);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await reportingService.getSalesSummary();
      setSalesData(data);
      processData(data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    let revenue = 0;
    
    // 1. Sales Trend (by Date)
    const trendMap = {};
    const modelMap = {};
    const regionMap = {};

    data.forEach(item => {
      revenue += Number(item.totalAmount) || 0;
      
      // Date Trend
      const date = dayjs(item.orderDate).format('YYYY-MM-DD');
      if (!trendMap[date]) trendMap[date] = 0;
      trendMap[date] += Number(item.totalAmount);

      // Model Popularity
      let model = item.modelName || 'Chưa xác định';
      if (model === 'Unknown') model = 'Chưa xác định';
      
      if (!modelMap[model]) modelMap[model] = 0;
      modelMap[model] += 1; // Count orders

      // Region Distribution
      const region = item.region || 'Chưa xác định';
      if (region === 'Unknown') {
           if (!regionMap['Chưa xác định']) regionMap['Chưa xác định'] = 0;
           regionMap['Chưa xác định'] += 1;
      } else {
           if (!regionMap[region]) regionMap[region] = 0;
           regionMap[region] += 1;
      }
    });

    setTotalRevenue(revenue);
    setTotalOrders(data.length);

    // Convert Maps to Arrays for Recharts
    setTrendData(Object.keys(trendMap).sort().map(date => ({
      date,
      amount: trendMap[date]
    })));

    setModelData(Object.keys(modelMap).map(model => ({
      name: model,
      count: modelMap[model]
    })).sort((a,b) => b.count - a.count));

    setRegionData(Object.keys(regionMap).map(region => ({
      name: region,
      value: regionMap[region]
    })));
  };

  const handleForecastProxy = async () => {
    setForecastLoading(true);
    setForecastResult(null);
    setForecastChartData([]);
    setForecastAnalysis("");
    
    try {
      const result = await reportingService.getDemandForecast(selectedModel);
      // The backend now returns a JSON string inside 'result.forecast'
      // We try to parse it.
      try {
          const parsed = JSON.parse(result.forecast);
          setForecastAnalysis(parsed.analysis_vi || "Không có phân tích trả về.");
          if (parsed.forecast_data && Array.isArray(parsed.forecast_data)) {
              setForecastChartData(parsed.forecast_data);
          }
      } catch (e) {
          // Fallback if plain text
          setForecastAnalysis(result.forecast);
      }
      setForecastResult(result.forecast); // Keep raw for debug if needed, or remove
    } catch (error) {
      setForecastAnalysis("Lỗi khi tạo dự báo.");
    } finally {
      setForecastLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await reportingService.syncData();
      await fetchData(); // Refresh data after sync
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-0">Báo cáo Doanh số & Dự báo AI</Title>
          <Text type="secondary">Phân tích hiệu suất bán hàng và dự đoán nhu cầu thị trường</Text>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* ... (Summary Cards and Main Charts - unchanged) ... */}
        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card variant="borderless" className="shadow-sm">
              <Statistic 
                title={<div className="flex items-center gap-2"><DollarSign size={16}/> Tổng Doanh Thu</div>}
                value={totalRevenue}
                precision={0}
                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className="shadow-sm">
              <Statistic 
                title={<div className="flex items-center gap-2"><ShoppingCart size={16}/> Tổng Đơn Hàng</div>}
                value={totalOrders}
                valueStyle={{ fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
             <Card variant="borderless" className="shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
               <div className="flex flex-col h-full justify-center">
                  <Text strong className="text-indigo-600 flex items-center gap-2"><BrainCircuit size={18}/> AI Insight</Text>
                  <Text type="secondary" className="text-xs mt-1">Sử dụng AI để phân tích dữ liệu bán hàng</Text>
               </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[24, 24]} className="mb-6">
          {/* Revenue Trend */}
          <Col xs={24} lg={16}>
            <Card title={<><TrendingUp size={16} className="inline mr-2"/>Biểu đồ Doanh Thu theo Ngày</>} variant="borderless" className="shadow-sm h-full">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${value/1000000}M`} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Doanh Thu" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          {/* Pie Chart Region */}
          <Col xs={24} lg={8}>
            <Card title="Phân bố theo Khu vực" variant="borderless" className="shadow-sm h-full">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
           {/* Top Models */}
           <Col xs={24} lg={12}>
            <Card title="Top Xe Bán Chạy" variant="borderless" className="shadow-sm">
               <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Số lượng bán" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* AI Forecasting */}
          <Col xs={24} lg={12}>
            <Card 
              title={<><BrainCircuit size={18} className="inline mr-2 text-purple-600"/>Dự Báo Nhu Cầu (Gemini AI)</>} 
              variant="borderless" 
              className="shadow-sm border-t-4 border-t-purple-500"
            >
              <div className="flex gap-4 mb-4">
                <Select 
                  placeholder="Chọn dòng xe (Tùy chọn)" 
                  allowClear 
                  style={{ width: 200 }}
                  onChange={setSelectedModel}
                >
                  {modelData.map(m => (
                    <Option key={m.name} value={m.name}>{m.name}</Option>
                  ))}
                </Select>
                <Button 
                  type={forecastExists ? "default" : "primary"}
                  icon={<BrainCircuit size={16}/>} 
                  onClick={handleForecastProxy} 
                  loading={forecastLoading}
                  className={forecastExists ? "mr-2" : "bg-purple-600 hover:bg-purple-700"}
                >
                  {forecastExists ? "Tạo dự báo mới" : "Phân tích & Dự báo"}
                </Button>
                
                {forecastExists && (
                    <Button 
                      type="primary"
                      onClick={handleForecastProxy} 
                      loading={forecastLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Xem lại dự báo cũ
                    </Button>
                )}
              </div>

              {forecastAnalysis && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Text strong className="block mb-2 text-gray-700">Kết quả phân tích (Tiếng Việt):</Text>
                  <Paragraph className="text-gray-600 whitespace-pre-wrap text-justify">
                    {forecastAnalysis}
                  </Paragraph>

                  {forecastChartData.length > 0 && (
                      <div style={{ width: '100%', height: 250, marginTop: 20 }}>
                          <Text strong className="block mb-2 text-center text-gray-600">Biểu đồ Xu hướng Dự báo</Text>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="Dự báo" stroke="#8884d8" strokeWidth={2} dot={{r: 4}} />
                            </LineChart>
                          </ResponsiveContainer>
                      </div>
                  )}
                </div>
              )}
              
              {!forecastAnalysis && !forecastLoading && (
                <div className="text-center py-10 text-gray-400">
                  <Activity size={48} className="mx-auto mb-2 opacity-50"/>
                  <Text>Nhấn nút để yêu cầu AI phân tích dữ liệu bán hàng hiện tại</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
