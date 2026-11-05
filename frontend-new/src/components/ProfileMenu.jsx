import { CreditCard, Heart, Settings, Ticket, ChevronRight, LogOut } from 'lucide-react'

const menuItems = [
  { label: 'Vé của tôi', meta: '1 mới', icon: Ticket, badge: true },
  { label: 'Điểm đến đã lưu', meta: '8 mục', icon: Heart },
  { label: 'Thanh toán', meta: 'Visa •••• 4820', icon: CreditCard },
  { label: 'Cài đặt', meta: '', icon: Settings },
]

export default function ProfileMenu() {
  return (
    <>
      <section className="panel profile-menu" aria-label="Quản lý tài khoản">
        {menuItems.map(({ label, meta, icon: Icon, badge }) => (
          <button className="menu-row" key={label}>
            <span className="menu-icon"><Icon size={18} /></span>
            <strong>{label}</strong>
            {meta && <span className={badge ? 'menu-meta new-badge' : 'menu-meta'}>{meta}</span>}
            <ChevronRight className="menu-chevron" size={17} />
          </button>
        ))}
      </section>
      <button className="logout-button"><LogOut size={16} /> Đăng xuất</button>
    </>
  )
}