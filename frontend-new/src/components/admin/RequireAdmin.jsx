import { Navigate, Outlet } from "react-router-dom";

export default function RequireAdmin() {
  const token = localStorage.getItem("access_token");
  const rawUser = localStorage.getItem("user");

  if (!token || !rawUser) {
    return <Navigate to="/admin/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
