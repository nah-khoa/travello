import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authenticate } from "../shared/services/authService";
import "../shared/styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Cập nhật dữ liệu khi người dùng nhập
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Xử lý đăng nhập
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.email.trim() || !form.password) {
      setMessage("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const user = await authenticate(form.email.trim(), form.password);

      // Phân quyền điều hướng
      if (String(user.role).toUpperCase() === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setMessage(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">✈</div>
          <span>TRAVEL MINI</span>
        </div>

        <h1>Chào mừng trở lại!</h1>

        <p className="login-subtitle">
          Đăng nhập để tiếp tục hành trình của bạn.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Địa chỉ email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="ban@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Mật khẩu</label>

          <div className="login-password-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          {message && (
            <div
              className={`login-message ${
                message.includes("thành công") ? "success" : "error"
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="login-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}
