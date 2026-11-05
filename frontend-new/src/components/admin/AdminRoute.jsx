import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
} from "../../shared/services/authService";

export default function AdminRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      if (!isAuthenticated()) {
        if (active) setStatus("login-required");
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (String(user.role || "").toUpperCase() === "ADMIN") {
          setStatus("allowed");
        } else {
          setStatus("forbidden");
        }
      } catch {
        await logout().catch(() => {});

        if (active) setStatus("login-required");
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <p>Đang xác minh quyền truy cập...</p>;
  }

  if (status === "login-required") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
