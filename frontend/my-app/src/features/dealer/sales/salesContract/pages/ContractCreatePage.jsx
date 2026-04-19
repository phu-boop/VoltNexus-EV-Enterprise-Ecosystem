// src/pages/contract/ContractCreatePage.jsx
import React, { useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSalesContracts } from '../hooks/useSalesContracts';
import { useSalesOrders } from '../../salesOrder/hooks/useSalesOrders';
import ContractForm from '../components/ContractForm';
import { Spin } from 'antd';

const ContractCreatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { createContract, loading: contractLoading } = useSalesContracts();
  const { orders, loading: ordersLoading } = useSalesOrders();

  // Tìm đơn hàng tương ứng
  const order = useMemo(() => {
    if (orderId && orders.length > 0) {
      return orders.find((o) => o.id === orderId);
    }
    return null;
  }, [orders, orderId]);

  const handleSubmit = async (values) => {
    try {
      await createContract({
        ...values,
        orderId,
      });
      navigate(-1); // quay lại trang trước
    } catch (error) {
      // Error handled trong hook
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageContainer
      header={{
        title: "Tạo hợp đồng bán hàng",
        breadcrumb: {
          render: () => {
            const prefix = location.pathname.includes('/manager/') ? '/dealer/manager' : '/dealer/staff';
            return (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(prefix)}
                >
                  Bán hàng
                </span>
                <span>/</span>
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`${prefix}/orders`)}
                >
                  Đơn hàng
                </span>
                <span>/</span>
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`${prefix}/orders/${orderId}`)}
                >
                  Đơn hàng #{orderId}
                </span>
                <span>/</span>
                <span className="text-gray-500">Tạo hợp đồng</span>
              </div>
            );
          },
          items: [], // để trống items khi custom render
        },
      }}
      content={
        <div>
          <p>Tạo hợp đồng bán hàng mới cho đơn hàng #{orderId}</p>
        </div>
      }
    >
      <ContractForm
        onSubmit={handleSubmit}
        loading={contractLoading}
        orderInfo={order}
      />
    </PageContainer>
  );
};

export default ContractCreatePage;
