import { useState } from "react";
import { Armchair, Check, Lock, Plane } from "lucide-react";

import "./flight-seat-map.css";

const columns = ["A", "B", "C", "D", "E", "F"];

const initialSeats = Array.from({ length: 10 }, (_, rowIndex) =>
  columns.map((column, colIndex) => ({
    id: `${rowIndex + 1}${column}`,
    row: rowIndex + 1,
    column,
    status:
      rowIndex === 1 && (colIndex === 1 || colIndex === 4)
        ? "booked"
        : rowIndex === 4 && colIndex === 2
          ? "locked"
          : "available",
    type: rowIndex < 2 ? "business" : "economy",
    extraPrice: rowIndex < 2 ? 500000 : 0,
  })),
).flat();

const statusLabels = {
  available: "Còn trống",
  booked: "Đã đặt",
  locked: "Đang khóa",
};

export default function FlightSeatMap() {
  const [seats, setSeats] = useState(initialSeats);
  const [selectedSeatId, setSelectedSeatId] = useState(null);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);

  const updateSeat = (field, value) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === selectedSeatId ? { ...seat, [field]: value } : seat,
      ),
    );
  };

  const toggleSeatStatus = (seat) => {
    if (seat.status === "booked") return;

    const nextStatus = seat.status === "available" ? "locked" : "available";

    setSeats((prev) =>
      prev.map((item) =>
        item.id === seat.id ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  const availableCount = seats.filter(
    (seat) => seat.status === "available",
  ).length;

  const bookedCount = seats.filter((seat) => seat.status === "booked").length;

  const lockedCount = seats.filter((seat) => seat.status === "locked").length;

  return (
    <div className="admin-page bus-seat-page flight-seat-page">
      <div className="seat-page-header">
        <div>
          <h2>
            <Plane size={22} /> Sơ đồ ghế máy bay
          </h2>
          <p>Quản lý trạng thái và loại ghế trên chuyến bay</p>
        </div>
      </div>

      <div className="seat-statistics">
        <div>
          <span>Ghế trống</span>
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
        <div>
          <span>Tổng ghế</span>
          <strong>{seats.length}</strong>
        </div>
      </div>

      <div className="seat-management-layout">
        <div className="seat-map-panel">
          <div className="aircraft-label">
            <Plane size={18} />
            <span>ĐẦU MÁY BAY</span>
          </div>

          <div className="aircraft-cabin">
            <div className="aircraft-columns">
              {columns.map((column, index) => (
                <span key={column}>
                  {column}
                  {index === 2 ? "   " : ""}
                </span>
              ))}
            </div>

            <div className="aircraft-seats">
              {Array.from({ length: 10 }, (_, rowIndex) => (
                <div className="aircraft-row" key={rowIndex}>
                  <span className="seat-row-number">{rowIndex + 1}</span>

                  {columns.map((column, colIndex) => {
                    const seat = seats.find(
                      (item) => item.id === `${rowIndex + 1}${column}`,
                    );

                    return (
                      <div
                        key={seat.id}
                        className={
                          colIndex === 3
                            ? "aircraft-seat aisle-gap"
                            : "aircraft-seat"
                        }
                      >
                        <button
                          type="button"
                          className={[
                            "seat-item",
                            `seat-${seat.status}`,
                            seat.type === "business"
                              ? "seat-business"
                              : "seat-economy",
                            selectedSeatId === seat.id ? "seat-selected" : "",
                          ].join(" ")}
                          onClick={() => {
                            if (seat.status === "available") {
                              setSelectedSeatId(seat.id);
                            } else {
                              setSelectedSeatId(seat.id);
                            }
                          }}
                          title={`${seat.id} - ${statusLabels[seat.status]}`}
                        >
                          <Armchair size={18} />
                          <small>{seat.id}</small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="seat-legend">
            <span>
              <i className="legend-available" /> Còn trống
            </span>
            <span>
              <i className="legend-booked" /> Đã đặt
            </span>
            <span>
              <i className="legend-locked" /> Đang khóa
            </span>
            <span>
              <i className="legend-selected" /> Đang chọn
            </span>
          </div>
        </div>

        <div className="seat-editor-panel">
          <h3>Thông tin ghế</h3>

          {!selectedSeat ? (
            <p>Chọn một ghế trên sơ đồ để xem thông tin.</p>
          ) : (
            <>
              <div className="selected-seat-title">
                <Armchair size={24} />
                <strong>Ghế {selectedSeat.id}</strong>
              </div>

              <div className="seat-editor-field">
                <label>Trạng thái</label>
                <strong>{statusLabels[selectedSeat.status]}</strong>
              </div>

              <div className="seat-editor-field">
                <label>Loại ghế</label>
                <select
                  value={selectedSeat.type}
                  onChange={(e) => updateSeat("type", e.target.value)}
                >
                  <option value="business">Thương gia</option>
                  <option value="economy">Phổ thông</option>
                </select>
              </div>

              <div className="seat-editor-field">
                <label>Phụ thu (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={selectedSeat.extraPrice}
                  onChange={(e) =>
                    updateSeat(
                      "extraPrice",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                />
              </div>

              <div className="seat-editor-actions">
                {selectedSeat.status === "booked" ? (
                  <p>
                    <Lock size={15} /> Ghế đã đặt, không thể khóa/mở.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleSeatStatus(selectedSeat)}
                  >
                    {selectedSeat.status === "available" ? (
                      <>
                        <Lock size={16} /> Khóa ghế
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Mở khóa ghế
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
