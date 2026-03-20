import { useState, useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Battery, Zap, Navigation, Filter, CornerUpRight, Search, Car, Plug } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../services/vehicleService";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Hàm tạo Icon đẹp hơn với Gradient và Shadow
const createModernIcon = (IconComponent, type) => {
  // Cấu hình màu sắc theo loại
  const config = {
    user: {
      gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", // Blue gradient
      shadow: "rgba(59, 130, 246, 0.5)",
      ringClass: "user-pulse-ring", // Class kích hoạt animation
    },
    fast: {
      gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", // Red gradient
      shadow: "rgba(239, 68, 68, 0.5)",
      ringClass: "",
    },
    standard: {
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)", // Green gradient
      shadow: "rgba(16, 185, 129, 0.5)",
      ringClass: "",
    }
  };

  const style = config[type] || config.standard;

  const html = renderToStaticMarkup(
    <div className={`relative flex flex-col items-center justify-center ${style.ringClass}`}>
      {/* Phần thân Pin (Hình tròn gradient) */}
      <div 
        className="marker-shadow-bottom relative flex items-center justify-center w-10 h-10 rounded-full text-white z-20"
        style={{ 
          background: style.gradient,
          border: '2px solid white', // Viền trắng tạo độ tương phản
        }}
      >
        <IconComponent size={20} strokeWidth={2.5} />
      </div>
      
      {/* Phần mũi nhọn (Triangle) */}
      <div 
        className="w-0 h-0 z-10 -mt-1"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid white', // Làm mũi tên màu trắng hoặc trùng màu gradient
          filter: 'drop-shadow(0px 2px 1px rgba(0,0,0,0.1))'
        }}
      ></div>

      {/* Override mũi tên để trùng màu gradient (tạo cảm giác liền mạch) */}
       <div 
        className="absolute w-0 h-0 z-20 -bottom-[6px]"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid ' + (type === 'user' ? '#2563EB' : type === 'fast' ? '#DC2626' : '#059669'),
        }}
      ></div>
    </div>
  );

  return L.divIcon({
    className: 'custom-modern-icon', // Class rỗng để reset style mặc định của Leaflet
    html: html,
    iconSize: [40, 50], // Kích thước tổng thể
    iconAnchor: [20, 50], // Mũi nhọn nằm chính giữa đáy
    popupAnchor: [0, -50], // Popup hiện phía trên đầu
  });
};

const userIcon = createModernIcon(Car, 'user');
const fastChargingIcon = createModernIcon(Zap, 'fast');
const standardChargingIcon = createModernIcon(Plug, 'standard');

// Component to handle map view changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

