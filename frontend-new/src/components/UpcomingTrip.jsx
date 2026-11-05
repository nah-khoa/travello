import { CalendarDays, Eye, PlaneTakeoff } from 'lucide-react'

export default function UpcomingTrip() {
  return (
    <section className="upcoming-trip">
      <div className="trip-orb" />
      <div className="trip-topline">
        <span className="trip-status">CHUYẾN SẮP TỚI</span>
        <span className="booking-code">MÃ ĐẶT VÉ: #TM-82910</span>
      </div>
      <h2>Hành trình</h2>
      <div className="trip-date"><CalendarDays size={17} /> Thứ Bảy, 24/10 · 2 hành khách</div>

      <div className="route-panel">
        <div className="route-place departure">
          <span>Khởi hành</span>
          <strong>TP. Hồ Chí Minh (SGN)</strong>
          <small>07:30 · Nhà ga T1</small>
        </div>
        <div className="route-middle">
          <span className="route-duration">Thời gian: 1h 20m · Trực tiếp</span>
          <div className="route-line"><i /><PlaneTakeoff size={19} /><i /></div>
          <span className="route-flight">Chuyến bay VNA-772</span>
        </div>
        <div className="route-place arrival">
          <span>Điểm đến</span>
          <strong>Đà Nẵng (DAD)</strong>
          <small>08:50 · Bến cảng sông Hàn</small>
        </div>
      </div>
      <div className="trip-actions">
        <button className="view-ticket"><Eye size={17} /> Xem vé</button>
        <button className="change-ticket">Đổi lịch / Hủy vé</button>
      </div>
    </section>
  )
}