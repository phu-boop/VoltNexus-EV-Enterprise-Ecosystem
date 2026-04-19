import { useState } from "react";
import { Calculator, CreditCard, Percent, Calendar, DollarSign } from "lucide-react";
import Button from "../components/ui/Button";

const FinancingCalculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: 1200000000, // VND
    downPayment: 300000000, // VND
    loanTerm: 60, // months
    interestRate: 8.5, // annual percentage
    registrationFee: 0.1, // 10% of vehicle price
    firstRegistrationFee: 0.02, // 2% of vehicle price
    evTaxIncentive: 0.1, // 10% tax reduction for EV
  });

  const [results, setResults] = useState(null);

  const calculateFinancing = () => {
    const {
      vehiclePrice,
      downPayment,
      loanTerm,
      interestRate,
      registrationFee,
      firstRegistrationFee,
      evTaxIncentive,
    } = inputs;

    // Loan amount
    const loanAmount = vehiclePrice - downPayment;

    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;

    // Monthly payment calculation (PMT formula)
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);

    // Total interest paid
    const totalInterest = (monthlyPayment * loanTerm) - loanAmount;

    // Registration fees
    const registrationFeeAmount = vehiclePrice * registrationFee;
    const firstRegistrationFeeAmount = vehiclePrice * firstRegistrationFee;
    
    // EV tax incentive
    const taxIncentive = registrationFeeAmount * evTaxIncentive;
    const finalRegistrationFee = registrationFeeAmount - taxIncentive;

    // Total cost
    const totalLoanCost = loanAmount + totalInterest;
    const totalCost = vehiclePrice + totalInterest + finalRegistrationFee + firstRegistrationFeeAmount;

    setResults({
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalLoanCost,
      registrationFee: finalRegistrationFee,
      firstRegistrationFee: firstRegistrationFeeAmount,
      taxIncentive,
      totalCost,
      totalPayments: monthlyPayment * loanTerm,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (field, value) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <CreditCard className="w-10 h-10 text-blue-600" />
            Tính Toán Trả Góp & Giá Lăn Bánh
          </h1>
          <p className="text-gray-600 text-lg">
            Ước tính số tiền trả hàng tháng và tổng chi phí khi mua xe điện
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Thông Tin Tài Chính</h2>
            
            <div className="space-y-6">
              {/* Vehicle Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá xe (VNĐ)
                </label>
                <input
                  type="number"
                  value={inputs.vehiclePrice}
                  onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền trả trước (VNĐ)
                </label>
                <input
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-sm text-gray-500">
                  Tỷ lệ: {((inputs.downPayment / inputs.vehiclePrice) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời hạn vay (tháng)
                </label>
                <select
                  value={inputs.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12 tháng</option>
                  <option value={24}>24 tháng</option>
                  <option value={36}>36 tháng</option>
                  <option value={48}>48 tháng</option>
                  <option value={60}>60 tháng</option>
                  <option value={72}>72 tháng</option>
                  <option value={84}>84 tháng</option>
                </select>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lãi suất năm (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fees */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Phí & Thuế</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí trước bạ (% giá xe)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.registrationFee * 100}
                      onChange={(e) => handleInputChange('registrationFee', e.target.value / 100)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí đăng ký lần đầu (% giá xe)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.firstRegistrationFee * 100}
                      onChange={(e) => handleInputChange('firstRegistrationFee', e.target.value / 100)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ưu đãi thuế xe điện (% giảm phí trước bạ)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.evTaxIncentive * 100}
                      onChange={(e) => handleInputChange('evTaxIncentive', e.target.value / 100)}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <div className="mt-2 text-sm text-green-700">
                      Bạn sẽ được giảm {inputs.evTaxIncentive * 100}% phí trước bạ khi mua xe điện
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={calculateFinancing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              >
                Tính Toán
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {results && (
              <>
                {/* Monthly Payment Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Số Tiền Trả Hàng Tháng
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    {formatPrice(results.monthlyPayment)}
                  </div>
                  <div className="text-sm opacity-90">
                    Trong {inputs.loanTerm} tháng
                  </div>
                </div>

                {/* Loan Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Chi Tiết Khoản Vay</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Số tiền vay:</span>
                      <span className="font-semibold">{formatPrice(results.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng lãi suất:</span>
                      <span className="font-semibold text-red-600">{formatPrice(results.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng trả nợ:</span>
                      <span className="font-semibold">{formatPrice(results.totalLoanCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Fees & Taxes */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Phí & Thuế</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Phí trước bạ:</span>
                      <span className="font-semibold">{formatPrice(results.registrationFee)}</span>
                    </div>
                    {results.taxIncentive > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Ưu đãi thuế:</span>
                        <span className="font-semibold">-{formatPrice(results.taxIncentive)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Phí đăng ký:</span>
                      <span className="font-semibold">{formatPrice(results.firstRegistrationFee)}</span>
                    </div>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-500">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Tổng Chi Phí
                  </h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatPrice(results.totalCost)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Bao gồm: Giá xe + Lãi suất + Phí & Thuế
                  </div>
                </div>
              </>
            )}

            {!results && (
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nhập thông tin và nhấn "Tính Toán" để xem kết quả</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancingCalculator;
