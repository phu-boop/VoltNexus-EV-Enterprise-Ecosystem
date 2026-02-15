import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { handleOAuthCallback } from "../services/authService";
import { toast } from "react-toastify";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processOAuth = async () => {
      // Prevent duplicate execution (React Strict Mode runs useEffect twice)
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      const accessToken = searchParams.get("accessToken");

      if (!accessToken) {
        setError("Không tìm thấy access token. Vui lòng thử lại.");
        toast.error("Đăng nhập thất bại: Không tìm thấy token");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        // Fetch user data using the access token
        const response = await handleOAuthCallback(accessToken);

        if (response.code === "1000") {
          const responseData = response.data;
          
          // Extract user data from userRespond (nested object)
          const userData = responseData.userRespond || responseData;
          
          // Handle roles - check if it exists and is an array
          const rolesArray = userData.roles 
            ? (Array.isArray(userData.roles) 
                ? userData.roles.map((role) => typeof role === 'string' ? role : role.name)
                : [userData.roles])
            : [];


          // Check if user is CUSTOMER
          if (!rolesArray.includes("CUSTOMER")) {
            setError(
              "Tài khoản này không phải là khách hàng. Vui lòng đăng nhập tại cổng quản lý."
            );
            toast.error("Tài khoản không có quyền truy cập");
            setTimeout(() => navigate("/login"), 3000);
            return;
          }

          //Extract memberId from customerProfile if available
          const memberId = userData.customerProfile?.customerId || userData.memberId || null;

          // Store user data in AuthProvider
          login(
            accessToken,
            rolesArray,
            userData.id,
            userData.email,
            userData.name,
            userData.fullName,
            memberId,
            userData,
            userData.url
          );

          toast.success("Đăng nhập với Google thành công!");
          navigate("/");
        } else {
          setError(response.message || "Đăng nhập thất bại");
          toast.error("Đăng nhập thất bại");
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập"
        );
        toast.error("Đăng nhập thất bại");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    processOAuth();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {error ? (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đăng nhập thất bại
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng về trang đăng nhập...
            </p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="animate-spin mx-auto h-12 w-12 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đang xử lý đăng nhập...
            </h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}
      </div>
    </div>
  );
}
