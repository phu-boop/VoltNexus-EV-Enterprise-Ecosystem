import { Outlet } from "react-router-dom";

// Layout này chỉ có nhiệm vụ render route con (Login, Register...)
// mà không thêm Header, Footer, hay bất kỳ style nào khác.
const AuthLayout = () => {
  return <Outlet />;
};

export default AuthLayout;
