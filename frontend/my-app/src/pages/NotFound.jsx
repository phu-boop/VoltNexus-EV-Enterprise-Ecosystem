import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthProvider.jsx";

export default function NotFound() {
    const { roles } = useAuthContext();
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (roles && (roles.includes("ADMIN"||roles.includes("EVM_STAFF")))) {
            navigate("/evm");
        } else {
            navigate("/dealer");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
            <h1 className="text-6xl font-bold text-sky-600 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-6">
                Oops! Trang bạn tìm không tồn tại.
            </p>
            <button
                onClick={handleGoBack}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition"
            >
                Quay về Trang chủ
            </button>
        </div>
    );
}
