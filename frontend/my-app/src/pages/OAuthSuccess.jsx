// /oauth-success.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthProvider";
import { getInforMe } from "../features/auth/services/authService.js";
import Swal from "sweetalert2";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const firstRun = useRef(true);

  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;
    const processOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");

      if (accessToken) {
        sessionStorage.setItem("token", accessToken);

        try {
          // Hiển thị thông báo đang xử lý
          Swal.fire({
            title: "Đang xác thực...",
            text: "Vui lòng chờ trong giây lát",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const respond = await getInforMe();
          const userData = respond.data.userRespond;

          login(
            accessToken,
            userData.roles.map((role) => role.name),
            userData.id,
            userData.email,
            userData.name,
            userData.fullName,
            userData
          );

          await Swal.fire({
            title: "Thành công!",
            text: "Đăng nhập thành công",
            icon: "success",
            showConfirmButton: true, // hiển thị nút OK
          }).then((result) => {
            if (result.isConfirmed) {
              const roles = userData.roles.map((role) => role.name);

              if (roles.includes("ADMIN") || roles.includes("EVM_STAFF")) {
                navigate("/admin", { replace: true });
              } else if (roles.includes("DEALER_MANAGER")) {
                navigate("/dealer", { replace: true });
              } else if (roles.includes("DEALER_STAFF")) {
                navigate("/staff", { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            }
          });
        } catch (err) {
          // Thông báo lỗi
          await Swal.fire({
            title: "Lỗi!",
            text: "Đã xảy ra lỗi trong quá trình đăng nhập",
            icon: "error",
            confirmButtonText: "Thử lại",
            confirmButtonColor: "#3b82f6",
          });

          navigate("/login", { replace: true });
        }
      } else {
        // Thông báo không có token
        await Swal.fire({
          title: "Lỗi!",
          text: "Không nhận được thông tin xác thực",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#3b82f6",
        });

        navigate("/login", { replace: true });
      }
    };

    processOAuth();
  }, []);

  return <div></div>;
}