const ChargingStationMap = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [userLocation, setUserLocation] = useState(null);
  const [range, setRange] = useState(null);
  
  // Filter States
  const [regionFilter, setRegionFilter] = useState('ALL'); // ALL, NORTH, CENTRAL, SOUTH
  const [showNearestOnly, setShowNearestOnly] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles-charging'],
    queryFn: async () => {
      try {
        const response = await getVehicles(0, 100);
        const pageData = response.data || response;
        return pageData.content || pageData || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
      }
    },
  });

  // Real charging stations data
  const allStations = useMemo(() => [
    // --- North ---
    { id: 101, name: 'Vincom Royal City', lat: 21.0025, lng: 105.8147, type: 'FAST', available: 10, region: 'NORTH', address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội' },
    { id: 102, name: 'Vincom Times City', lat: 20.9965, lng: 105.8672, type: 'FAST', available: 8, region: 'NORTH', address: '458 Minh Khai, Hai Bà Trưng, Hà Nội' },
    { id: 103, name: 'Vincom Metropolis', lat: 21.0315, lng: 105.8123, type: 'FAST', available: 5, region: 'NORTH', address: '29 Liễu Giai, Ba Đình, Hà Nội' },
    { id: 104, name: 'Audi Hà Nội', lat: 21.0152, lng: 105.7828, type: 'FAST', available: 2, region: 'NORTH', address: '8 Phạm Hùng, Nam Từ Liêm, Hà Nội' },
    { id: 105, name: 'Làng Quốc tế Thăng Long', lat: 21.0381, lng: 105.7981, type: 'STANDARD', available: 4, region: 'NORTH', address: 'Cầu Giấy, Hà Nội' },
    { id: 106, name: 'Vincom Imperia Hải Phòng', lat: 20.8624, lng: 106.6715, type: 'FAST', available: 6, region: 'NORTH', address: '1 Bạch Đằng, Hồng Bàng, Hải Phòng' },
    { id: 107, name: 'Vinpearl Resort Hạ Long', lat: 20.9572, lng: 107.0674, type: 'STANDARD', available: 3, region: 'NORTH', address: 'Đảo Rều, Bài Cháy, Quảng Ninh' },
    
    // --- Central ---
    { id: 201, name: 'Vincom Ngô Quyền', lat: 16.0721, lng: 108.2325, type: 'FAST', available: 5, region: 'CENTRAL', address: '910A Ngô Quyền, Sơn Trà, Đà Nẵng' },
    { id: 202, name: 'Vinpearl Nam Hội An', lat: 15.7483, lng: 108.3370, type: 'FAST', available: 8, region: 'CENTRAL', address: 'Thăng Bình, Quảng Nam' },
    { id: 203, name: 'Pullman Danang Beach Resort', lat: 16.0386, lng: 108.2475, type: 'STANDARD', available: 2, region: 'CENTRAL', address: '101 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng' },
    { id: 204, name: 'Trạm dừng nghỉ QL1A Diễn Châu', lat: 18.9950, lng: 105.5830, type: 'FAST', available: 4, region: 'CENTRAL', address: 'Diễn Châu, Nghệ An' },
    { id: 205, name: 'Vinpearl Nha Trang', lat: 12.2132, lng: 109.2437, type: 'STANDARD', available: 6, region: 'CENTRAL', address: 'Đảo Hòn Tre, Nha Trang, Khánh Hòa' },

    // --- South ---
    { id: 301, name: 'Vinhomes Central Park', lat: 10.7936, lng: 106.7208, type: 'FAST', available: 12, region: 'SOUTH', address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM' },
    { id: 302, name: 'Vincom Đồng Khởi', lat: 10.7776, lng: 106.7020, type: 'FAST', available: 4, region: 'SOUTH', address: '72 Lê Thánh Tôn, Quận 1, TP.HCM' },
    { id: 303, name: 'Thảo Điền Pearl', lat: 10.8037, lng: 106.7324, type: 'STANDARD', available: 3, region: 'SOUTH', address: '12 Quốc Hương, Thảo Điền, TP.HCM' },
    { id: 304, name: 'Porsche Center Saigon', lat: 10.7410, lng: 106.7280, type: 'FAST', available: 2, region: 'SOUTH', address: 'Tân Thuận, Quận 7, TP.HCM' },
    { id: 305, name: 'Lotte Mart Vũng Tàu', lat: 10.3392, lng: 107.0864, type: 'FAST', available: 5, region: 'SOUTH', address: 'Góc 3/2 & Thi Sách, Vũng Tàu' },
    { id: 306, name: 'Six Senses Côn Đảo', lat: 8.7042, lng: 106.6342, type: 'STANDARD', available: 2, region: 'SOUTH', address: 'Bãi Đất Dốc, Côn Đảo' },
    { id: 307, name: 'Vincom Xuân Khánh', lat: 10.0267, lng: 105.7720, type: 'FAST', available: 4, region: 'SOUTH', address: '209 Đường 30/4, Ninh Kiều, Cần Thơ' },
    { id: 308, name: 'Quảng trường Lâm Viên', lat: 11.9392, lng: 108.4372, type: 'STANDARD', available: 6, region: 'SOUTH', address: 'Đà Lạt, Lâm Đồng' },
  ], []);

  // Filtered stations logic
  const displayedStations = useMemo(() => {
    let stations = [...allStations];

    // Filter by region
    if (regionFilter !== 'ALL') {
      stations = stations.filter(s => s.region === regionFilter);
    }

    // Calculate distance and sort if user location exists
    if (userLocation) {
      stations = stations.map(s => ({
        ...s,
        distance: calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng)
      }));

      // Sort by distance
      stations.sort((a, b) => a.distance - b.distance);

      // Filter nearest 5 if enabled
      if (showNearestOnly) {
        stations = stations.slice(0, 5);
      }
    }

    return stations;
  }, [allStations, regionFilter, userLocation, showNearestOnly]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newUserLoc);
          
          // Auto-enable nearest filter if we have location
          setShowNearestOnly(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation({ lat: 21.0285, lng: 105.8542 }); // Default to Hanoi
        }
      );
    } else {
      setUserLocation({ lat: 21.0285, lng: 105.8542 });
    }
  }, []);

  // Calculate range based on vehicle and battery level
  useEffect(() => {
    if (selectedVehicle && batteryLevel) {
      const baseRange = selectedVehicle.baseRangeKm || selectedVehicle.rangeKm || 0;
      const currentRange = (baseRange * batteryLevel) / 100;
      setRange(currentRange);
    }
  }, [selectedVehicle, batteryLevel]);

  const handleGetDirections = (station) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-600" />
            Bản Đồ Trạm Sạc & Ước Tính Quãng Đường
          </h1>
          <p className="text-gray-600">
            Tìm trạm sạc VinFast, EV One, EBOOST,... gần bạn nhất
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            
             {/* Filter Section */}
             <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Tìm kiếm trạm sạc
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khu vực
                  </label>
                  <select 
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Toàn quốc</option>
                    <option value="NORTH">Miền Bắc</option>
                    <option value="CENTRAL">Miền Trung</option>
                    <option value="SOUTH">Miền Nam</option>
                  </select>
                </div>

                {userLocation && (
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <input 
                      type="checkbox" 
                      id="nearest" 
                      checked={showNearestOnly}
                      onChange={(e) => setShowNearestOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="nearest" className="text-sm font-medium text-blue-800 cursor-pointer">
                      Chỉ hiện 5 trạm gần nhất
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-600" />
                Kiểm tra quãng đường
              </h2>
              <select
                value={selectedVehicle?.modelId || ''}
                onChange={(e) => {
                  const vehicle = vehiclesData?.find(v => v.modelId === parseInt(e.target.value));
                  setSelectedVehicle(vehicle);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">-- Chọn mẫu xe của bạn --</option>
                {(Array.isArray(vehiclesData) ? vehiclesData : []).map((vehicle) => (
                  <option key={vehicle.modelId} value={vehicle.modelId}>
                    {vehicle.modelName} - {vehicle.baseRangeKm || 'N/A'} km
                  </option>
                ))}
              </select>

              {/* Battery Level */}
              {selectedVehicle && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pin hiện tại: {batteryLevel}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {range && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-sm text-gray-600 mb-1">Quãng đường khả dụng:</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(range)} km
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stations List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Danh sách trạm ({displayedStations.length})</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {displayedStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => {
                        setSelectedStation(station);
                        // Optional: Center map on click
                        // But let's leave user control for now
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedStation?.id === station.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold text-sm">{station.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{station.address}</div>
                        </div>
                        {station.distance && (
                            <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                                {station.distance.toFixed(1)} km
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                            {station.type === 'FAST' ? '⚡ Sạc Nhanh' : '🔌 Sạc Thường'} 
                            <span className="text-gray-300">|</span>
                            <span className={station.available > 0 ? 'text-green-600' : 'text-red-500'}>
                                {station.available} chỗ trống
                            </span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGetDirections(station);
                            }}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                            <CornerUpRight className="w-3 h-3" />
                            Chỉ đường
                        </button>
                    </div>
                  </div>
                ))}
                
                {displayedStations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        Không tìm thấy trạm sạc nào trong khu vực này.
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative h-[700px]">
              {userLocation ? (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={12} // Closer zoom since we focus on nearest by default
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Recenter map when user location or selected station changes */}
                  <MapController 
                    center={selectedStation ? [selectedStation.lat, selectedStation.lng] : [userLocation.lat, userLocation.lng]} 
                    zoom={selectedStation ? 14 : 12}
                  />

                  {/* User location marker */}
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                      <div className="text-sm font-bold text-blue-600">Vị trí của bạn</div>
                    </Popup>
                  </Marker>

                  {/* Range circle */}
                  {range && selectedVehicle && (
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={range * 1000} // Convert km to meters
                      pathOptions={{
                        color: '#4285F4',
                        fillColor: '#4285F4',
                        fillOpacity: 0.1,
                        weight: 1,
                        dashArray: '5, 10'
                      }}
                    />
                  )}

                  {/* Charging stations */}
                  {displayedStations.map((station) => (
                    <Marker
                      key={station.id}
                      position={[station.lat, station.lng]}
                      icon={station.type === 'FAST' ? fastChargingIcon : standardChargingIcon}
                      eventHandlers={{
                        click: () => setSelectedStation(station),
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-sm mb-1">{station.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{station.address}</p>
                          
                          <div className="flex justify-between items-center text-xs mb-2">
                             <span className="bg-gray-100 px-2 py-1 rounded">
                                {station.type === 'FAST' ? '⚡ Sạc Nhanh' : '🔌 Sạc Thường'}
                             </span>
                             <span className="font-bold text-green-600">
                                {station.available} chỗ
                             </span>
                          </div>

                          {station.distance && (
                              <p className="text-xs text-gray-500 mb-3 italic">
                                  Cách bạn {station.distance.toFixed(1)} km
                              </p>
                          )}
                          
                          <button
                            onClick={() => handleGetDirections(station)}
                            className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Navigation className="w-3 h-3" />
                            Chỉ đường đến đây
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Routing Line */}
                  {selectedStation && (
                    <Polyline 
                        positions={[
                            [userLocation.lat, userLocation.lng],
                            [selectedStation.lat, selectedStation.lng]
                        ]}
                        pathOptions={{ 
                            color: 'blue', 
                            weight: 3, 
                            opacity: 0.6, 
                            dashArray: '10, 10' 
                        }} 
                    />
                  )}

                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <Navigation className="w-16 h-16 mx-auto mb-4 text-blue-200 animate-pulse" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Đang xác định vị trí...</h3>
                    <p className="text-gray-500 text-sm">Vui lòng cho phép truy cập vị trí để tìm trạm sạc gần nhất</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-6 text-xs text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4285F4] border border-white shadow-sm"></div>
                  <span>Vị trí của bạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B35] border border-white shadow-sm"></div>
                  <span>Trạm sạc nhanh (DC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4CAF50] border border-white shadow-sm"></div>
                  <span>Trạm sạc thường (AC)</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingStationMap;
