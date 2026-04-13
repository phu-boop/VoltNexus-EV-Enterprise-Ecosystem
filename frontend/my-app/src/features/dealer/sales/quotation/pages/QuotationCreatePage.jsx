// sales/quotation/pages/QuotationCreatePage.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getVehicleDetails } from "../../availableVehicle/services/availableVehicleService";
import {
  createQuotationDraft,
  calculateQuotation,
  sendQuotation,
} from "../services/quotationService";
import {
  getCustomers,
  getVehicleModels,
  getVehicleVariantsByModelId,
  getCurrentDealerId,
  getCurrentStaffId,
  getActivePromotions,
} from "../../services/optionService";
import Step1BasicInfo from "../components/Step1BasicInfo";
import Step2Calculation from "../components/Step2Calculation";
import Step3Send from "../components/Step3Send";
import Step4Complete from "../components/Step4Complete";

const QuotationCreatePage = () => {
  const location = useLocation();
  // Lấy variantId từ trang "Xe có sẵn" (nếu có)
  const selectedVariantId = location.state?.selectedVariantId;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quotationId, setQuotationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [customers, setCustomers] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [formData, setFormData] = useState({
    dealerId: getCurrentDealerId(),
    customerId: "",
    modelId: "",
    variantId: "",
    staffId: getCurrentStaffId(),
    basePrice: "",
    termsConditions: "Standard terms and conditions apply",
  });

  const [calculationData, setCalculationData] = useState({
    promotionIds: [],
    additionalDiscountRate: 0,
  });

  const [sendData, setSendData] = useState({
    validUntil: "",
    termsConditions: "",
  });

  const [calculationResult, setCalculationResult] = useState(null);
  const [quotationDetail, setQuotationDetail] = useState(null);

  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Set default validUntil to 7 days from now
  useEffect(() => {
    if (currentStep === 3 && !sendData.validUntil) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setSendData((prev) => ({
        ...prev,
        validUntil: formatDateForInput(nextWeek),
      }));
    }
  }, [currentStep]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.modelId && !formData.variantId) {
      loadVariants(formData.modelId);
      loadPromotions(formData.modelId);
    }
  }, [formData.modelId]);

  useEffect(() => {
    if (formData.variantId && variants.length > 0 && !formData.basePrice) {
      const selectedVariant = variants.find(
        (v) => v.variantId == formData.variantId
      );
      if (selectedVariant) {
        setFormData((prev) => ({
          ...prev,
          basePrice: selectedVariant.price,
        }));
      }
    }
  }, [formData.variantId, variants]);

  // Hàm xử lý lỗi từ API
  const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);

    setErrorMessage("");

    let errorMessage = defaultMessage;

    if (error.response) {
      const responseData = error.response.data;

      if (responseData && responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData && responseData.error) {
        errorMessage = responseData.error;
      } else if (typeof responseData === "string") {
        errorMessage = responseData;
      }
    } else if (error.request) {
      errorMessage =
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
    } else {
      errorMessage = error.message || defaultMessage;
    }

    toast.error(errorMessage);
    setErrorMessage(errorMessage);

    return errorMessage;
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const [customersRes, modelsRes] = await Promise.all([
        getCustomers(),
        getVehicleModels(),
      ]);

      setCustomers(customersRes.data?.data || customersRes.data || []);
      const modelsData = modelsRes.data?.data;
      setModels(Array.isArray(modelsData) ? modelsData : (modelsData?.content ?? []));

      // KIỂM TRA NẾU CÓ XE ĐƯỢC CHỌN TỪ TRƯỚC
      if (selectedVariantId) {
        const detailsRes = await getVehicleDetails(selectedVariantId);
        const variantDetails = detailsRes.data?.data;

        if (variantDetails && variantDetails.modelId && variantDetails.price) {
          const [variantsRes, promotionsRes] = await Promise.all([
            getVehicleVariantsByModelId(variantDetails.modelId),
            getActivePromotions(getCurrentDealerId(), variantDetails.modelId),
          ]);

          setVariants(variantsRes.data?.data || variantsRes.data || []);
          setPromotions(
            Array.isArray(promotionsRes?.data) ? promotionsRes.data : []
          );

          setFormData((prev) => ({
            ...prev,
            modelId: variantDetails.modelId,
            variantId: selectedVariantId,
            basePrice: variantDetails.price,
          }));
        }
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi tải dữ liệu ban đầu");
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (modelId) => {
    try {
      setErrorMessage("");
      const variantsRes = await getVehicleVariantsByModelId(modelId);
      setVariants(variantsRes.data?.data || variantsRes.data || []);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách phiên bản");
    }
  };

  const loadPromotions = async (modelId) => {
    try {
      setErrorMessage("");
      const dealerId = getCurrentDealerId();
      const promotionsRes = await getActivePromotions(dealerId, modelId);
      // Truy cập vào .data của API respond
      setPromotions(promotionsRes?.data || []);
    } catch (error) {
      handleApiError(error, "Lỗi khi tải danh sách khuyến mãi");
    }
  };

  const handleCreateDraft = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await createQuotationDraft({
        ...formData,
        customerId: parseInt(formData.customerId),
        modelId: parseInt(formData.modelId),
        variantId: parseInt(formData.variantId),
        basePrice: parseFloat(formData.basePrice),
      });

      setQuotationId(response.data.quotationId);
      setQuotationDetail(response.data);
      setCurrentStep(2);
      toast.success("Tạo báo giá nháp thành công!");
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo báo giá nháp");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await calculateQuotation(quotationId, {
        ...calculationData,
        additionalDiscountRate:
          parseFloat(calculationData.additionalDiscountRate) || 0,
      });

      setCalculationResult(response.data);
      setQuotationDetail(response.data);
      setCurrentStep(3);
      toast.success("Tính toán giá thành công!");
    } catch (error) {
      const errorMsg = handleApiError(error, "Lỗi khi tính toán giá");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuotation = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await sendQuotation(quotationId, {
        ...sendData,
        customerId: parseInt(formData.customerId),
        validUntil: sendData.validUntil
          ? new Date(sendData.validUntil).toISOString()
          : null,
      });

      setQuotationDetail(response.data);
      setCurrentStep(4);
      toast.success("Gửi báo giá cho khách hàng thành công!");
    } catch (error) {
      handleApiError(error, "Lỗi khi gửi báo giá");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCalculationChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setCalculationData((prev) => ({
        ...prev,
        promotionIds: checked
          ? [...prev.promotionIds, value]
          : prev.promotionIds.filter((id) => id !== value),
      }));
    } else {
      setCalculationData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSendDataChange = (e) => {
    const { name, value } = e.target;
    setSendData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStepTitles = () => {
    const steps = {
      1: "Thông tin cơ bản",
      2: "Tính toán giá",
      3: "Gửi báo giá",
      4: "Hoàn thành",
    };
    return steps[currentStep] || "Tạo báo giá";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {getStepTitles()}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentStep === 1 &&
              "Bắt đầu bằng cách chọn khách hàng và dòng xe"}
            {currentStep === 2 && "Tính toán giá với các khuyến mãi có sẵn"}
            {currentStep === 3 && "Xác nhận và gửi báo giá cho khách hàng"}
            {currentStep === 4 && "Báo giá đã được gửi thành công"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / 3) * 100}%`,
                }}
              ></div>
            </div>

            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-500 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-gray-300 text-gray-400"
                    }`}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${currentStep >= step ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  {step === 1 && "Thông tin"}
                  {step === 2 && "Tính toán"}
                  {step === 3 && "Gửi"}
                  {step === 4 && "Hoàn thành"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-red-700 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              {currentStep === 1 && (
                <Step1BasicInfo
                  formData={formData}
                  customers={customers}
                  models={models}
                  variants={variants}
                  onChange={handleInputChange}
                  onSubmit={handleCreateDraft}
                  errorMessage={errorMessage}
                />
              )}

              {currentStep === 2 && (
                <Step2Calculation
                  quotationDetail={quotationDetail}
                  calculationData={calculationData}
                  promotions={promotions}
                  onChange={handleCalculationChange}
                  onSubmit={handleCalculate}
                  onBack={() => setCurrentStep(1)}
                  errorMessage={errorMessage}
                />
              )}

              {currentStep === 3 && (
                <Step3Send
                  quotationDetail={calculationResult || quotationDetail}
                  sendData={sendData}
                  onChange={handleSendDataChange}
                  onSubmit={handleSendQuotation}
                  onBack={() => setCurrentStep(2)}
                  errorMessage={errorMessage}
                />
              )}

              {currentStep === 4 && (
                <Step4Complete quotationDetail={quotationDetail} />
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {currentStep !== 4 && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Bước {currentStep} của 4 • Mọi thông tin đều được bảo mật
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationCreatePage;
