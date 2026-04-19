import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

export default function AdminRoute({ children }) {
  const { isAuthenticated, hasRole, roles } = useAuth();



  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  const isAdmin = hasRole(['ADMIN', 'EVM_STAFF', 'DEALER_MANAGER']);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập vào trang quản trị này.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return children;
}
