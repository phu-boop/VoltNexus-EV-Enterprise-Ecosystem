import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined 
} from '@ant-design/icons';

const ContractStats = ({ contracts, loading }) => {
  const stats = React.useMemo(() => {
    const total = contracts.length;
    const signed = contracts.filter(c => c.contractStatus === 'SIGNED').length;
    const pending = contracts.filter(c => c.contractStatus === 'PENDING_SIGNATURE').length;
    const draft = contracts.filter(c => c.contractStatus === 'DRAFT').length;
    const expired = contracts.filter(c => c.contractStatus === 'EXPIRED').length;
    
    const signedPercentage = total > 0 ? (signed / total) * 100 : 0;
    const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;

    return {
      total,
      signed,
      pending,
      draft,
      expired,
      signedPercentage,
      pendingPercentage
    };
  }, [contracts]);

  const statCards = [
    {
      title: 'Tổng hợp đồng',
      value: stats.total,
      prefix: <FileTextOutlined />,
      color: '#1890ff',
      progress: null
    },
    {
      title: 'Đã ký',
      value: stats.signed,
      prefix: <CheckCircleOutlined />,
      color: '#52c41a',
      progress: stats.signedPercentage
    },
    {
      title: 'Chờ ký',
      value: stats.pending,
      prefix: <ClockCircleOutlined />,
      color: '#faad14',
      progress: stats.pendingPercentage
    },
    {
      title: 'Hết hạn',
      value: stats.expired,
      prefix: <ExclamationCircleOutlined />,
      color: '#ff4d4f',
      progress: null
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statCards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card 
            loading={loading}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: 'none'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {card.prefix}
                  {card.title}
                </div>
              }
              value={card.value}
              valueStyle={{ 
                color: card.color,
                fontSize: '32px',
                fontWeight: 600
              }}
              prefix={card.progress !== null && <RiseOutlined />}
            />
            
            {card.progress !== null && (
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={Math.round(card.progress)} 
                  size="small" 
                  strokeColor={card.color}
                  showInfo={false}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '4px'
                }}>
                  {card.progress.toFixed(1)}% tổng số
                </div>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ContractStats;