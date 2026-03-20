// export default ContractDetailPage;
import React, { useState, useEffect } from "react";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Space, Alert, Spin } from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSalesContracts } from "../hooks/useSalesContracts";
import ContractDetails from "../components/ContractDetails";
import ContractSignModal from "../components/ContractSignModal";

const ContractDetailPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const {
    contract,
    loading,
    error,
    signContract,
    updateContract,
    fetchContractById,
    cancelContract,
  } = useSalesContracts();
  const handleCancel = async (contractId) => {
    try {
      await cancelContract(contractId);
      // Refresh contract data sau khi hủy
      fetchContractById(contractId);
    } catch (err) {
      console.error(err);
    }
  };
  const [signModalVisible, setSignModalVisible] = useState(false);

  // Fetch contract data when component mounts or contractId changes
  useEffect(() => {
    if (contractId) {
      fetchContractById(contractId);
    }
  }, [contractId, fetchContractById]);

  const handleSign = async (contractId, digitalSignature) => {
    try {
      await signContract(contractId, digitalSignature);
      setSignModalVisible(false);
      // Refresh contract data after signing
      fetchContractById(contractId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = () => {
    navigate(`/dealer/contracts/${contractId}/edit`);
  };

  const handleDownload = () => {
    if (!contract?.contractFileUrl) {
      return;
    }

    // Lấy URL
    const url = contract.contractFileUrl;

    // Tạo <a> tạm thời để download
    const link = document.createElement("a");
    link.href = url;

    // Giải mã URL và lấy tên file
    const decodedFileName = decodeURIComponent(url.split("/").pop());
    link.download = decodedFileName || "contract.pdf"; // Nếu không có tên thì mặc định

    // Thêm vào body và click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loading && !contract) {
    return (
      <PageContainer>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin hợp đồng...</div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error && !contract) {
    return (
      <PageContainer>
        <Alert
          message="Lỗi tải hợp đồng"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button size="small" onClick={() => fetchContractById(contractId)}>
              Thử lại
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // No contract found
  if (!contract) {
    return (
      <PageContainer>
        <Alert
          message="Không tìm thấy hợp đồng"
          description={`Không thể tìm thấy hợp đồng với ID: ${contractId}`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate("/dealer/contracts")}>
              Quay lại danh sách
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: `Hợp đồng #${contract.contractNumber || contract.contractId}`,
        breadcrumb: {
          items: [
            { title: "Bán hàng" },
            { title: "Hợp đồng", path: "/dealer/contracts" },
            {
              title: `Hợp đồng #${
                contract.contractNumber || contract.contractId
              }`,
            },
          ],
        },
      }}
      extra={[
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dealer/contracts")}
        >
          Quay lại
        </Button>,
      ]}
      content={
        <div>
          <p>Chi tiết hợp đồng bán hàng</p>
          {contract.contractStatus === "PENDING_SIGNATURE" && (
            <Alert
              message="Hợp đồng đang chờ ký"
              description="Vui lòng ký hợp đồng để hoàn tất quá trình."
              type="warning"
              showIcon
            />
          )}
        </div>
      }
      loading={loading}
    >
      <ProCard>
        <ContractDetails
          contract={contract}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onSign={() => setSignModalVisible(true)}
          onCancel={handleCancel}
        />
      </ProCard>

      <ContractSignModal
        visible={signModalVisible}
        contract={contract}
        onSign={handleSign}
        onCancel={() => setSignModalVisible(false)}
        loading={loading}
      />
    </PageContainer>
  );
};

export default ContractDetailPage;
