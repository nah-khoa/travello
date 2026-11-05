import { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/promos';

export default function PromoManagement() {
  const [promos, setPromos] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    code: '',
    title: '',
    discountType: 'PERCENT',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: 0,
    applicableService: 'ALL',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    perUserLimit: 1,
    imageUrl: '',
    description: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  const [testData, setTestData] = useState({
    code: 'TRAVELWINTER',
    userId: 'USER_001',
    serviceType: 'FLIGHT',
    orderValue: 2500000
  });
  const [testResult, setTestResult] = useState(null);

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}&status=${statusFilter}`
      );
      const result = await res.json();
      if (result.success) {
        setPromos(result.data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách mã:', error);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const loadPromos = async () => {
      await fetchPromos();
    };

    loadPromos();
  }, [fetchPromos]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDiscountLabel = (promo) => {
    if (promo.discountType === 'PERCENT') {
      return `Giảm ${promo.discountValue}%`;
    }
    const val = promo.discountValue;
    if (val >= 1000 && val % 1000 === 0) {
      return `Giảm ${val / 1000}k`;
    }
    return `Giảm ${Number(val).toLocaleString('vi-VN')}đ`;
  };

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + ' VNĐ';

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowFormModal(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingId(promo._id);
    setFormData({
      code: promo.code,
      title: promo.title || promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscountAmount: promo.maxDiscountAmount || '',
      minOrderValue: promo.minOrderValue || 0,
      applicableService: promo.applicableService || 'ALL',
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '2026-11-01',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '2026-12-31',
      usageLimit: promo.usageLimit || 500,
      perUserLimit: promo.perUserLimit || 1,
      imageUrl: promo.imageUrl || '',
      description: promo.description || '',
      isActive: promo.isActive
    });
    setOpenMenuId(null);
    setShowFormModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      title: formData.title || formData.code,
      discountValue: Number(formData.discountValue),
      maxDiscountAmount:
        formData.discountType === 'PERCENT' && formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : null,
      minOrderValue: Number(formData.minOrderValue),
      usageLimit: Number(formData.usageLimit),
      perUserLimit: Number(formData.perUserLimit),
      imageUrl:
        formData.imageUrl ||
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80'
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      setShowFormModal(false);
      fetchPromos();
    } else {
      alert(result.message);
    }
  };

  // Hàm Bật / Tắt mã giảm giá
  const handleToggleStatus = async (id) => {
    await fetch(`${API_URL}/${id}/toggle`, { method: 'PATCH' });
    setOpenMenuId(null);
    fetchPromos();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setOpenMenuId(null);
    fetchPromos();
  };

  const handleSeedSample = async () => {
    const res = await fetch(`${API_URL}/seed`, { method: 'POST' });
    const result = await res.json();
    alert(result.message);
    fetchPromos();
  };

  const handleRunTest = async (confirmApply) => {
    const res = await fetch(`${API_URL}/validate-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testData,
        orderValue: Number(testData.orderValue),
        confirmApply
      })
    });
    const result = await res.json();
    setTestResult(result);
    if (result.success && confirmApply) {
      fetchPromos();
    }
  };

  const now = new Date();
  const totalUsed = promos.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const totalDiscount = promos.reduce((sum, p) => sum + (p.totalDiscountGiven || 0), 0);

  return (
    <div className="promo-management-page" style={{ backgroundColor: '#f5f7fb', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        .promo-management-page *,
        .promo-management-page *::before,
        .promo-management-page *::after {
          box-sizing: border-box;
        }
        .promo-management-page button,
        .promo-management-page input,
        .promo-management-page select {
          font: inherit;
        }
        .promo-management-page button {
          cursor: pointer;
        }
        .promo-management-page .d-flex { display: flex; }
        .promo-management-page .align-items-center { align-items: center; }
        .promo-management-page .align-items-start { align-items: flex-start; }
        .promo-management-page .justify-content-between { justify-content: space-between; }
        .promo-management-page .justify-content-center { justify-content: center; }
        .promo-management-page .flex-wrap { flex-wrap: wrap; }
        .promo-management-page .gap-1 { gap: 4px; }
        .promo-management-page .gap-2 { gap: 8px; }
        .promo-management-page .gap-3 { gap: 12px; }
        .promo-management-page .gap-4 { gap: 16px; }
        .promo-management-page .row {
          display: flex;
          flex-wrap: wrap;
          margin: -12px;
        }
        .promo-management-page [class*="col-"] {
          width: 100%;
          padding: 12px;
        }
        .promo-management-page .col-12 { width: 100%; }
        .promo-management-page .col-6 { width: 50%; }
        .promo-management-page .form-control,
        .promo-management-page .form-select {
          display: block;
          width: 100%;
          min-height: 40px;
          padding: 8px 12px;
          border: 1px solid #dce1e7;
          border-radius: 8px;
          background: #fff;
          color: #1f2937;
          outline: none;
        }
        .promo-management-page .form-control:focus,
        .promo-management-page .form-select:focus {
          border-color: #1d63dc;
          box-shadow: 0 0 0 3px rgba(29, 99, 220, 0.12);
        }
        .promo-management-page .form-label {
          display: inline-block;
          margin-bottom: 6px;
          color: #374151;
          font-size: 0.88rem;
        }
        .promo-management-page .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .promo-management-page .form-check-input {
          width: 18px;
          height: 18px;
        }
        .promo-management-page .form-check-label {
          color: #374151;
          font-size: 0.9rem;
        }
        .promo-management-page .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 7px 14px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: #fff;
          font-size: 0.9rem;
        }
        .promo-management-page .btn-outline-secondary {
          border-color: #cbd5e1;
          color: #475569;
        }
        .promo-management-page .btn-outline-primary {
          border-color: #60a5fa;
          color: #1d63dc;
        }
        .promo-management-page .btn-warning {
          border-color: #fbbf24;
          background: #facc15;
          color: #422006;
        }
        .promo-management-page .btn-success {
          background: #16a34a;
          color: #fff;
        }
        .promo-management-page .btn-danger {
          background: #dc2626;
          color: #fff;
        }
        .promo-management-page .btn-close {
          width: 32px;
          min-height: 32px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 0;
        }
        .promo-management-page .btn-close::after {
          content: "×";
          font-size: 25px;
        }
        .promo-management-page .text-center { text-align: center; }
        .promo-management-page .text-muted { color: #64748b; }
        .promo-management-page .text-secondary { color: #64748b; }
        .promo-management-page .text-dark { color: #1f2937; }
        .promo-management-page .fw-bold { font-weight: 700; }
        .promo-management-page .fw-semibold { font-weight: 600; }
        .promo-management-page .small { font-size: 0.8rem; }
        .promo-management-page .mb-0 { margin-bottom: 0; }
        .promo-management-page .mb-3 { margin-bottom: 16px; }
        .promo-management-page .mb-4 { margin-bottom: 24px; }
        .promo-management-page .mt-1 { margin-top: 4px; }
        .promo-management-page .py-5 { padding-top: 48px; padding-bottom: 48px; }
        .promo-management-page .rounded-3 { border-radius: 12px; }
        .promo-management-page .border { border: 1px solid #e6e9ef; }
        .promo-management-page .bg-white { background: #fff; }
        .promo-management-page .modal {
          position: fixed;
          inset: 0;
          z-index: 1200;
          overflow-y: auto;
        }
        .promo-management-page .modal-dialog {
          width: calc(100% - 32px);
          max-width: 860px;
          margin: 32px auto;
        }
        .promo-management-page .modal-dialog-centered {
          min-height: calc(100% - 64px);
          display: flex;
          align-items: center;
        }
        .promo-management-page .modal-content {
          width: 100%;
          overflow: hidden;
          border-radius: 12px;
          background: #fff;
        }
        .promo-management-page .modal-header,
        .promo-management-page .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          border-bottom: 1px solid #e5e7eb;
        }
        .promo-management-page .modal-footer {
          justify-content: flex-end;
          border-top: 1px solid #e5e7eb;
          border-bottom: 0;
        }
        .promo-management-page .modal-title { margin: 0; }
        .promo-management-page .modal-body { padding: 22px; }
        .promo-management-page .alert {
          padding: 12px 14px;
          border-radius: 8px;
        }
        .promo-management-page .alert-success {
          background: #dcfce7;
          color: #166534;
        }
        .promo-management-page .alert-danger {
          background: #fee2e2;
          color: #991b1b;
        }
        .promo-management-page .position-relative { position: relative; }
        .promo-management-page .position-absolute { position: absolute; }
        .promo-management-page .top-0 { top: 0; }
        .promo-management-page .start-100 { left: 100%; }
        .promo-management-page .translate-middle { transform: translate(-50%, -50%); }
        .promo-management-page .badge {
          display: inline-block;
          padding: 3px 6px;
          border-radius: 999px;
        }
        .promo-management-page .bg-danger { background: #dc2626; color: #fff; }
        @media (min-width: 768px) {
          .promo-management-page .col-md-4 { width: 33.333333%; }
          .promo-management-page .col-md-6 { width: 50%; }
        }
        @media (min-width: 992px) {
          .promo-management-page .col-lg-4 { width: 33.333333%; }
        }
        @media (max-width: 700px) {
          .promo-management-page .top-navbar {
            height: auto;
            min-height: 64px;
            gap: 12px;
            padding: 12px 16px;
          }
          .promo-management-page .main-container { padding: 20px 16px; }
          .promo-management-page .filter-bar { align-items: stretch; }
          .promo-management-page .search-box { width: 100%; }
          .promo-management-page .filter-bar > div { width: 100%; }
          .promo-management-page .col-6 { width: 100%; }
        }
        .top-navbar {
          background: #ffffff;
          height: 64px;
          padding: 0 28px;
          border-bottom: 1px solid #eef0f4;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .main-container {
          padding: 28px 32px;
          max-width: 1440px;
          margin: 0 auto;
        }
        .filter-bar {
          background: #ffffff;
          border-radius: 10px;
          padding: 14px 20px;
          border: 1px solid #eaedf2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .search-box {
          position: relative;
          width: 300px;
        }
        .search-box i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-box input {
          padding-left: 38px;
          border-radius: 8px;
          border: 1px solid #dce1e7;
          height: 40px;
          font-size: 0.92rem;
        }
        .btn-toolbar-action {
          height: 40px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
        .btn-add-promo {
          background-color: #1d63dc;
          color: #fff;
          border: none;
          border-radius: 8px;
          height: 40px;
          padding: 0 18px;
          font-weight: 500;
          font-size: 0.92rem;
          white-space: nowrap;
        }
        .btn-add-promo:hover {
          background-color: #154eb5;
          color: #fff;
        }
        .promo-card-item {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e6e9ef;
          padding: 22px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
          position: relative;
        }
        .promo-code-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
          letter-spacing: 0.3px;
        }
        .promo-sub-discount {
          font-size: 0.98rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 14px;
        }
        .promo-banner-img {
          width: 100%;
          height: 155px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .promo-condition-text {
          font-size: 0.92rem;
          color: #1f2937;
          margin-bottom: 12px;
          line-height: 1.45;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.84rem;
          font-weight: 600;
        }
        .pill-active {
          background-color: #def7ec;
          color: #166534;
        }
        .pill-inactive {
          background-color: #fef3c7;
          color: #92400e;
        }
        .pill-expired {
          background-color: #fde8e8;
          color: #9b1c1c;
        }
        .btn-toggle-on {
          border: 1px solid #86efac;
          background: #f0fdf4;
          color: #15803d;
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .btn-toggle-on:hover {
          background: #dcfce7;
        }
        .btn-toggle-off {
          border: 1px solid #fcd34d;
          background: #fffbeb;
          color: #b45309;
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .btn-toggle-off:hover {
          background: #fef3c7;
        }
        .btn-edit-card {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #1f2937;
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .btn-edit-card:hover {
          background: #f3f4f6;
        }
        .btn-delete-card {
          border: 1px solid #f8b4b4;
          background: #fff;
          color: #c81e1e;
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .btn-delete-card:hover {
          background: #fef2f2;
        }
        .dots-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 1.2rem;
          padding: 0 6px;
          cursor: pointer;
        }
        .dots-dropdown {
          position: absolute;
          right: 20px;
          top: 48px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 20;
          min-width: 190px;
          padding: 6px 0;
        }
        .dots-dropdown button {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 0.86rem;
          color: #374151;
        }
        .dots-dropdown button:hover {
          background: #f3f4f6;
        }
      `}</style>

      {/* Phần Nội Dung Chính */}
      <div className="main-container">
        <h2 className="fw-bold mb-4" style={{ color: '#111827', fontSize: '1.65rem' }}>
          Promo Codes Management
        </h2>

        {/* Thanh Tìm Kiếm + 3 Nút (Chỉ chữ, không icon) + Bộ lọc + Thêm mã mới */}
        <div className="filter-bar flex-wrap">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Search by code, campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary btn-toolbar-action"
              onClick={handleSeedSample}
            >
              Dữ liệu mẫu
            </button>

            <button
              className="btn btn-outline-primary btn-toolbar-action"
              onClick={() => setShowStatsModal(true)}
            >
              Thống kê ưu đãi
            </button>

            <button
              className="btn btn-warning btn-toolbar-action text-dark"
              onClick={() => {
                setTestResult(null);
                setShowTestModal(true);
              }}
            >
              Kiểm tra mã
            </button>

            <select
              className="form-select"
              style={{ width: 165, height: 40, borderRadius: 8, fontSize: '0.92rem', borderColor: '#dce1e7' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Active / Inactive</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đang tạm tắt</option>
              <option value="EXPIRED">Đã hết hạn</option>
            </select>

            <button className="btn-add-promo" onClick={handleOpenCreate}>
              + Thêm mã mới
            </button>
          </div>
        </div>

        {/* Lưới Thẻ Mã Giảm Giá */}
        <div className="row g-4">
          {promos.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted bg-white rounded-3 border">
              Chưa có mã giảm giá nào. Hãy bấm nút <b>"Dữ liệu mẫu"</b> để tạo 6 thẻ mẫu!
            </div>
          ) : (
            promos.map((p) => {
              const isDateOrLimitExpired = now > new Date(p.endDate) || p.usedCount >= p.usageLimit;

              return (
                <div className="col-12 col-md-6 col-lg-4" key={p._id}>
                  <div className="promo-card-item">
                    <div>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="promo-code-heading">{p.code}</div>
                          <div className="promo-sub-discount">{formatDiscountLabel(p)}</div>
                        </div>

                        <button
                          className="dots-btn"
                          onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                        >
                          <i className="fa-solid fa-ellipsis"></i>
                        </button>

                        {openMenuId === p._id && (
                          <div className="dots-dropdown">
                            <button onClick={() => handleToggleStatus(p._id)}>
                              {p.isActive ? 'Tắt / Ngừng kích hoạt' : 'Bật hoạt động lại'}
                            </button>
                            <button
                              onClick={() => {
                                setTestData({ ...testData, code: p.code });
                                setTestResult(null);
                                setOpenMenuId(null);
                                setShowTestModal(true);
                              }}
                            >
                              Kiểm tra áp dụng mã này
                            </button>
                            <div className="border-top my-1"></div>
                            <div className="px-3 py-1 small text-muted">
                              Dịch vụ: <b>{p.applicableService}</b> <br />
                              Tối đa/khách: <b>{p.perUserLimit} lượt</b> <br />
                              Tổng tiền đã giảm: <b>{formatVND(p.totalDiscountGiven)}</b>
                            </div>
                          </div>
                        )}
                      </div>

                      <img src={p.imageUrl} alt={p.code} className="promo-banner-img" />

                      <div className="promo-condition-text">
                        <span className="fw-bold">Điều kiện:</span> {p.description}
                      </div>

                      {/* Nhãn Trạng thái + Công tắc Bật/Tắt nhanh trên thẻ */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          {isDateOrLimitExpired ? (
                            <span className="status-pill pill-expired">Hết hạn</span>
                          ) : p.isActive ? (
                            <span className="status-pill pill-active">Đang hoạt động</span>
                          ) : (
                            <span className="status-pill pill-inactive">Đang tạm tắt</span>
                          )}
                        </div>

                        {/* Công tắc gạt Bật/Tắt trực tiếp */}
                        <div className="form-check form-switch m-0 d-flex align-items-center gap-2" title="Gạt để Bật / Tắt mã">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            style={{ cursor: 'pointer', width: '2.4em', height: '1.25em' }}
                            checked={p.isActive}
                            onChange={() => handleToggleStatus(p._id)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-end mb-3">
                        <div>
                          <div className="fw-bold" style={{ fontSize: '0.88rem', color: '#111827' }}>
                            Thời gian áp dụng:
                          </div>
                          <div style={{ fontSize: '0.88rem', color: '#374151' }}>
                            {formatDate(p.startDate)} - {formatDate(p.endDate)}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-bold" style={{ fontSize: '0.92rem', color: '#111827' }}>
                            {p.usedCount}/{p.usageLimit}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#374151' }}>Đã dùng</div>
                        </div>
                      </div>

                      {/* 3 nút thao tác rõ ràng: Bật/Tắt + Chỉnh sửa + Xóa */}
                      <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                        <button
                          className={p.isActive ? 'btn-toggle-off' : 'btn-toggle-on'}
                          onClick={() => handleToggleStatus(p._id)}
                        >
                          {p.isActive ? 'Tắt mã' : 'Bật mã'}
                        </button>
                        <button className="btn-edit-card" onClick={() => handleOpenEdit(p)}>
                          Chỉnh sửa
                        </button>
                        <button className="btn-delete-card" onClick={() => handleDelete(p._id)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: THÊM MỚI / CHỈNH SỬA MÃ GIẢM GIÁ */}
      {showFormModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSavePromo}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingId ? `Chỉnh sửa mã: ${formData.code}` : 'Tạo mới mã giảm giá'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Mã giảm giá (Code) *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase fw-bold"
                        placeholder="VD: TRAVELWINTER, TMWELCOME75..."
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Áp dụng cho dịch vụ</label>
                      <select
                        className="form-select"
                        value={formData.applicableService}
                        onChange={(e) => setFormData({ ...formData, applicableService: e.target.value })}
                      >
                        <option value="ALL">Toàn hệ thống</option>
                        <option value="FLIGHT">Riêng Máy bay (Flight)</option>
                        <option value="BUS">Riêng Xe khách (Bus)</option>
                        <option value="TRAIN">Riêng Tàu hỏa (Train)</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Loại giảm giá</label>
                      <select
                        className="form-select"
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      >
                        <option value="PERCENT">Phần trăm (%)</option>
                        <option value="FIXED">Số tiền cố định (VNĐ)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Giá trị giảm ({formData.discountType === 'PERCENT' ? '%' : 'VNĐ'}) *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="VD: 15 hoặc 100000"
                        required
                        min="1"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Mức giảm tối đa (VNĐ)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Không giới hạn"
                        disabled={formData.discountType !== 'PERCENT'}
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giá trị đơn tối thiểu (VNĐ)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.minOrderValue}
                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giới hạn tổng số lượt dùng *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        required
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Số lượt tối đa / mỗi khách *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        required
                        value={formData.perUserLimit}
                        onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Thời gian bắt đầu *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Thời gian kết thúc *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Điều kiện hiển thị trên thẻ *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="VD: Áp dụng cho đơn hàng từ 2.000.000 VNĐ"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Link hình ảnh minh họa</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="activeSwitch"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="activeSwitch">
                          Trạng thái: Đang hoạt động (Bỏ chọn để chuyển sang Tạm tắt)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowFormModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Lưu lại
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM SỐ LẦN SỬ DỤNG & TỔNG GIÁ TRỊ ƯU ĐÃI */}
      {showStatsModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Thống kê sử dụng & Tổng giá trị ưu đãi</h5>
                <button type="button" className="btn-close" onClick={() => setShowStatsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between">
                  <span>Tổng số lượt đã sử dụng toàn hệ thống:</span>
                  <b className="text-primary fs-5">{totalUsed} lượt</b>
                </div>
                <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between">
                  <span>Tổng giá trị ưu đãi đã giảm cho khách:</span>
                  <b className="text-success fs-5">{formatVND(totalDiscount)}</b>
                </div>
                <h6 className="fw-bold mt-3">Chi tiết từng mã:</h6>
                <ul className="list-group list-group-flush small">
                  {promos.map((p) => (
                    <li key={p._id} className="list-group-item d-flex justify-content-between px-0">
                      <span>
                        <b>{p.code}</b> ({p.usedCount}/{p.usageLimit} lượt)
                      </span>
                      <span className="fw-semibold text-success">{formatVND(p.totalDiscountGiven)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KIỂM TRA & NGĂN MÃ KHÔNG HỢP LỆ Ở BACKEND */}
      {showTestModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-warning-subtle">
                <h5 className="modal-title fw-bold">Kiểm tra & Áp dụng mã ở Backend</h5>
                <button type="button" className="btn-close" onClick={() => setShowTestModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nhập mã giảm giá</label>
                  <input
                    type="text"
                    className="form-control text-uppercase fw-bold"
                    value={testData.code}
                    onChange={(e) => setTestData({ ...testData, code: e.target.value })}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">Mã khách hàng</label>
                    <input
                      type="text"
                      className="form-control"
                      value={testData.userId}
                      onChange={(e) => setTestData({ ...testData, userId: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">Loại phương tiện</label>
                    <select
                      className="form-select"
                      value={testData.serviceType}
                      onChange={(e) => setTestData({ ...testData, serviceType: e.target.value })}
                    >
                      <option value="FLIGHT">Máy bay (FLIGHT)</option>
                      <option value="BUS">Xe khách (BUS)</option>
                      <option value="TRAIN">Tàu hỏa (TRAIN)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Giá trị đơn hàng (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={testData.orderValue}
                    onChange={(e) => setTestData({ ...testData, orderValue: e.target.value })}
                  />
                </div>

                {testResult && (
                  <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mb-0`}>
                    <div className="fw-bold">{testResult.message}</div>
                    {testResult.success && (
                      <div className="small mt-1">
                        • Giảm thực tế: <b>-{formatVND(testResult.data.discountAmount)}</b> <br />
                        • Khách thanh toán: <b>{formatVND(testResult.data.finalPrice)}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-primary" onClick={() => handleRunTest(false)}>
                  Kiểm tra điều kiện
                </button>
                <button className="btn btn-success" onClick={() => handleRunTest(true)}>
                  Áp dụng & Cộng lượt dùng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}