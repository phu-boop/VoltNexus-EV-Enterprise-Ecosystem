import { useState } from "react";
import { Calculator, TrendingUp, Zap, Fuel, Wrench, DollarSign } from "lucide-react";
import Button from "../components/ui/Button";

const TCOCalculator = () => {
  const [inputs, setInputs] = useState({
    dailyKm: 50,
    years: 5,
    gasPrice: 25000, // VND per liter
    electricityPrice: 3000, // VND per kWh
    gasCarFuelConsumption: 8, // liters per 100km
    evEfficiency: 6, // kWh per 100km
    gasCarPrice: 800000000, // VND
    evCarPrice: 1200000000, // VND
    gasMaintenance: 5000000, // VND per year
    evMaintenance: 2000000, // VND per year
  });

  const [results, setResults] = useState(null);

  const calculateTCO = () => {
    const {
      dailyKm,
      years,
      gasPrice,
      electricityPrice,
      gasCarFuelConsumption,
      evEfficiency,
      gasCarPrice,
      evCarPrice,
      gasMaintenance,
      evMaintenance,
    } = inputs;

    // Calculate annual distance
    const annualKm = dailyKm * 365;

    // Gas car costs
    const gasAnnualFuelCost = (annualKm / 100) * gasCarFuelConsumption * gasPrice;
    const gasTotalFuelCost = gasAnnualFuelCost * years;
    const gasTotalMaintenance = gasMaintenance * years;
    const gasTotalCost = gasCarPrice + gasTotalFuelCost + gasTotalMaintenance;

    // EV costs
    const evAnnualElectricityCost = (annualKm / 100) * evEfficiency * electricityPrice;
    const evTotalElectricityCost = evAnnualElectricityCost * years;
    const evTotalMaintenance = evMaintenance * years;
    const evTotalCost = evCarPrice + evTotalElectricityCost + evTotalMaintenance;

    // Savings
    const totalSavings = gasTotalCost - evTotalCost;
    const annualSavings = totalSavings / years;
    const monthlySavings = annualSavings / 12;

    setResults({
      gas: {
        carPrice: gasCarPrice,
        totalFuel: gasTotalFuelCost,
        totalMaintenance: gasTotalMaintenance,
        total: gasTotalCost,
        annualFuel: gasAnnualFuelCost,
      },
      ev: {
        carPrice: evCarPrice,
        totalElectricity: evTotalElectricityCost,
        totalMaintenance: evTotalMaintenance,
        total: evTotalCost,
        annualElectricity: evAnnualElectricityCost,
      },
      savings: {
        total: totalSavings,
        annual: annualSavings,
        monthly: monthlySavings,
      },
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
            <Calculator className="w-10 h-10 text-blue-600" />
            Tính Toán Chi Phí Sở Hữu (TCO)
          </h1>
          <p className="text-gray-600 text-lg">
            So sánh chi phí tổng thể giữa xe xăng và xe điện trong {inputs.years} năm
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Thông Tin Đầu Vào</h2>
            
            <div className="space-y-6">
              {/* Usage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quãng đường đi mỗi ngày (km)
                </label>
                <input
                  type="number"
                  value={inputs.dailyKm}
                  onChange={(e) => handleInputChange('dailyKm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian sở hữu (năm)
                </label>
                <select
                  value={inputs.years}
                  onChange={(e) => handleInputChange('years', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3}>3 năm</option>
                  <option value={5}>5 năm</option>
                  <option value={7}>7 năm</option>
                  <option value={10}>10 năm</option>
                </select>
              </div>

              {/* Gas Car */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-red-500" />
                  Xe Xăng
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá xe (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={inputs.gasCarPrice}
                      onChange={(e) => handleInputChange('gasCarPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức tiêu thụ (L/100km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.gasCarFuelConsumption}
                      onChange={(e) => handleInputChange('gasCarFuelConsumption', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá xăng (VNĐ/L)
                    </label>
                    <input
                      type="number"
                      value={inputs.gasPrice}
                      onChange={(e) => handleInputChange('gasPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bảo dưỡng/năm (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={inputs.gasMaintenance}
                      onChange={(e) => handleInputChange('gasMaintenance', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* EV */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Xe Điện
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá xe (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={inputs.evCarPrice}
                      onChange={(e) => handleInputChange('evCarPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hiệu suất (kWh/100km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.evEfficiency}
                      onChange={(e) => handleInputChange('evEfficiency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá điện (VNĐ/kWh)
                    </label>
                    <input
                      type="number"
                      value={inputs.electricityPrice}
                      onChange={(e) => handleInputChange('electricityPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bảo dưỡng/năm (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={inputs.evMaintenance}
                      onChange={(e) => handleInputChange('evMaintenance', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={calculateTCO}
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
                {/* Savings Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Tiết Kiệm Tổng Thể
                  </h3>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {formatPrice(results.savings.total)}
                    </div>
                    <div className="text-sm opacity-90">
                      Tiết kiệm {inputs.years} năm
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-2">
                      <div className="text-sm">Tiết kiệm/năm:</div>
                      <div className="text-xl font-semibold">
                        {formatPrice(results.savings.annual)}
                      </div>
                      <div className="text-sm mt-1">Tiết kiệm/tháng:</div>
                      <div className="text-lg font-semibold">
                        {formatPrice(results.savings.monthly)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gas Car Costs */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xe Xăng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Giá xe:</span>
                      <span className="font-semibold">{formatPrice(results.gas.carPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nhiên liệu ({inputs.years} năm):</span>
                      <span className="font-semibold">{formatPrice(results.gas.totalFuel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bảo dưỡng ({inputs.years} năm):</span>
                      <span className="font-semibold">{formatPrice(results.gas.totalMaintenance)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-red-600">{formatPrice(results.gas.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EV Costs */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Xe Điện</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Giá xe:</span>
                      <span className="font-semibold">{formatPrice(results.ev.carPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Điện ({inputs.years} năm):</span>
                      <span className="font-semibold">{formatPrice(results.ev.totalElectricity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bảo dưỡng ({inputs.years} năm):</span>
                      <span className="font-semibold">{formatPrice(results.ev.totalMaintenance)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">{formatPrice(results.ev.total)}</span>
                      </div>
                    </div>
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

export default TCOCalculator;
