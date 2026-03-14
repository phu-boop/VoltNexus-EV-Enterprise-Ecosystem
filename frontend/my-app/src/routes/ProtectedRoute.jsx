import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthProvider.jsx";
import Swal from "sweetalert2";

export default function ProtectedRoute({ allowedRoles }) {
  const navigate = useNavigate();
  const { roles } = useAuthContext();
  const [hasChecked, setHasChecked] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    // Reset hasChecked khi roles hoặc allowedRoles thay đổi
    setHasChecked(false);
  }, [roles, allowedRoles]);

  useEffect(() => {
    if (hasChecked) return;

    if (!Array.isArray(roles) || roles.length === 0) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.isDismissed) {
          window.history.back();
        }
      });
      setHasChecked(true);
    } else if (!roles.some((role) => allowedRoles?.includes(role))) {
      console.error("❌ Access Denied:", { roles, allowedRoles });
      Swal.fire({
        title: "Không có quyền",
        text: `Bạn không có quyền truy cập trang này!\n\nRoles của bạn: ${roles.join(
          ", "
        )}\nYêu cầu: ${allowedRoles.join(", ")}`,
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        setRedirect("/dealer");
      });
      setHasChecked(true);
    }
  }, [roles, allowedRoles, hasChecked, navigate]);

  if (redirect) return <Navigate to={redirect} replace />;

  if (
    !Array.isArray(roles) ||
    roles.length === 0 ||
    !roles.some((role) => allowedRoles?.includes(role))
  ) {
    return null;
  }

  return <Outlet />;
}
