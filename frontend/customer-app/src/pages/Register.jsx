import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { registerCustomer, loginUser } from "../services/authService";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    captchaToken: "",
  });
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
      const response = await registerCustomer({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        captchaToken: form.captchaToken,
      });

      if (response.code === "1000") {
        toast.success("Đăng ký thành công! Đang đăng nhập...");
        
        // Auto login after registration
        const loginResponse = await loginUser({
          email: form.email,
          password: form.password,
          captchaToken: form.captchaToken,
        });

        if (loginResponse.code === "1000") {
          const userData = loginResponse.data.userRespond;
          const jwtToken = loginResponse.data.token;
          const rolesArray = userData.roles.map((role) => role.name);

          login(
            jwtToken,
            rolesArray,
            userData.id,
            userData.email,
            userData.name,
            userData.fullName,
            userData.memberId,
            userData,
            userData.url
          );

          navigate("/");
        }
      } else {
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Họ và tên</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
          <label className="block text-sm font-medium mb-2">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
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
            minLength={8}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu tối thiểu 8 ký tự
          </p>
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
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <div className="text-center text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

