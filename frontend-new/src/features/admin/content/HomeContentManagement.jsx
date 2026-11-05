import { useState } from 'react';
import './home-content-management.css';

export default function HomeContentManagement() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [banners, setBanners] = useState([
    {
      id: 'BN-01',
      type: 'Banner Chính Trang Chủ',
      title: 'Đặt vé trực tuyến nhanh chóng cùng Travel Mini',
      subtitle: 'Tích hợp đặt vé Máy bay, Xe khách, Tàu hỏa trên một nền tảng duy nhất',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      displayFrom: '2026-11-01',
      displayTo: '2026-12-31',
      status: 'PUBLISHED'
    },
    {
      id: 'BN-02',
      type: 'Banner Chương Trình Ưu Đãi',
      title: 'Ưu đãi mùa lễ hội cuối năm - Nhập mã TRAVELWINTER giảm 15%',
      subtitle: 'Áp dụng cho các đơn hàng đặt sớm từ 2.000.000 VNĐ trở lên',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
      displayFrom: '2026-11-01',
      displayTo: '2026-11-30',
      status: 'DRAFT'
    }
  ]);

  const [serviceCards, setServiceCards] = useState([
    {
      id: 'CARD-FLIGHT',
      service: 'Dịch vụ Vé Máy Bay',
      highlight: 'Hơn 500 chuyến bay nội địa và quốc tế mỗi ngày',
      description: 'So sánh giá vé minh bạch từ các hãng hàng không, xuất vé điện tử tức thì.',
      isVisible: true
    },
    {
      id: 'CARD-BUS',
      service: 'Dịch vụ Vé Xe Khách',
      highlight: 'Mạng lưới liên tỉnh phủ sóng 63 tỉnh thành',
      description: 'Hỗ trợ chọn vị trí ghế ngồi trước, cam kết giữ chỗ 100% khi ra bến.',
      isVisible: true
    },
    {
      id: 'CARD-TRAIN',
      service: 'Dịch vụ Vé Tàu Hỏa',
      highlight: 'Kết nối trực tiếp hệ thống Đường sắt Việt Nam',
      description: 'Tự chọn toa tàu và loại ghế ngồi/giường nằm phù hợp với nhu cầu di chuyển.',
      isVisible: true
    }
  ]);

  const [articles, setArticles] = useState([
    {
      id: 'ART-01',
      category: 'Thông báo',
      title: 'Lịch mở bán vé Tàu Tết Đinh Mùi 2027 trên toàn hệ thống',
      content: 'Hành khách có thể đặt vé sớm từ ngày 01/11/2026 và hưởng ưu đãi giảm giá trực tiếp.',
      status: 'PUBLISHED'
    },
    {
      id: 'ART-02',
      category: 'Hướng dẫn',
      title: 'Quy trình sử dụng mã đặt chỗ điện tử khi làm thủ tục lên xe và tàu',
      content: 'Xuất trình mã xác nhận đặt chỗ (PNR) hoặc mã QR tại quầy làm thủ tục trước 30 phút.',
      status: 'PUBLISHED'
    },
    {
      id: 'ART-03',
      category: 'Chính sách',
      title: 'Quy định hoàn hủy vé và thời gian xử lý hoàn tiền qua cổng thanh toán',
      content: 'Yêu cầu hoàn vé hợp lệ sẽ được đối soát và hoàn trả về tài khoản gốc trong 1-3 ngày làm việc.',
      status: 'DRAFT'
    }
  ]);

  const toggleBannerStatus = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : b))
    );
  };

  const toggleArticleStatus = (id) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : a))
    );
  };

  return (
    <div className="home-content-management p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Quản lý Nội dung & Ưu đãi Trang chủ</h1>
          <p className="text-xs text-slate-500 mb-0">
            Cập nhật banner, thẻ phương tiện di chuyển, thông báo chính sách và kiểm soát trước khi công khai
          </p>
        </div>
        <button
          onClick={() => setShowPreviewModal(true)}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-2xs"
        >
          Xem trước Trang chủ (Preview)
        </button>
      </div>

      {/* Phần 1: Banner */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Banner Trang chủ & Banner Mã giảm giá</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {banners.map((bn) => (
            <div key={bn.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600">{bn.type}</span>
                {bn.status === 'PUBLISHED' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    Đã công khai
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    Bản nháp chờ duyệt
                  </span>
                )}
              </div>
              <img src={bn.imageUrl} alt={bn.title} className="w-full h-36 object-cover rounded-lg border border-slate-100" />
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tiêu đề Banner</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 p-2 font-medium text-slate-800"
                    value={bn.title}
                    onChange={(e) =>
                      setBanners((prev) => prev.map((item) => (item.id === bn.id ? { ...item, title: e.target.value } : item)))
                    }
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mô tả giới thiệu</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-600"
                    value={bn.subtitle}
                    onChange={(e) =>
                      setBanners((prev) => prev.map((item) => (item.id === bn.id ? { ...item, subtitle: e.target.value } : item)))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Hiển thị từ</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-200 p-1.5"
                      value={bn.displayFrom}
                      onChange={(e) =>
                        setBanners((prev) => prev.map((item) => (item.id === bn.id ? { ...item, displayFrom: e.target.value } : item)))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-200 p-1.5"
                      value={bn.displayTo}
                      onChange={(e) =>
                        setBanners((prev) => prev.map((item) => (item.id === bn.id ? { ...item, displayTo: e.target.value } : item)))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => toggleBannerStatus(bn.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    bn.status === 'PUBLISHED'
                      ? 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {bn.status === 'PUBLISHED' ? 'Chuyển về Bản nháp' : 'Duyệt & Công khai'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần 2: Thẻ dịch vụ */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Quản lý các Thẻ Dịch vụ (Máy bay, Xe khách, Tàu hỏa)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {serviceCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{card.service}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={card.isVisible}
                    onChange={(e) =>
                      setServiceCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, isVisible: e.target.checked } : c)))
                    }
                  />
                  <span className="text-slate-600">Hiển thị</span>
                </label>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Điểm nổi bật</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 p-2 font-medium"
                  value={card.highlight}
                  onChange={(e) =>
                    setServiceCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, highlight: e.target.value } : c)))
                  }
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-600"
                  value={card.description}
                  onChange={(e) =>
                    setServiceCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, description: e.target.value } : c)))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần 3: Thông báo & Chính sách */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Thông báo, Hướng dẫn & Chính sách</div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Tiêu đề & Nội dung</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Kiểm soát xuất bản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {articles.map((art) => (
                <tr key={art.id}>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">{art.category}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{art.title}</div>
                    <div className="text-slate-500 mt-0.5">{art.content}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {art.status === 'PUBLISHED' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Đã công khai</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Bản nháp</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleArticleStatus(art.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        art.status === 'PUBLISHED'
                          ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {art.status === 'PUBLISHED' ? 'Gỡ xuống nháp' : 'Công khai'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 mb-0">Xem trước Trang chủ (Chỉ hiển thị nội dung Đã công khai)</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
            </div>
            <div className="space-y-4">
              {banners.filter((b) => b.status === 'PUBLISHED').map((b) => (
                <div key={b.id} className="p-5 rounded-xl text-white" style={{ backgroundImage: `linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.75)), url(${b.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="text-base font-bold">{b.title}</div>
                  <div className="text-xs text-slate-200 mt-1">{b.subtitle}</div>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {serviceCards.filter((c) => c.isVisible).map((c) => (
                  <div key={c.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900">{c.service}</div>
                    <div className="text-blue-600 font-medium my-1">{c.highlight}</div>
                    <div className="text-slate-500">{c.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}