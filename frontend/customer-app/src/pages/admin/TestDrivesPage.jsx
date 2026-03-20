import { useState } from 'react';
import TestDriveList from './TestDrive/TestDriveList';
import TestDriveCalendar from './TestDrive/TestDriveCalendar';
import TestDriveDetail from './TestDrive/TestDriveDetail';

export default function AdminTestDrivesPage() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleViewDetail = (id) => {
    setSelectedAppointmentId(id);
  };

  const handleCloseDetail = () => {
    setSelectedAppointmentId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TestDriveList
        onViewDetail={handleViewDetail}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      {/* Modals */}
      {showCalendar && (
        <TestDriveCalendar
          onClose={() => setShowCalendar(false)}
          onViewDetail={handleViewDetail}
        />
      )}

      {selectedAppointmentId && (
        <TestDriveDetail
          appointmentId={selectedAppointmentId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
