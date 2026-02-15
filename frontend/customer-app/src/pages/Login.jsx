import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { loginUser } from "../services/authService";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", captchaToken: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setForm((prev) => ({ ...prev, captchaToken: token }));
  };
  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const redirectUri = window.location.origin;
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.captchaToken) {
      setError("Vui lòng xác nhận reCAPTCHA");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ ...form });

      // Backend có thể trả về code: "1000" hoặc code: 200
      if (response.code === 200 || response.code === "1000") {
        // Handle both response structures
        const userData = response.result?.userRespond || response.data?.userRespond;
        const jwtToken = response.result?.token || response.data?.token;

        // Get roleName - handle both structures
        let roleName;
        if (userData.roleName) {
          // New structure: roleName directly
          roleName = userData.roleName;
        } else if (userData.roles && userData.roles.length > 0) {
          // Old structure: roles array with objects containing 'name' property
          roleName = userData.roles[0].name;
        }

        // Check if user has appropriate role for customer app
        const allowedRoles = ["ADMIN", "EVM_STAFF", "DEALER_MANAGER", "CUSTOMER"];

        if (!roleName || !allowedRoles.includes(roleName)) {
          setError(`Tài khoản không có quyền truy cập hệ thống. Role: ${roleName || 'undefined'}`);
          setLoading(false);
          return;
        }

        // Get memberId (UUID from user-service) and phone
        const memberId = userData.memberId || userData.id || null;
        const phone = userData.phone || '';

        // Store phone in sessionStorage for customer creation
        if (phone) {
          sessionStorage.setItem('phone', phone);
        }

        login(
          jwtToken,
          [roleName], // Convert single role to array for consistency
          userData.id || userData.userId,
          userData.email,
          userData.name,
          userData.fullName,
          memberId,
          userData,
          userData.url
        );

        toast.success("Đăng nhập thành công!");

        // Redirect based on role
        const redirectPath = ["ADMIN", "EVM_STAFF", "DEALER_MANAGER"].includes(roleName) ? "/admin" : "/";

        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      } else {
        setError(response.message || "Đăng nhập thất bại");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">HOẶC</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Đăng nhập với Google
          </span>
        </button>
        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

