import Header from '../components/Header.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

export default function SiteLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <Breadcrumbs />
      <main className="page-main">{children}</main>
      <footer className="site-footer">
        <div className="footer-brand"><span>TM</span><p>© 2024 Travel Mini Platform. Hệ thống đặt vé &amp; hành trình du lịch cá nhân hóa.</p></div>
        <nav aria-label="Liên kết cuối trang">
          <a href="#">Điều khoản dịch vụ</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Trung tâm trợ giúp 24/7</a>
          <a href="#">Quy chế hoạt động</a>
        </nav>
      </footer>
    </div>
  )
}