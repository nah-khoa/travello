import { NavLink } from "react-router-dom";

const mainMenu = [
  { label: "Dashboard", icon: "▦", path: "/admin", end: true },
  { label: "User Management", icon: "♙", path: "/admin/users" },
  { label: "Quản lý địa điểm", icon: "⌖", path: "/admin/places" },
  { label: "Quản lý danh mục", icon: "▤", path: "/admin/categories" },
  { label: "Quản lý mã giảm giá", icon: "%", path: "/admin/promotions" },
  { label: "Quản lý AI", icon: "✳", path: "/admin/ai" },
];

const bookingItems = [
  { label: "Bus / Xe khách", path: "/admin/bookings/bus" },
  { label: "Flight / Máy bay", path: "/admin/bookings/flight" },
  { label: "Train / Tàu hỏa", path: "/admin/bookings/train" },
];

const otherMenu = [
  { label: "Suppliers", icon: "♧", path: "/admin/suppliers" },
  { label: "Quản lý nội dung trang chủ", icon: "⌂", path: "/admin/home-content" },
  { label: "Reports", icon: "▤", path: "/admin/reports" },
  { label: "Hỗ trợ khách hàng", icon: "?", path: "/admin/support" },
  { label: "Wallet Management", icon: "▱", path: "/admin/wallet" },
  { label: "Payment Gateway", icon: "▣", path: "/admin/payment" },
  { label: "Settings", icon: "⚙", path: "/admin/settings" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin" className="admin-brand">
        <span className="admin-brand-logo">✈</span>

        <span className="admin-brand-text">
          <small>Admin</small>
          <strong>Travel Mini</strong>
        </span>
      </NavLink>

      <nav className="admin-navigation">
        {mainMenu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Booking Management */}
        <div className="admin-nav-group">
          <div className="admin-nav-link admin-nav-parent">
            <span className="admin-nav-icon">▣</span>
            <span>Booking Management</span>
            <span className="admin-chevron">⌄</span>
          </div>

          <div className="admin-submenu">
            {bookingItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `admin-submenu-link ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {otherMenu.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            <span className="admin-chevron">›</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
