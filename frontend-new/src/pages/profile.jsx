import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../shared/styles/profile.css";
import useCurrentUser from "../shared/hooks/useCurrentUser";
import { logout } from "../shared/services/authService";

const destinations = [
  {
    location: "Lâm Đồng",
    name: "Đồi Chè Cầu Đất & Săn Mây",
    description: "Khí hậu mát mẻ, lý tưởng nghỉ dưỡng cuối tuần",
    price: "450.000đ",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=700&q=80",
  },
  {
    location: "Quảng Nam",
    name: "Phố Cổ Hội An & Thả Đèn",
    description: "Vẻ đẹp cổ kính bên bờ sông Hoài lung linh về đêm",
    price: "320.000đ",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=700&q=80",
  },
  {
    location: "Hà Giang",
    name: "Đèo Mã Pí Lèng & Sông Nho Quế",
    description: "Cung đường hùng vĩ bậc nhất Đông Bắc Việt Nam",
    price: "1.250.000đ",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80",
  },
];

function Header({ user }) {
  const displayName = user?.name || user?.email || "Khách";
  const avatar = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "K";

  return (
    <header className="profile-header">
      <Link to="/" className="profile-brand">
        <span className="brand-icon">✈</span>
        <span>TRAVEL MINI</span>
      </Link>

      <nav className="profile-nav" aria-label="Điều hướng chính">
        <Link to="/">Trang chủ</Link>
        <Link to="/#booking">Tìm vé</Link>
        <Link to="/profile" className="selected">
          Chuyến đi của tôi
        </Link>
        <a href="/deals">Ưu đãi</a>
        <a href="/community">Cộng đồng</a>
      </nav>

      <div className="profile-search">
        <span>⌕</span>
        <input placeholder="Tìm chuyến đi, mã đặt chỗ..." />
      </div>

      <button className="notification-button" aria-label="Thông báo">
        ♧<i />
      </button>

      <div className="header-account">
        <span className="user-avatar small-avatar">{avatar}</span>
        <strong>{displayName}</strong>
      </div>
    </header>
  );
}

function Breadcrumb() {
  return (
    <div className="profile-breadcrumb">
      <span>Trang chủ</span>
      <span>/</span>
      <span>Tài khoản</span>
      <span>/</span>
      <strong>Hồ sơ cá nhân &amp; Quản lý tài trình</strong>
    </div>
  );
}

