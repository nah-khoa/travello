import { Bell, Plane, Search } from 'lucide-react'

const navItems = ['Trang chủ', 'Tìm vé', 'Chuyến đi của tôi', 'Ưu đãi', 'Cộng đồng']

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Travel Mini trang chủ">
        <span className="brand-mark"><Plane size={23} strokeWidth={1.7} /></span>
        <span>TRAVEL MINI</span>
      </a>

      <nav className="main-nav" aria-label="Điều hướng chính">
        {navItems.map((item) => (
          <a className={item === 'Chuyến đi của tôi' ? 'nav-link active' : 'nav-link'} href="#" key={item}>
            {item}
          </a>
        ))}
      </nav>

      <label className="header-search">
        <Search size={16} />
        <input placeholder="Tìm chuyến đi, mã đặt chỗ..." aria-label="Tìm chuyến đi" />
      </label>

      <button className="icon-button notification" aria-label="Thông báo">
        <Bell size={19} /><span className="notification-dot" />
      </button>
      <span className="header-divider" />
      <div className="header-user">
        <span className="avatar avatar-small">K</span>
        <strong>Khách</strong>
      </div>
    </header>
  )
}