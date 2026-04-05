import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RocketOutlined } from '@ant-design/icons';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '24px',
            margin: '20px'
        }}>
            <Result
                icon={<RocketOutlined style={{ fontSize: '72px', color: '#1890ff' }} />}
                title={<span style={{ fontSize: '32px', fontWeight: 800, color: '#1a3353' }}>Tính Năng Đang Phát Triển</span>}
                subTitle={
                    <div style={{ fontSize: '18px', color: '#4a5568', maxWidth: '600px', margin: '0 auto' }}>
                        Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn.
                        Vui lòng quay lại sau!
                    </div>
                }
                extra={[
                    <Button
                        type="primary"
                        key="console"
                        size="large"
                        onClick={() => navigate(-1)}
                        style={{
                            borderRadius: '12px',
                            height: '48px',
                            padding: '0 32px',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                        }}
                    >
                        Quay Lại Trang Trước
                    </Button>,
                    <Button
                        key="home"
                        size="large"
                        onClick={() => navigate('/')}
                        style={{
                            borderRadius: '12px',
                            height: '48px',
                            padding: '0 32px',
                            fontWeight: 600
                        }}
                    >
                        Về Trang Chủ
                    </Button>,
                ]}
            />
        </div>
    );
};

export default ComingSoon;
