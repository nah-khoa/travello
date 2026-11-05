import { Pencil } from 'lucide-react'

const stats = [
  { value: '12', label: 'Chuyến đi' },
  { value: '5', label: 'Tỉnh thành' },
  { value: '8', label: 'Đã lưu' },
]

export default function ProfileSummary() {
  return (
    <section className="panel profile-summary">
      <div className="profile-identity">
        <span className="avatar avatar-large">K</span>
        <div className="identity-copy">
          <h1>Khách</h1>
          <p>Thành viên Travel Mini</p>
        </div>
        <button className="edit-button" aria-label="Chỉnh sửa hồ sơ" title="Chỉnh sửa hồ sơ">
          <Pencil size={18} />
        </button>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}