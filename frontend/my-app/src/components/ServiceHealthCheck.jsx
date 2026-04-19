import { useState, useEffect } from "react"; // Đã thêm useEffect vào import
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiActivity, FiServer } from "react-icons/fi";

const ServiceHealthCheck = () => {
  // --- LOGIC GIỮ NGUYÊN 100% ---
  const [services, setServices] = useState({
    gateway: { status: 'checking', url: import.meta.env.VITE_API_BASE_URL },
    customerService: { status: 'checking', url: import.meta.env.VITE_CUSTOMER_SERVICE_URL },
    frontend: { status: 'running', url: window.location.origin }
  });

  const [checking, setChecking] = useState(false);

  const checkServices = async () => {
    setChecking(true);
    // Check Gateway
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setServices(prev => ({
        ...prev,
        gateway: { ...prev.gateway, status: response.ok ? 'running' : 'error' }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        gateway: { ...prev.gateway, status: 'offline' }
      }));
    }

    // Check Customer Service
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setServices(prev => ({
        ...prev,
        customerService: { ...prev.customerService, status: response.ok ? 'running' : 'error' }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        customerService: { ...prev.customerService, status: 'offline' }
      }));
    }
    setChecking(false);
  };

  useEffect(() => {
    checkServices();
  }, []);
  // --- HẾT PHẦN LOGIC ---

  // Phần UI Helper function
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-50 text-green-700 border-green-200';
      case 'offline': return 'bg-red-50 text-red-700 border-red-200';
      case 'error': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'offline': case 'error': return <FiXCircle className="w-5 h-5 text-red-600" />;
      default: return <FiRefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Widget */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">System Monitor</h2>
        </div>
        <button
          onClick={checkServices}
          disabled={checking}
          className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      {/* Body List */}
      <div className="p-6 space-y-4">
        {Object.entries(services).map(([key, service]) => (
          <div key={key} className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(service.status)} transition-all`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {getStatusIcon(service.status)}
              </div>
              <div>
                <h3 className="font-bold capitalize flex items-center gap-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                  {service.status === 'running' && <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>}
                </h3>
                <code className="text-xs font-mono opacity-80 mt-1 block bg-black/5 px-2 py-0.5 rounded w-fit">
                  {service.url}
                </code>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Console Log Style */}
      <div className="bg-gray-900 p-4 text-gray-300 text-xs font-mono border-t border-gray-800">
        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold border-b border-gray-800 pb-2">
          <FiServer className="w-4 h-4" />
          DEV_CONSOLE_LOGS
        </div>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="text-red-500">➜</span>
            <span>Gateway Offline? Run: <span className="text-yellow-400">cd gateway && mvn spring-boot:run</span></span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">➜</span>
            <span>Service Offline? Run: <span className="text-yellow-400">cd services/customer && mvn spring-boot:run</span></span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">ℹ</span>
            <span>Auth Error (401)? Check sessionStorage or Re-login.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceHealthCheck;