import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../shared/services/authService";

export default function AdminHeader() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((result) => {
        if (active) setUser(result);
      })
      .catch(() => {
        // AdminRoute chịu trách nhiệm xác minh và chuyển hướng.
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <span className="admin-header-eyebrow">TRAVEL MINI / ADMIN</span>
        <strong>Không gian quản trị</strong>
      </div>

      <div className="admin-header-actions">
        <div className="admin-user">
          <div className="admin-avatar">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="admin-user-info">
            <strong>{user?.name || "Quản trị viên"}</strong>
            <span>{user?.email || "ADMIN"}</span>
          </div>

          <button
            className="admin-icon-button"
            type="button"
            aria-label="Mở menu tài khoản"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ▾
          </button>

          {menuOpen && (
            <div className="admin-user-dropdown">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
