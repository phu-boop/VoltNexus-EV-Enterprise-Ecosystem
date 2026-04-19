import { useState, useEffect } from 'react';
import { getCalendarView } from '../../../services/testDriveAdminService';
import Loading from '../../../components/ui/Loading';

export default function TestDriveCalendar({ onClose, onViewDetail }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadCalendarData();
  }, [selectedDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      const response = await getCalendarView(null, year, month); // Admin views all dealers
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading calendar:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before month starts
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start); // Changed from apt.appointmentDate to apt.start
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const monthName = selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(selectedDate);

  const STATUS_COLORS = {
    SCHEDULED: 'bg-yellow-100 border-yellow-300',
    CONFIRMED: 'bg-green-100 border-green-300',
    COMPLETED: 'bg-blue-100 border-blue-300',
    CANCELLED: 'bg-red-100 border-red-300'
  };

  // Inline styles để đảm bảo overlay bán trong suốt hoạt động
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    padding: '1rem'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '72rem',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 50
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📅 Lịch lái thử</h2>
            <p className="text-gray-500 mt-1">Xem lịch hẹn theo tháng</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-normal leading-none transition-colors"
            title="Đóng"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            ← Tháng trước
          </button>
          <h3 className="text-xl font-semibold capitalize">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Tháng sau →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loading message="Đang tải lịch..." />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((date, index) => {
                const dayAppointments = date ? getAppointmentsForDate(date) : [];
                const isToday = date && 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border rounded-lg p-2 ${
                      !date ? 'bg-gray-50' : isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 3).map(apt => (
                            <button
                              key={apt.appointmentId}
                              onClick={() => onViewDetail(apt.appointmentId)}
                              className={`w-full text-left text-xs p-1 rounded border ${
                                STATUS_COLORS[apt.status] || 'bg-gray-100'
                              } hover:opacity-80 transition-opacity`}
                            >
                              <div className="font-medium truncate">
                                {new Date(apt.start).toLocaleTimeString('vi-VN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              <div className="truncate text-gray-600">
                                {apt.customerName}
                              </div>
                            </button>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAppointments.length - 3} lịch khác
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-6 border-t border-gray-200 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-sm">Đang chờ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-sm">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-sm">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
