import { useState } from "react";
import { ArrowLeft, Armchair, Lock, Check, X } from "lucide-react";

import "./bus-seat-map.css";

const initialSeats = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  code: `A${String(index + 1).padStart(2, "0")}`,
  type: "standard",
  status: index === 2 || index === 9 ? "booked" : "available",
  extraPrice: 0,
}));

const seatStatusLabels = {
  available: "Còn trống",
  booked: "Đã đặt",
  locked: "Đang khóa",
};

const seatTypeLabels = {
  standard: "Ghế thường",
  vip: "Ghế VIP",
};

export default function BusSeatMap() {
  const [seats, setSeats] = useState(initialSeats);
  const [selectedSeatId, setSelectedSeatId] = useState(null);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);

  function updateSelectedSeat(field, value) {
    setSeats((current) =>
      current.map((seat) =>
        seat.id === selectedSeatId ? { ...seat, [field]: value } : seat,
      ),
    );
  }

  function toggleSeatStatus() {
    if (!selectedSeat) return;

    const nextStatus =
      selectedSeat.status === "available"
        ? "locked"
        : selectedSeat.status === "locked"
          ? "available"
          : "booked";

    if (selectedSeat.status === "booked") return;

    updateSelectedSeat("status", nextStatus);
  }

  const availableCount = seats.filter(
    (seat) => seat.status === "available",
  ).length;

  const bookedCount = seats.filter((seat) => seat.status === "booked").length;

  const lockedCount = seats.filter((seat) => seat.status === "locked").length;

  return (
    <div className="admin-page bus-seat-page">
      <div className="admin-page-header">
        <div>
          <h1>Sơ đồ ghế xe khách</h1>
          <p>Thiết lập sơ đồ ghế Limousine 16 chỗ.</p>
        </div>

        <button
          type="button"
          className="seat-back-btn"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={17} />
          Quay lại
        </button>
      </div>

      <div className="seat-summary">
        <div>
          <span> Tổng số ghế</span>
          <strong>{seats.length}</strong>
        </div>

        <div>
          <span>Còn trống</span>
          <strong>{availableCount}</strong>
        </div>

        <div>
          <span>Đã đặt</span>
          <strong>{bookedCount}</strong>
        </div>

        <div>
          <span>Đang khóa</span>
          <strong>{lockedCount}</strong>
        </div>
      </div>

      <div className="seat-management-layout">
        <section className="admin-card seat-map-card">
          <div className="seat-section-heading">
            <div>
              <h2>Sơ đồ Limousine 16 chỗ</h2>
              <p>Chọn một ghế để xem và chỉnh sửa thông tin.</p>
            </div>
          </div>

          <div className="seat-legend">
            <span>
              <i className="seat-dot available" />
              Còn trống
            </span>

            <span>
              <i className="seat-dot booked" />
              Đã đặt
            </span>

            <span>
              <i className="seat-dot locked" />
              Đang khóa
            </span>

            <span>
              <i className="seat-dot selected" />
              Đang chọn
            </span>
          </div>

          <div className="bus-layout">
            <div className="bus-driver-area">
              <span>ĐẦU XE</span>
              <span className="driver-label">Tài xế</span>
            </div>

            <div className="bus-seat-grid">
              {seats.map((seat) => (
                <button
                  type="button"
                  key={seat.id}
                  className={[
                    "bus-seat",
                    seat.status,
                    selectedSeatId === seat.id ? "selected" : "",
                  ].join(" ")}
                  onClick={() => setSelectedSeatId(seat.id)}
                  title={`${seat.code} - ${seatStatusLabels[seat.status]}`}
                >
                  <Armchair size={23} />
                  <strong>{seat.code}</strong>
                  {seat.status === "locked" && <Lock size={12} />}
                  {seat.status === "booked" && <Check size={12} />}
                </button>
              ))}
            </div>

            <div className="bus-layout-footer">
              <span>CUỐI XE</span>
            </div>
          </div>
        </section>

        <aside className="admin-card seat-editor-card">
          <h2>Thông tin ghế</h2>

          {!selectedSeat ? (
            <div className="seat-editor-empty">
              <Armchair size={36} />
              <p>Vui lòng chọn một ghế trên sơ đồ.</p>
            </div>
          ) : (
            <div className="seat-editor-content">
              <div className="selected-seat-heading">
                <div className="selected-seat-icon">
                  <Armchair size={25} />
                </div>

                <div>
                  <strong>{selectedSeat.code}</strong>
                  <span>Ghế số {selectedSeat.id}</span>
                </div>
              </div>

              <label>
                Mã ghế
                <input
                  value={selectedSeat.code}
                  onChange={(event) =>
                    updateSelectedSeat("code", event.target.value)
                  }
                />
              </label>

              <label>
                Loại ghế
                <select
                  value={selectedSeat.type}
                  onChange={(event) =>
                    updateSelectedSeat("type", event.target.value)
                  }
                >
                  <option value="standard">Ghế thường</option>
                  <option value="vip">Ghế VIP</option>
                </select>
              </label>

              <label>
                Trạng thái
                <select
                  value={selectedSeat.status}
                  disabled={selectedSeat.status === "booked"}
                  onChange={(event) =>
                    updateSelectedSeat("status", event.target.value)
                  }
                >
                  <option value="available">Còn trống</option>
                  <option value="locked">Đang khóa</option>
                  <option value="booked">Đã đặt</option>
                </select>
              </label>

              <label>
                Phụ thu (VNĐ)
                <input
                  type="number"
                  min="0"
                  value={selectedSeat.extraPrice}
                  onChange={(event) =>
                    updateSelectedSeat("extraPrice", Number(event.target.value))
                  }
                />
              </label>

              {selectedSeat.status === "booked" && (
                <p className="seat-editor-warning">
                  <Lock size={15} />
                  Ghế đã đặt, không thể thay đổi trạng thái.
                </p>
              )}

              <button
                type="button"
                className="seat-lock-btn"
                disabled={selectedSeat.status === "booked"}
                onClick={toggleSeatStatus}
              >
                {selectedSeat.status === "locked" ? (
                  <>
                    <X size={16} />
                    Mở khóa ghế
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Khóa ghế
                  </>
                )}
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="seat-note">
        <strong>Lưu ý:</strong> Đây là dữ liệu mô phỏng trên frontend. Các thay
        đổi sẽ mất khi tải lại trang.
      </div>
    </div>
  );
}