function ProfileCard({ user, onSave, saving }) {
  const displayName = user?.name || user?.email || "Khách";
  const avatar = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "K";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saveError, setSaveError] = useState("");

  function startEditing() {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setSaveError("");
    setEditing(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError("");
    try {
      await onSave(name.trim(), phone.trim());
      setEditing(false);
    } catch (error) {
      setSaveError(error.message || "Không thể cập nhật hồ sơ.");
    }
  }

  return (
    <section className="profile-card white-card">
      {editing ? (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <label htmlFor="profile-name">Họ và tên</label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />
          <label htmlFor="profile-phone">Số điện thoại</label>
          <input
            id="profile-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="numeric"
            pattern="0[0-9]{9}"
            maxLength={10}
            required
          />
          {saveError && (
            <p className="profile-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="profile-edit-actions">
            <button type="button" onClick={() => setEditing(false)}>
              Hủy
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-user">
          <span className="user-avatar large-avatar">{avatar}</span>

          <div className="profile-user-info">
            <h2>{displayName}</h2>
            <p>{user?.email || "Thành viên Travel Mini"}</p>
            {user?.phone && <p>{user.phone}</p>}
            {user?.role && <span className="user-role">{user.role}</span>}
          </div>

          <button
            className="edit-profile"
            type="button"
            aria-label="Chỉnh sửa hồ sơ"
            onClick={startEditing}
          >
            ✎
          </button>
        </div>
      )}

      <div className="profile-statistics">
        <div>
          <strong>12</strong>
          <span>Chuyến đi</span>
        </div>
        <div>
          <strong>5</strong>
          <span>Tỉnh thành</span>
        </div>
        <div>
          <strong>8</strong>
          <span>Đã lưu</span>
        </div>
      </div>
    </section>
  );
}

function ProfileMenu({ onLogout, loggingOut }) {
  const menuItems = [
    { icon: "♧", title: "Vé của tôi", info: "1 mới" },
    { icon: "♡", title: "Điểm đến đã lưu", info: "8 mục" },
    { icon: "▤", title: "Thanh toán", info: "Visa •••• 4820" },
    { icon: "⚙", title: "Cài đặt", info: "" },
  ];

  return (
    <>
      <section className="profile-menu white-card">
        {menuItems.map((item) => (
          <button className="profile-menu-item" key={item.title}>
            <span className="menu-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            <span className={item.info === "1 mới" ? "new-label" : "menu-info"}>
              {item.info}
            </span>
            <span className="menu-arrow">›</span>
          </button>
        ))}
      </section>

      <button
        className="logout-button"
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
      >
        ⇥ &nbsp; {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
      </button>
    </>
  );
}

function UpcomingTrip() {
  return (
    <section className="upcoming-trip">
      <div className="trip-heading-row">
        <span className="trip-label">CHUYẾN SẮP TỚI</span>
        <span className="booking-code">MÃ ĐẶT VÉ: #TM-82910</span>
      </div>

      <h1>Hành trình</h1>

      <div className="trip-date">
        <span>▣</span>
        Thứ Bảy, 24/10 · 2 hành khách
      </div>

      <div className="flight-route">
        <div className="route-location">
          <span>Khởi hành</span>
          <strong>TP. Hồ Chí Minh (SGN)</strong>
          <small>07:30 · Nhà ga T1</small>
        </div>

        <div className="route-middle">
          <span>Thời gian: 1h 20m · Trực tiếp</span>
          <div className="route-line">
            <i />
            <b>✈</b>
            <i />
          </div>
          <small>Chuyến bay VNA-772</small>
        </div>

        <div className="route-location destination-location">
          <span>Điểm đến</span>
          <strong>Đà Nẵng (DAD)</strong>
          <small>08:50 · Bến cảng sông Hàn</small>
        </div>
      </div>

      <div className="trip-actions">
        <button
          className="view-ticket"
          onClick={() => alert("Chi tiết vé sẽ được bổ sung sau")}
        >
          ◎ &nbsp; Xem vé
        </button>
        <button
          className="change-ticket"
          onClick={() => alert("Chức năng đổi hoặc hủy vé sẽ được bổ sung sau")}
        >
          Đổi lịch / Hủy vé
        </button>
      </div>
    </section>
  );
}

function SavedDestinations() {
  return (
    <section className="saved-destinations white-card">
      <div className="saved-heading">
        <div>
          <div className="saved-title-row">
            <h2>Điểm đến đã lưu</h2>
            <span className="saved-count">8 địa điểm</span>
          </div>
          <p>
            Danh sách địa danh Khoa muốn ghé thăm trong các hành trình sắp tới
          </p>
        </div>

        <button className="see-all">Xem tất cả ›</button>
      </div>

      <div className="destination-list">
        {destinations.map((destination) => (
          <article className="destination-card" key={destination.name}>
            <div className="destination-photo">
              <img src={destination.image} alt={destination.name} />
              <button
                className="favorite-button"
                aria-label="Điểm đến yêu thích"
              >
                ♥
              </button>
              <span className="destination-location-label">
                {destination.location}
              </span>
            </div>

            <div className="destination-details">
              <h3>{destination.name}</h3>
              <p>{destination.description}</p>

              <div className="destination-price">
                <span>
                  Chỉ từ <strong>{destination.price}</strong>
                </span>
                <button>Khám phá</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  // Trang chỉ quản lý trình bày; hook/service dùng chung xử lý dữ liệu và xác thực.
  const { user, loading, error, reloadUser, saveProfile } = useCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (logoutError) {
      navigate("/", {
        replace: true,
        state: {
          logoutNotice:
            logoutError.message ||
            "Đã xóa phiên trên thiết bị nhưng máy chủ chưa xác nhận đăng xuất.",
        },
      });
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleRetry() {
    await reloadUser();
  }

  async function handleSaveProfile(name, phone) {
    setSavingProfile(true);
    try {
      await saveProfile(name, phone);
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="profile-page">
      <Header user={user} />
      <Breadcrumb />

      {loading ? (
        <main className="profile-status" aria-live="polite">
          Đang tải thông tin tài khoản...
        </main>
      ) : error ? (
        <main className="profile-status">
          <p className="profile-error" role="alert">{error}</p>
          <div className="profile-status-actions">
            <button type="button" onClick={handleRetry}>Thử lại</button>
            <Link to="/login">Đăng nhập</Link>
          </div>
        </main>
      ) : (
        <main className="profile-main">
          <aside className="profile-sidebar">
            <ProfileCard
              user={user}
              onSave={handleSaveProfile}
              saving={savingProfile}
            />
            <ProfileMenu onLogout={handleLogout} loggingOut={loggingOut} />
          </aside>

          <div className="profile-content">
            <UpcomingTrip />
            <div className="profile-placeholder" aria-hidden="true" />
            <SavedDestinations />
          </div>
        </main>
      )}

      <footer className="profile-footer">
        <div className="footer-description">
          <span className="footer-logo">TM</span>
          <p>
            © 2024 Travel Mini Platform. Hệ thống đặt vé &amp; hành trình du
            lịch cá nhân hóa.
          </p>
        </div>

        <nav>
          <a href="#">Điều khoản dịch vụ</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Trung tâm trợ giúp 24/7</a>
          <a href="#">Quy chế hoạt động</a>
        </nav>
      </footer>
    </div>
  );
}
