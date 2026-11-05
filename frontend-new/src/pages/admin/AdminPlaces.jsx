import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminPlaces.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

const EMPTY_FORM = {
  code: "",
  name: "",
  city: "",
  type: "PLACE",
  transport: "BUS",
  aliases: "",
  latitude: "",
  longitude: "",
  status: "draft",
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Yêu cầu thất bại (${response.status}).`);
  }

  return result;
}

function locationToForm(place) {
  return {
    code: place.code || "",
    name: place.name || "",
    city: place.city || "",
    type: place.type || "PLACE",
    transport: place.transport || "BUS",
    aliases: (place.aliases || []).join(", "),
    latitude: place.latitude ?? "",
    longitude: place.longitude ?? "",
    status: place.status || "draft",
  };
}

function formToPayload(form) {
  const payload = {
    name: form.name.trim(),
    city: form.city.trim(),
    type: form.type,
    transport: form.transport,
    aliases: form.aliases
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: form.status,
  };

  if (form.latitude !== "") {
    payload.latitude = Number(form.latitude);
  } else {
    payload.latitude = null;
  }

  if (form.longitude !== "") {
    payload.longitude = Number(form.longitude);
  } else {
    payload.longitude = null;
  }

  if (!form.code.trim()) {
    throw new Error("Mã địa điểm không được để trống.");
  }

  if (!payload.name || !payload.city) {
    throw new Error("Tên địa điểm và tỉnh/thành phố là bắt buộc.");
  }

  if (
    (payload.latitude !== null && !Number.isFinite(payload.latitude)) ||
    (payload.longitude !== null && !Number.isFinite(payload.longitude))
  ) {
    throw new Error("Vĩ độ và kinh độ phải là số hợp lệ.");
  }

  return payload;
}

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (keyword.trim()) {
        params.set("search", keyword.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const result = await apiRequest(`/api/places?${params.toString()}`);

      setPlaces(result.data?.locations || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách địa điểm.");
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const filteredPlaces = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return places.filter((place) => {
      const matchesKeyword =
        (place.name || "").toLowerCase().includes(normalizedKeyword) ||
        (place.city || "").toLowerCase().includes(normalizedKeyword) ||
        (place.code || "").toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === "all" || (place.status || "draft") === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [places, keyword, statusFilter]);

  const publishedCount = places.filter(
    (place) => place.status === "published",
  ).length;

  const draftCount = places.length - publishedCount;

  function openCreateForm() {
    setEditingCode(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function openEditForm(place) {
    setEditingCode(place.code);
    setForm(locationToForm(place));
    setError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCode(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSavePlace(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = formToPayload(form);

      if (editingCode) {
        // Cập nhật địa điểm đã tồn tại
        await apiRequest(`/api/places/${encodeURIComponent(editingCode)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setSuccessMessage("Cập nhật địa điểm thành công.");
      } else {
        // Tạo địa điểm mới
        payload.code = form.code.trim();

        await apiRequest("/api/places", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccessMessage("Thêm địa điểm thành công.");
      }

      closeForm();
      await loadPlaces();
    } catch (err) {
      setError(err.message || "Không thể lưu địa điểm.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(place) {
    const currentStatus = place.status || "draft";
    const nextStatus = currentStatus === "published" ? "draft" : "published";

    const confirmed = window.confirm(
      nextStatus === "published"
        ? `Xuất bản địa điểm "${place.name}"?`
        : `Chuyển "${place.name}" về bản nháp?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/api/places/${encodeURIComponent(place.code)}`, {
        method: "PUT",
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      setSuccessMessage(
        nextStatus === "published"
          ? "Xuất bản địa điểm thành công."
          : "Đã chuyển địa điểm về bản nháp.",
      );

      await loadPlaces();
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái.");
    }
  }

  async function handleDeletePlace(place) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa địa điểm "${place.name}" không? Thao tác này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/api/places/${encodeURIComponent(place.code)}`, {
        method: "DELETE",
      });

      setSuccessMessage("Xóa địa điểm thành công.");
      await loadPlaces();
    } catch (err) {
      setError(err.message || "Không thể xóa địa điểm.");
    }
  }

  return (
    <section className="places-page">
      <div className="places-heading">
        <div>
          <span className="admin-kicker">TRAVEL MINI / ADMIN</span>
          <h1>Quản lý địa điểm</h1>
          <p>Quản lý thông tin và trạng thái các địa điểm du lịch.</p>
        </div>

        <button
          type="button"
          className="places-primary-button"
          onClick={showForm ? closeForm : openCreateForm}
        >
          {showForm ? "Đóng biểu mẫu" : "+ Thêm địa điểm"}
        </button>
      </div>

      <div className="places-stats">
        <div className="places-stat-card">
          <span>Tổng địa điểm</span>
          <strong>{places.length}</strong>
        </div>

        <div className="places-stat-card">
          <span>Đã xuất bản</span>
          <strong>{publishedCount}</strong>
        </div>

        <div className="places-stat-card">
          <span>Bản nháp</span>
          <strong>{draftCount}</strong>
        </div>
      </div>

      {error && (
        <div className="places-message places-message-error" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="places-message places-message-success" role="status">
          {successMessage}
        </div>
      )}

      {showForm && (
        <form className="places-form" onSubmit={handleSavePlace}>
          <h2>{editingCode ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}</h2>

          <div className="places-form-fields">
            <label>
              Mã địa điểm
              <input
                name="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="Ví dụ: DALAT-001"
                disabled={Boolean(editingCode)}
                required
              />
            </label>

            <label>
              Tên địa điểm
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Ví dụ: Bến xe Đà Lạt"
                required
              />
            </label>

            <label>
              Tỉnh / thành phố
              <input
                name="city"
                value={form.city}
                onChange={handleFormChange}
                placeholder="Ví dụ: Đà Lạt"
                required
              />
            </label>

            <label>
              Loại địa điểm
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                required
              >
                <option value="PLACE">Địa điểm tham quan</option>
                <option value="BUS_STATION">Bến xe</option>
              </select>
            </label>

            <label>
              Phương tiện
              <select
                name="transport"
                value={form.transport}
                onChange={handleFormChange}
                required
              >
                <option value="BUS">Xe buýt</option>
                <option value="FLIGHT">Máy bay</option>
                <option value="TRAIN">Tàu hỏa</option>
                <option value="ALL">Tất cả</option>
              </select>
            </label>

            <label>
              Trạng thái
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </label>

            <label>
              Vĩ độ (latitude)
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleFormChange}
                placeholder="Ví dụ: 11.9404"
                step="any"
              />
            </label>

            <label>
              Kinh độ (longitude)
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleFormChange}
                placeholder="Ví dụ: 108.4583"
                step="any"
              />
            </label>

            <label className="places-full-width">
              Tên gọi khác
              <input
                name="aliases"
                value={form.aliases}
                onChange={handleFormChange}
                placeholder="Phân cách bằng dấu phẩy"
              />
            </label>
          </div>

          <p className="places-form-note">
            Dữ liệu được lưu trực tiếp vào MongoDB collection locations.
          </p>

          <div className="places-actions">
            <button
              className="places-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : editingCode
                  ? "Lưu thay đổi"
                  : "Thêm địa điểm"}
            </button>

            <button
              className="places-text-button"
              type="button"
              onClick={closeForm}
              disabled={saving}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="places-toolbar">
        <input
          className="places-search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên, mã hoặc tỉnh thành..."
          aria-label="Tìm kiếm địa điểm"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Lọc trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      <div className="places-table-wrapper">
        <table className="places-table">
          <thead>
            <tr>
              <th>Địa điểm</th>
              <th>Tỉnh / thành</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="places-empty">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredPlaces.length === 0 ? (
              <tr>
                <td colSpan={5} className="places-empty">
                  Không tìm thấy địa điểm phù hợp.
                </td>
              </tr>
            ) : (
              filteredPlaces.map((place) => {
                const status = place.status || "draft";

                return (
                  <tr key={place.code}>
                    <td>
                      <strong>{place.name}</strong>
                      <span className="places-address">Mã: {place.code}</span>
                    </td>

                    <td>{place.city}</td>

                    <td>
                      {place.type === "BUS_STATION"
                        ? "Bến xe"
                        : place.type || "Chưa phân loại"}
                    </td>

                    <td>
                      <span className={`places-status places-status-${status}`}>
                        {status === "published" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>

                    <td>
                      <div className="places-actions">
                        <button
                          type="button"
                          className="places-text-button"
                          onClick={() => openEditForm(place)}
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="places-text-button"
                          onClick={() => handleToggleStatus(place)}
                        >
                          {status === "published" ? "Ẩn" : "Xuất bản"}
                        </button>

                        <button
                          type="button"
                          className="places-delete-button"
                          onClick={() => handleDeletePlace(place)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="places-demo-note">
        DỮ LIỆU THẬT — Các thao tác được thực hiện qua Flask API và lưu vào
        MongoDB collection locations.
      </p>
    </section>
  );
}
