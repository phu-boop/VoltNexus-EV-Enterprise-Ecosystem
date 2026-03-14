import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Alert, 
  message, 
  Modal,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  FileExcelOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSalesContracts } from '../hooks/useSalesContracts';
import ContractFilters from '../components/ContractFilters';
import ContractList from '../components/ContractList';
import ContractStats from '../components/ContractStats';
import ContractSignModal from '../components/ContractSignModal';

const ContractListPage = () => {
  const navigate = useNavigate();
  const { 
    contracts, 
    loading, 
    error,
    fetchAllContracts,
    searchContracts,
    deleteContract,
    signContract
  } = useSalesContracts();

  const [filters, setFilters] = useState({});
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [signLoading, setSignLoading] = useState(false);

  useEffect(() => {
    fetchAllContracts();
  }, []);

  const handleSearch = async (searchParams) => {
    setFilters(searchParams);
    await searchContracts(searchParams);
  };

  const handleReset = () => {
    setFilters({});
    fetchAllContracts();
  };

  const handleExport = () => {
    message.info('Tính năng xuất Excel sẽ được triển khai sau');
    // TODO: Implement export functionality
  };

  const handleDelete = async (contractId) => {
    Modal.confirm({
      title: 'Xóa hợp đồng',
      content: 'Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteContract(contractId);
          message.success('Xóa hợp đồng thành công');
          // Refresh data
          if (Object.keys(filters).length > 0) {
            await searchContracts(filters);
          } else {
            await fetchAllContracts();
          }
        } catch (error) {
          message.error('Xóa hợp đồng thất bại');
        }
      },
    });
  };

  const handleSign = (contract) => {
    setSelectedContract(contract);
    setSignModalVisible(true);
  };

  const handleSignSubmit = async (contractId, digitalSignature) => {
    setSignLoading(true);
    try {
      await signContract(contractId, digitalSignature);
      setSignModalVisible(false);
      setSelectedContract(null);
      // Refresh data
      if (Object.keys(filters).length > 0) {
        await searchContracts(filters);
      } else {
        await fetchAllContracts();
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setSignLoading(false);
    }
  };

  const handleView = (contract) => {
    navigate(`/dealer/contracts/${contract.contractId}`);
  };

  const handleEdit = (contract) => {
    navigate(`/dealer/contracts/${contract.contractId}/edit`);
  };

  return (
    <PageContainer
      header={{
        title: 'Quản lý hợp đồng bán hàng',
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Hợp đồng' },
          ],
        },
      }}
      extra={[
        <Button 
          key="refresh" 
          icon={<ReloadOutlined />}
          onClick={fetchAllContracts}
          loading={loading}
        >
          Làm mới
        </Button>,
        <Button 
          key="export" 
          icon={<FileExcelOutlined />}
          onClick={handleExport}
        >
          Xuất Excel
        </Button>,
        <Button 
          key="create" 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/dealer/contracts/create')}
        >
          Tạo hợp đồng
        </Button>,
      ]}
      content={
        <div>
          <p style={{ margin: 0, color: '#666' }}>
            Quản lý toàn bộ hợp đồng bán hàng, theo dõi trạng thái và tiến độ ký kết hợp đồng.
          </p>
        </div>
      }
    >
      {/* Statistics Cards */}
      <ContractStats contracts={contracts} loading={loading} />

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16, borderRadius: '8px' }}
        />
      )}

      {/* Filters */}
      <ContractFilters 
        onSearch={handleSearch}
        onReset={handleReset}
        onExport={handleExport}
        loading={loading}
      />

      {/* Contract List */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        <ContractList 
          contracts={contracts}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={handleView}
          onSign={handleSign}
        />
      </div>

      {/* Sign Contract Modal */}
      <ContractSignModal
        visible={signModalVisible}
        contract={selectedContract}
        onSign={handleSignSubmit}
        onCancel={() => {
          setSignModalVisible(false);
          setSelectedContract(null);
        }}
        loading={signLoading}
      />
    </PageContainer>
  );
};

export default ContractListPage;