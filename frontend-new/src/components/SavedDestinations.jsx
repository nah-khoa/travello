import { ChevronRight, Heart } from 'lucide-react'
import { savedDestinations } from '../shared/data/profileData.js'

export default function SavedDestinations() {
  return (
    <section className="panel saved-section">
      <div className="section-heading">
        <div>
          <div className="heading-title">
            <h2>Điểm đến đã lưu</h2>
            <span className="count-pill">8 địa điểm</span>
          </div>
          <p>Danh sách địa danh Khoa muốn ghé thăm trong các hành trình sắp tới</p>
        </div>
        <button className="see-all">Xem tất cả <ChevronRight size={17} /></button>
      </div>
      <div className="destination-grid">
        {savedDestinations.map((place) => (
          <article className="destination-card" key={place.id}>
            <div className="destination-image-wrap">
              <img src={place.image} alt={place.title} className="destination-image" loading="lazy" />
              <button className="favorite-button" aria-label={`Bỏ lưu ${place.title}`}><Heart size={16} fill="currentColor" /></button>
              <span className="province-tag">{place.province}</span>
            </div>
            <div className="destination-content">
              <h3 title={place.title}>{place.title}</h3>
              <p>{place.description}</p>
              <div className="destination-bottom">
                <span>Chỉ từ <strong>{place.price}</strong></span>
                <button>Khám phá</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}