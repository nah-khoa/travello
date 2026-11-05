import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BusFront,
  Plane,
  Search,
  Plus,
  MapPin,
  CalendarDays,
  Clock3,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import BusSeatMap from "../../pages/admin/bookings/components/BusSeatMap";
import FlightSeatMap from "../../pages/admin/bookings/components/FlightSeatMap";
import TrainSeatMap from "../../pages/admin/bookings/components/TrainSeatMap";
import {
  loadTransportTrips,
  saveTransportTrips,
} from "../../shared/services/adminTransportData";
import { api } from "../../shared/services/api";

const transportLabels = {
  bus: "Quản lý chuyến xe khách",
  flight: "Quản lý chuyến bay",
  train: "Quản lý chuyến tàu hỏa",
};

// Kept as a local reference for backwards-compatible seed data.
// eslint-disable-next-line no-unused-vars
const initialTrips = [
  {
    id: 101,
    code: "VN001",
    operator: "Vietnam Airlines",
    departure: "TP. Hồ Chí Minh",
    destination: "Hà Nội",
    departureTime: "2026-11-05T07:00",
    arrivalTime: "2026-11-05T09:10",
    price: 1850000,
    seats: 60,
    vehicleType: "Airbus A321",
    status: "active",
  },
  {
    id: 102,
    code: "VJ002",
    operator: "VietJet Air",
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Nẵng",
    departureTime: "2026-11-05T10:30",
    arrivalTime: "2026-11-05T11:50",
    price: 1200000,
    seats: 60,
    vehicleType: "Airbus A321",
    status: "active",
  },
  {
    id: 103,
    code: "VN003",
    operator: "Vietnam Airlines",
    departure: "Hà Nội",
    destination: "Phú Quốc",
    departureTime: "2026-11-06T08:00",
    arrivalTime: "2026-11-06T10:15",
    price: 2100000,
    seats: 60,
    vehicleType: "Boeing 787",
    status: "inactive",
  },
  {
    id: 1,
    code: "BUS001",
    operator: "Phương Trang",
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Lạt",
    departureTime: "2026-11-05T07:00",
    arrivalTime: "2026-11-05T13:00",
    price: 250000,
    seats: 40,
    status: "active",
  },
  {
    id: 2,
    code: "BUS002",
    operator: "Thành Bưởi",
    departure: "TP. Hồ Chí Minh",
    destination: "Cần Thơ",
    departureTime: "2026-11-05T08:30",
    arrivalTime: "2026-11-05T12:00",
    price: 180000,
    seats: 36,
    status: "active",
  },
  {
    id: 3,
    code: "BUS003",
    operator: "FUTA Bus Lines",
    departure: "Đà Nẵng",
    destination: "Huế",
    departureTime: "2026-11-06T09:00",
    arrivalTime: "2026-11-06T12:00",
    price: 150000,
    seats: 34,
    status: "inactive",
  },
];

// eslint-disable-next-line no-unused-vars
const initialFlightTrips = [
  {
    id: 101,
    code: "VN001",
    operator: "Vietnam Airlines",
    departure: "TP. Hồ Chí Minh",
    destination: "Hà Nội",
    departureTime: "2026-11-05T07:00",
    arrivalTime: "2026-11-05T09:10",
    price: 1850000,
    seats: 60,
    vehicleType: "Airbus A321",
    status: "active",
  },
  {
    id: 102,
    code: "VJ002",
    operator: "VietJet Air",
    departure: "TP. Hồ Chí Minh",
    destination: "Đà Nẵng",
    departureTime: "2026-11-05T10:30",
    arrivalTime: "2026-11-05T11:50",
    price: 1200000,
    seats: 60,
    vehicleType: "Airbus A321",
    status: "active",
  },
  {
    id: 103,
    code: "VN003",
    operator: "Vietnam Airlines",
    departure: "Hà Nội",
    destination: "Phú Quốc",
    departureTime: "2026-11-06T08:00",
    arrivalTime: "2026-11-06T10:15",
    price: 2100000,
    seats: 60,
    vehicleType: "Boeing 787",
    status: "inactive",
  },
];

