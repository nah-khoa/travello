import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs() {
  return (
    <div className="breadcrumb-bar">
      <a href="#">Trang chủ</a><ChevronRight size={13} />
      <a href="#">Tài khoản</a><ChevronRight size={13} />
      <strong>Hồ sơ cá nhân &amp; Quản lý tài trình</strong>
    </div>
  )
}