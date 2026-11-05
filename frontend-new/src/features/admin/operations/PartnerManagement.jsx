import { useEffect, useState } from 'react';
import './admin-utility-pages.css';
import { loadTransportTrips } from '../../../shared/services/adminTransportData';
import { api } from '../../../shared/services/api';

export default function PartnerManagement() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [partners, setPartners] = useState([
    {
      id: 'PT-01',
      name: 'Vietnam Airlines',
      serviceType: 'FLIGHT',
      contactName: 'Ban Thương Mại Hàng Không',
      phone: '1900 1100',
      email: 'b2b@vietnamairlines.com',
      routes: ['TP.HCM - Hà Nội (18 chuyến/ngày)', 'TP.HCM - Đà Nẵng (10 chuyến/ngày)', 'Hà Nội - Phú Quốc (6 chuyến/ngày)'],
      totalBookings: 651,
      revenue: 1425000000,
      occupancyRate: 88,
      isActive: true
    },
    {
      id: 'PT-02',
      name: 'Phương Trang (FUTA Bus Lines)',
      serviceType: 'BUS',
      contactName: 'Phòng Điều Vận Khai Thác',
      phone: '1900 6067',
      email: 'doitac@futabus.vn',
      routes: ['TP.HCM - Đà Lạt (40 chuyến/ngày)', 'TP.HCM - Nha Trang (20 chuyến/ngày)', 'TP.HCM - Cần Thơ (35 chuyến/ngày)'],
      totalBookings: 498,
      revenue: 245000000,
      occupancyRate: 82,
      isActive: true
    },
    {
      id: 'PT-03',
      name: 'Tổng Công ty Đường sắt Việt Nam (VNR)',
      serviceType: 'TRAIN',
      contactName: 'Chi nhánh Vận tải Đường sắt Sài Gòn',
      phone: '1900 1520',
      email: 'vetau@dsvn.vn',
      routes: ['Tuyến SE1/SE2: Sài Gòn - Hà Nội', 'Tuyến SNT1/SNT2: Sài Gòn - Nha Trang'],
      totalBookings: 312,
      revenue: 368000000,
      occupancyRate: 79,
      isActive: true
    },
    {
      id: 'PT-04',
      name: 'Nhà Xe Thành Bưởi',
      serviceType: 'BUS',
      contactName: 'Bộ phận Quản lý Tuyến',
      phone: '1900 6079',
      email: 'lienhe@thanhbuoi.com.vn',
      routes: ['TP.HCM - Đà Lạt', 'TP.HCM - Bảo Lộc'],
      totalBookings: 120,
      revenue: 58000000,
      occupancyRate: 60,
      isActive: false
    }
  ]);

  const initialForm = {
    name: '',
    serviceType: 'BUS',
    contactName: '',
    phone: '',
    email: '',
    routesText: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    let cancelled = false;
    api('/api/admin/providers')
      .then((data) => {
        if (!cancelled && Array.isArray(data.items)) setPartners(data.items);
      })
      .catch((error) => {
        if (!cancelled) window.alert(error.message || 'Không thể tải danh sách nhà cung cấp.');
      });

    const syncPartnerOperations = () => {
      const trips = loadTransportTrips();
      setPartners((current) =>
        current.map((partner) => {
          const serviceKey = partner.serviceType.toLowerCase();
          const serviceTrips = trips[serviceKey] || [];
          const partnerTrips = serviceTrips.filter(
            (trip) => trip.operator === partner.name || partner.name.includes(trip.operator),
          );
          if (!partnerTrips.length) return partner;

          return {
            ...partner,
            routes: [...new Set(partnerTrips.map((trip) => `${trip.departure} - ${trip.destination}`))],
            totalBookings: partnerTrips.length,
            revenue: partnerTrips.reduce((sum, trip) => sum + Number(trip.price || 0), 0),
            occupancyRate: Math.round(
              (partnerTrips.filter((trip) => trip.status === 'active').length / partnerTrips.length) * 100,
            ),
          };
        }),
      );
    };

    syncPartnerOperations();
    window.addEventListener('admin-transport-data-updated', syncPartnerOperations);
    window.addEventListener('storage', syncPartnerOperations);
    return () => {
      cancelled = true;
      window.removeEventListener('admin-transport-data-updated', syncPartnerOperations);
      window.removeEventListener('storage', syncPartnerOperations);
    };
  }, []);

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + ' ₫';

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (pt) => {
    setEditingPartner(pt);
    setFormData({
      name: pt.name,
      serviceType: pt.serviceType,
      contactName: pt.contactName,
      phone: pt.phone,
      email: pt.email,
      routesText: pt.routes.join('\n'),
      isActive: pt.isActive
    });
    setShowModal(true);
  };

  const handleSavePartner = async (e) => {
    e.preventDefault();
    const routesArray = formData.routesText.split('\n').map((r) => r.trim()).filter(Boolean);
    try {
      const response = await api(
        editingPartner
          ? `/api/admin/providers/${encodeURIComponent(editingPartner.id)}`
          : '/api/admin/providers',
        {
          method: editingPartner ? 'PATCH' : 'POST',
          body: JSON.stringify({ ...formData, routes: routesArray }),
        },
      );
      const saved = response.item;
      setPartners((prev) =>
        editingPartner
          ? prev.map((partner) => (partner.id === saved.id ? saved : partner))
          : [saved, ...prev],
      );
      setShowModal(false);
    } catch (error) {
      window.alert(error.message || 'Không thể lưu nhà cung cấp.');
    }
    if (e) return;
    if (editingPartner) {
      setPartners((prev) =>
        prev.map((p) => (p.id === editingPartner.id ? { ...p, ...formData, routes: routesArray } : p))
      );
    } else {
      setPartners([
        {
          id: `PT-0${partners.length + 1}`,
          ...formData,
          routes: routesArray.length ? routesArray : ['Chưa gắn tuyến'],
          totalBookings: 0,
          revenue: 0,
          occupancyRate: 0
        },
        ...partners
      ]);
    }
    setShowModal(false);
  };

  const togglePartnerActive = async (partner) => {
    try {
      const response = await api(`/api/admin/providers/${encodeURIComponent(partner.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: partner.name,
          serviceType: partner.serviceType,
          contactName: partner.contactName,
          phone: partner.phone,
          email: partner.email,
          routes: partner.routes,
          isActive: !partner.isActive,
        }),
      });
      setPartners((prev) => prev.map((item) => (item.id === partner.id ? response.item : item)));
    } catch (error) {
      window.alert(error.message || 'Không thể cập nhật trạng thái nhà cung cấp.');
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchService = serviceFilter === 'ALL' || p.serviceType === serviceFilter;
    return matchName && matchService;
  });

  const serviceLabel = {
    FLIGHT: 'Hàng không',
    BUS: 'Xe khách đường bộ',
    TRAIN: 'Đường sắt'
  };

  return (
    <div className="admin-utility-page p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Quản lý Nhà cung cấp & Đối tác Vận tải</h1>
          <p className="text-xs text-slate-500 mb-0">
            Quản lý thông tin đơn vị vận tải, liên kết tuyến khai thác và theo dõi hiệu quả doanh thu
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
        >
          + Thêm đơn vị vận tải
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-80"
          placeholder="Tìm theo tên hãng bay, nhà xe, đối tác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="ALL">Tất cả loại hình vận tải</option>
          <option value="FLIGHT">Hàng không (Máy bay)</option>
          <option value="BUS">Vận tải đường bộ (Xe khách)</option>
          <option value="TRAIN">Đường sắt (Tàu hỏa)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPartners.map((pt) => (
          <div key={pt.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                    {serviceLabel[pt.serviceType]}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 mb-0">{pt.name}</h3>
                </div>
                {pt.isActive ? (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    Đang hợp tác
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                    Ngừng cung cấp
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-0.5">
                <div>Đầu mối liên hệ: <b className="text-slate-800">{pt.contactName}</b></div>
                <div>Điện thoại: <b className="text-slate-800">{pt.phone}</b> · Email: <b className="text-slate-800">{pt.email}</b></div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">Tuyến & Chuyến liên kết khai thác:</div>
                <ul className="list-disc pl-4 text-slate-600 space-y-0.5 mb-0">
                  {pt.routes.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-400">Số Booking</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{pt.totalBookings}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-400">Tỷ lệ lấp đầy</div>
                  <div className="font-bold text-blue-600 text-sm mt-0.5">{pt.occupancyRate}%</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-400">Doanh thu</div>
                  <div className="font-bold text-emerald-600 text-xs mt-1">{formatVND(pt.revenue)}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex justify-end gap-2 text-xs">
              <button
                onClick={() => togglePartnerActive(pt)}
                className={`px-3 py-1.5 rounded-lg font-medium border transition ${
                  pt.isActive
                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {pt.isActive ? 'Ngừng cung cấp dịch vụ' : 'Bật cung cấp lại'}
              </button>
              <button
                onClick={() => handleOpenEdit(pt)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                Cập nhật & Gắn tuyến
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl">
            <form onSubmit={handleSavePartner} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 mb-0">
                  {editingPartner ? 'Cập nhật đối tác vận tải' : 'Thêm đơn vị vận tải mới'}
                </h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Tên đơn vị vận tải *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại hình</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 p-2 bg-white"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  >
                    <option value="FLIGHT">Hàng không</option>
                    <option value="BUS">Xe khách</option>
                    <option value="TRAIN">Tàu hỏa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người liên hệ *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điện thoại *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Tuyến & Chuyến khai thác (Mỗi tuyến 1 dòng) *</label>
                  <textarea
                    rows="3"
                    required
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={formData.routesText}
                    onChange={(e) => setFormData({ ...formData, routesText: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}