// eslint-disable-next-line no-unused-vars
const initialTrainTrips = [
  {
    id: 201,
    code: "SE1",
    operator: "Đường sắt Việt Nam",
    departure: "Hà Nội",
    destination: "TP. Hồ Chí Minh",
    departureTime: "2026-11-05T06:00",
    arrivalTime: "2026-11-06T18:00",
    price: 850000,
    seats: 60,
    vehicleType: "SE - Ghế mềm",
    status: "active",
  },
  {
    id: 202,
    code: "SE3",
    operator: "Đường sắt Việt Nam",
    departure: "Hà Nội",
    destination: "Đà Nẵng",
    departureTime: "2026-11-05T19:20",
    arrivalTime: "2026-11-06T11:00",
    price: 650000,
    seats: 60,
    vehicleType: "SE - Giường nằm",
    status: "active",
  },
];

const emptyForm = {
  code: "",
  operator: "",
  departure: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  seats: "",
  vehicleType: "",
  status: "active",
};

function formatPrice(value) {
  return Number(value).toLocaleString("vi-VN") + " đ";
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminBookings() {
  const { transportType } = useParams();
  const storedTrips = useMemo(() => loadTransportTrips(), []);

  const [selectedTrip, setSelectedTrip] = useState(null);

  const [trips, setTrips] = useState(storedTrips.bus);
  const [flightTrips, setFlightTrips] = useState(storedTrips.flight);
  const [trainTrips, setTrainTrips] = useState(storedTrips.train);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (transportType !== "bus") return;
    let cancelled = false;
    api("/api/bus/admin/trips")
      .then((data) => {
        if (!cancelled) setTrips(data.items || []);
      })
      .catch((error) => {
        if (!cancelled) window.alert(error.message || "Không thể tải danh sách chuyến xe.");
      });
    return () => {
      cancelled = true;
    };
  }, [transportType]);

  useEffect(() => {
    saveTransportTrips({ bus: trips, flight: flightTrips, train: trainTrips });
  }, [trips, flightTrips, trainTrips]);

  const title = transportLabels[transportType] || "Quản lý chuyến đi";

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        [trip.code, trip.operator, trip.departure, trip.destination].some(
          (value) => value.toLowerCase().includes(keyword),
        );

      const matchesStatus =
        statusFilter === "all" || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  function getActiveSetter() {
    if (transportType === "flight") return setFlightTrips;
    if (transportType === "train") return setTrainTrips;
    return setTrips;
  }

  function openCreateForm() {
    setEditingTrip(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEditForm(trip) {
    setEditingTrip(trip);
    setForm({
      ...trip,
      price: String(trip.price),
      seats: String(trip.seats),
      vehicleType: trip.vehicleType || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTrip(null);
    setForm({ ...emptyForm });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const tripData = {
      ...form,
      code: form.code.trim(),
      operator: form.operator.trim(),
      departure: form.departure.trim(),
      destination: form.destination.trim(),
      price: Number(form.price),
      seats: Number(form.seats),
      vehicleType: form.vehicleType.trim(),
    };

    if (transportType === "bus") {
      try {
        const response = await api(
          editingTrip
            ? `/api/bus/admin/trips/${encodeURIComponent(editingTrip.id)}`
            : "/api/bus/admin/trips",
          {
            method: editingTrip ? "PATCH" : "POST",
            body: JSON.stringify(tripData),
          },
        );
        const savedTrip = response.item;
        setTrips((current) =>
          editingTrip
            ? current.map((trip) => (trip.id === savedTrip.id ? savedTrip : trip))
            : [savedTrip, ...current],
        );
        closeForm();
      } catch (error) {
        window.alert(error.message || "Không thể lưu chuyến xe.");
      }
      return;
    }

    const updateTrips = getActiveSetter();

    if (editingTrip) {
      updateTrips((current) =>
        current.map((trip) =>
          trip.id === editingTrip.id ? { ...trip, ...tripData } : trip,
        ),
      );
    } else {
      updateTrips((current) => [
        {
          ...tripData,
          id: Date.now(),
        },
        ...current,
      ]);
    }

    closeForm();
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa chuyến đi này?",
    );

    if (!confirmed) return;

    if (transportType === "bus") {
      try {
        await api(`/api/bus/admin/trips/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        setTrips((current) => current.filter((trip) => trip.id !== id));
      } catch (error) {
        window.alert(error.message || "Không thể xóa chuyến xe.");
      }
      return;
    }

    getActiveSetter()((current) => current.filter((trip) => trip.id !== id));
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function renderTripForm() {
    if (!showForm) return null;

    const noun =
      transportType === "flight"
        ? "chuyến bay"
        : transportType === "train"
          ? "chuyến tàu"
          : "chuyến xe";

    const operatorLabel =
      transportType === "flight"
        ? "Hãng hàng không"
        : transportType === "train"
          ? "Đơn vị khai thác"
          : "Nhà xe";

    const seatLabel = transportType === "train" ? "Tổng số chỗ" : "Số ghế";
    const codeLabel =
      transportType === "flight" ? "Số hiệu chuyến bay" : transportType === "train" ? "Mã tàu" : "Mã chuyến";
    const locationLabel =
      transportType === "flight" ? "Sân bay khởi hành" : transportType === "train" ? "Ga khởi hành" : "Điểm khởi hành";
    const destinationLabel =
      transportType === "flight" ? "Sân bay đến" : transportType === "train" ? "Ga đến" : "Điểm đến";

    return (
      <div className="booking-modal-overlay">
        <div className="booking-modal">
          <div className="booking-modal-header">
            <div>
              <h2>
                {editingTrip ? "Chỉnh sửa " : "Thêm "}
                {noun}
              </h2>
              <p>Nhập thông tin cơ bản của {noun}.</p>
            </div>

            <button type="button" onClick={closeForm} title="Đóng">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="booking-form-grid">
              <label>
                {codeLabel}
                <input
                  name="code"
                  value={form.code}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                {operatorLabel}
                <input
                  name="operator"
                  value={form.operator}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                {locationLabel}
                <input
                  name="departure"
                  value={form.departure}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                {destinationLabel}
                <input
                  name="destination"
                  value={form.destination}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Thời gian khởi hành
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={form.departureTime}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Thời gian đến
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={form.arrivalTime}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Giá vé (VNĐ)
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                {seatLabel}
                <input
                  type="number"
                  name="seats"
                  min="1"
                  value={form.seats}
                  onChange={updateField}
                  required
                />
              </label>

              {transportType === "bus" ? (
                <label>
                  Loại xe
                  <input
                    name="vehicleType"
                    value={form.vehicleType || ""}
                    onChange={updateField}
                    placeholder="Ví dụ: Giường nằm 40 chỗ"
                  />
                </label>
              ) : (
                <label>
                  {transportType === "flight" ? "Loại máy bay" : "Loại tàu"}
                  <select
                    name="vehicleType"
                    value={form.vehicleType || ""}
                    onChange={updateField}
                    required
                  >
                    <option value="" disabled>
                      Chọn {transportType === "flight" ? "loại máy bay" : "loại tàu"}
                    </option>
                    {transportType === "flight" ? (
                      <>
                        <option value="Airbus A321">Airbus A321</option>
                        <option value="Airbus A350">Airbus A350</option>
                        <option value="Boeing 787">Boeing 787</option>
                      </>
                    ) : (
                      <>
                        <option value="SE - Ghế mềm">SE - Ghế mềm</option>
                        <option value="SE - Giường nằm">SE - Giường nằm</option>
                        <option value="Tàu cao tốc">Tàu cao tốc</option>
                      </>
                    )}
                  </select>
                </label>
              )}

              <label>
                Trạng thái
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </label>
            </div>

            <div className="booking-modal-actions">
              <button
                type="button"
                className="booking-cancel-btn"
                onClick={closeForm}
              >
                Hủy
              </button>

              <button type="submit" className="booking-primary-btn">
                {editingTrip ? "Lưu thay đổi" : "Tạo " + noun}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (transportType === "flight") {
    return (
      <div className="admin-page booking-page">
        <div className="admin-page-header booking-header">
          <div>
            <h1>Quản lý chuyến bay</h1>
            <p>Quản lý lịch trình, giá vé và sơ đồ ghế máy bay.</p>
          </div>

          <button
            type="button"
            className="booking-primary-btn"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Thêm chuyến bay
          </button>
        </div>

        <div className="booking-summary">
          <div className="booking-summary-card">
            <span>Tổng chuyến bay</span>
            <strong>{flightTrips.length}</strong>
          </div>

          <div className="booking-summary-card">
            <span>Đang hoạt động</span>
            <strong>
              {flightTrips.filter((trip) => trip.status === "active").length}
            </strong>
          </div>

          <div className="booking-summary-card">
            <span>Ngừng hoạt động</span>
            <strong>
              {flightTrips.filter((trip) => trip.status === "inactive").length}
            </strong>
          </div>
        </div>

        <div className="admin-card booking-table-card">
          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Mã chuyến / Hãng bay</th>
                  <th>Tuyến bay</th>
                  <th>Khởi hành</th>
                  <th>Giá vé</th>
                  <th>Số ghế</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {flightTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <strong>{trip.code}</strong>
                      <span className="booking-sub-text">{trip.operator}</span>
                    </td>

                    <td>
                      <div className="booking-route">
                        <span>
                          <MapPin size={14} />
                          {trip.departure}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {trip.destination}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="booking-time">
                        <CalendarDays size={15} />
                        {formatDate(trip.departureTime)}
                      </div>
                      <span className="booking-sub-text">
                        <Clock3 size={13} />
                        Đến: {formatDate(trip.arrivalTime)}
                      </span>
                    </td>

                    <td>
                      <strong>{formatPrice(trip.price)}</strong>
                    </td>

                    <td>{trip.seats}</td>

                    <td>
                      <span
                        className={`booking-status ${
                          trip.status === "active" ? "is-active" : "is-inactive"
                        }`}
                      >
                        {trip.status === "active"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>

                    <td>
                      <div className="booking-actions">
                        <button
                          type="button"
                          title="Sơ đồ ghế máy bay"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <Plane size={16} />
                        </button>
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => openEditForm(trip)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          className="booking-delete-btn"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {flightTrips.length === 0 && (
                  <tr>
                    <td colSpan="7" className="booking-empty">
                      Chưa có chuyến bay nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTrip && (
          <div className="booking-seat-overlay">
            <div className="booking-seat-content">
              <div className="booking-seat-heading">
                <div>
                  <h2>Sơ đồ ghế máy bay - {selectedTrip.code}</h2>
                  <p>
                    {selectedTrip.departure} → {selectedTrip.destination}
                  </p>
                </div>

                <button type="button" onClick={() => setSelectedTrip(null)}>
                  <X size={20} />
                </button>
              </div>

              <FlightSeatMap />
            </div>
          </div>
        )}
        {renderTripForm()}
      </div>
    );
  }

  if (transportType === "train") {
    return (
      <div className="admin-page booking-page">
        <div className="admin-page-header booking-header">
          <div>
            <h1>Quản lý chuyến tàu hỏa</h1>
            <p>Quản lý lịch trình, giá vé và sơ đồ chỗ trên tàu.</p>
          </div>

          <button
            type="button"
            className="booking-primary-btn"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Thêm chuyến tàu
          </button>
        </div>

        <div className="booking-summary">
          <div className="booking-summary-card">
            <span>Tổng chuyến tàu</span>
            <strong>{trainTrips.length}</strong>
          </div>
          <div className="booking-summary-card">
            <span>Đang hoạt động</span>
            <strong>
              {trainTrips.filter((trip) => trip.status === "active").length}
            </strong>
          </div>
          <div className="booking-summary-card">
            <span>Ngừng hoạt động</span>
            <strong>
              {trainTrips.filter((trip) => trip.status === "inactive").length}
            </strong>
          </div>
        </div>

        <div className="admin-card booking-table-card">
          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Mã chuyến / Đơn vị</th>
                  <th>Tuyến đường</th>
                  <th>Khởi hành</th>
                  <th>Giá vé</th>
                  <th>Số chỗ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {trainTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <strong>{trip.code}</strong>
                      <span className="booking-sub-text">{trip.operator}</span>
                    </td>
                    <td>
                      <div className="booking-route">
                        <span>
                          <MapPin size={14} />
                          {trip.departure}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {trip.destination}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="booking-time">
                        <CalendarDays size={15} />
                        {formatDate(trip.departureTime)}
                      </div>
                      <span className="booking-sub-text">
                        <Clock3 size={13} />
                        Đến: {formatDate(trip.arrivalTime)}
                      </span>
                    </td>
                    <td>
                      <strong>{formatPrice(trip.price)}</strong>
                    </td>
                    <td>{trip.seats}</td>
                    <td>
                      <span
                        className={`booking-status ${trip.status === "active" ? "is-active" : "is-inactive"}`}
                      >
                        {trip.status === "active"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="booking-actions">
                        <button
                          type="button"
                          title="Sơ đồ chỗ tàu"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <BusFront size={16} />
                        </button>
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => openEditForm(trip)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          className="booking-delete-btn"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTrip && (
          <div className="booking-seat-overlay">
            <div className="booking-seat-content">
              <div className="booking-seat-heading">
                <div>
                  <h2>Sơ đồ chỗ tàu - {selectedTrip.code}</h2>
                  <p>
                    {selectedTrip.departure} → {selectedTrip.destination}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedTrip(null)}>
                  <X size={20} />
                </button>
              </div>
              <TrainSeatMap />
            </div>
          </div>
        )}
        {renderTripForm()}
      </div>
    );
  }

  if (transportType !== "bus") {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>{title}</h1>
            <p>Chức năng đang được triển khai.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page booking-page">
      <div className="admin-page-header booking-header">
        <div>
          <h1>{title}</h1>
          <p>Quản lý thông tin chuyến xe, tuyến đường và lịch trình.</p>
        </div>

        <button className="booking-primary-btn" onClick={openCreateForm}>
          <Plus size={18} />
          Thêm chuyến xe
        </button>
      </div>

      <div className="booking-summary">
        <div className="booking-summary-card">
          <span>Tổng chuyến xe</span>
          <strong>{trips.length}</strong>
        </div>

        <div className="booking-summary-card">
          <span>Đang hoạt động</span>
          <strong>
            {trips.filter((trip) => trip.status === "active").length}
          </strong>
        </div>

        <div className="booking-summary-card">
          <span>Ngừng hoạt động</span>
          <strong>
            {trips.filter((trip) => trip.status === "inactive").length}
          </strong>
        </div>
      </div>

      <div className="admin-card booking-table-card">
        <div className="booking-toolbar">
          <div className="booking-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm mã chuyến, nhà xe, điểm đi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Mã chuyến / Nhà xe</th>
                <th>Tuyến đường</th>
                <th>Khởi hành</th>
                <th>Giá vé</th>
                <th>Số ghế</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <strong>{trip.code}</strong>
                    <span className="booking-sub-text">{trip.operator}</span>
                  </td>

                  <td>
                    <div className="booking-route">
                      <span>
                        <MapPin size={14} />
                        {trip.departure}
                      </span>
                      <span>
                        <MapPin size={14} />
                        {trip.destination}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="booking-time">
                      <CalendarDays size={15} />
                      {formatDate(trip.departureTime)}
                    </div>
                    <span className="booking-sub-text">
                      <Clock3 size={13} />
                      Đến: {formatDate(trip.arrivalTime)}
                    </span>
                  </td>

                  <td>
                    <strong>{formatPrice(trip.price)}</strong>
                  </td>

                  <td>{trip.seats}</td>

                  <td>
                    <span
                      className={`booking-status ${
                        trip.status === "active" ? "is-active" : "is-inactive"
                      }`}
                    >
                      {trip.status === "active"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </span>
                  </td>

                  <td>
                    <div className="booking-actions">
                      <button
                        title="Sơ đồ ghế"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        <BusFront size={16} />
                      </button>
                      <button
                        title="Chỉnh sửa"
                        onClick={() => openEditForm(trip)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Xóa"
                        className="booking-delete-btn"
                        onClick={() => handleDelete(trip.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="7" className="booking-empty">
                    Không tìm thấy chuyến xe phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderTripForm()}
      {selectedTrip && (
        <div className="booking-seat-overlay">
          <div className="booking-seat-content">
            <div className="booking-seat-heading">
              <div>
                <h2>Sơ đồ ghế - {selectedTrip.code}</h2>
                <p>
                  {selectedTrip.departure} → {selectedTrip.destination}
                </p>
              </div>

              <button type="button" onClick={() => setSelectedTrip(null)}>
                <X size={20} />
              </button>
            </div>

            <BusSeatMap />
          </div>
        </div>
      )}
    </div>
  );
}
