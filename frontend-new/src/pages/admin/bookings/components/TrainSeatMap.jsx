import { useState } from "react";
import { Armchair, BedDouble, Lock, Check, TrainFront } from "lucide-react";

import "./train-seat-map.css";

const initialCarriages = [
  {
    id: "SE1",
    name: "Toa 1 - Ghế mềm",
    type: "seat",
    seats: Array.from({ length: 20 }, (_, i) => ({
      id: `A${String(i + 1).padStart(2, "0")}`,
      status: i === 2 || i === 8 ? "booked" : "available",
      price: 350000,
    })),
  },
  {
    id: "SE2",
    name: "Toa 2 - Giường nằm khoang 6",
    type: "sleeper6",
    seats: Array.from({ length: 24 }, (_, i) => ({
      id: `B${String(i + 1).padStart(2, "0")}`,
      status: i === 4 || i === 13 ? "booked" : "available",
      price: 650000,
    })),
  },
  {
    id: "SE3",
    name: "Toa 3 - Giường nằm khoang 4",
    type: "sleeper4",
    seats: Array.from({ length: 16 }, (_, i) => ({
      id: `C${String(i + 1).padStart(2, "0")}`,
      status: i === 1 ? "booked" : "available",
      price: 850000,
    })),
  },
];

const statusLabels = {
  available: "Còn trống",
  booked: "Đã đặt",
  locked: "Đang khóa",
};

export default function TrainSeatMap() {
  const [carriages, setCarriages] = useState(initialCarriages);
  const [selectedCarriageId, setSelectedCarriageId] = useState("SE1");
  const [selectedSeatId, setSelectedSeatId] = useState(null);

  const selectedCarriage = carriages.find(
    (carriage) => carriage.id === selectedCarriageId,
  );

  const selectedSeat = selectedCarriage?.seats.find(
    (seat) => seat.id === selectedSeatId,
  );

  const allSeats = carriages.flatMap((carriage) => carriage.seats);

  const updateSelectedSeat = (field, value) => {
    setCarriages((current) =>
      current.map((carriage) =>
        carriage.id === selectedCarriageId
          ? {
              ...carriage,
              seats: carriage.seats.map((seat) =>
                seat.id === selectedSeatId ? { ...seat, [field]: value } : seat,
              ),
            }
          : carriage,
      ),
    );
  };

  const toggleSeatStatus = () => {
    if (!selectedSeat || selectedSeat.status === "booked") return;

    const nextStatus =
      selectedSeat.status === "available" ? "locked" : "available";

    updateSelectedSeat("status", nextStatus);
  };

  const availableCount = allSeats.filter(
    (seat) => seat.status === "available",
  ).length;

  const bookedCount = allSeats.filter(
    (seat) => seat.status === "booked",
  ).length;

  const lockedCount = allSeats.filter(
    (seat) => seat.status === "locked",
  ).length;

  const renderSeat = (seat, type) => {
    const isBed = type !== "seat";

    return (
      <button
        key={seat.id}
        type="button"
        className={[
          "train-seat",
          `train-seat-${seat.status}`,
          selectedSeatId === seat.id ? "train-seat-selected" : "",
        ].join(" ")}
        onClick={() => setSelectedSeatId(seat.id)}
        title={`${seat.id} - ${statusLabels[seat.status]}`}
      >
        {isBed ? <BedDouble size={19} /> : <Armchair size={19} />}
        <small>{seat.id}</small>
      </button>
    );
  };

  return (
    <div className="train-seat-page">
      <div className="train-seat-stats">
        <div>
          <span>Ghế/chỗ trống</span>
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
          <span>Tổng chỗ</span>
          <strong>{allSeats.length}</strong>
        </div>
      </div>

      <div className="train-seat-layout">
        <section className="train-carriage-panel">
          <div className="train-section-heading">
            <div>
              <h3>
                <TrainFront size={20} /> Sơ đồ toa tàu
              </h3>
              <p>Chọn toa để xem và quản lý chỗ ngồi</p>
            </div>
          </div>

          <div className="train-carriage-tabs">
            {carriages.map((carriage) => (
              <button
                key={carriage.id}
                type="button"
                className={selectedCarriageId === carriage.id ? "active" : ""}
                onClick={() => {
                  setSelectedCarriageId(carriage.id);
                  setSelectedSeatId(null);
                }}
              >
                {carriage.name}
              </button>
            ))}
          </div>

          {selectedCarriage && (
            <div className="train-carriage">
              <div className="train-carriage-title">
                <TrainFront size={18} />
                <strong>{selectedCarriage.name}</strong>
              </div>

              {selectedCarriage.type === "seat" ? (
                <div className="train-seat-grid">
                  {selectedCarriage.seats.map((seat) =>
                    renderSeat(seat, "seat"),
                  )}
                </div>
              ) : (
                <div className="train-compartment-grid">
                  {Array.from(
                    {
                      length: selectedCarriage.type === "sleeper6" ? 4 : 4,
                    },
                    (_, compartmentIndex) => {
                      const bedsPerCompartment =
                        selectedCarriage.type === "sleeper6" ? 6 : 4;

                      const beds = selectedCarriage.seats.slice(
                        compartmentIndex * bedsPerCompartment,
                        (compartmentIndex + 1) * bedsPerCompartment,
                      );

                      return (
                        <div
                          className="train-compartment"
                          key={compartmentIndex}
                        >
                          <span className="train-compartment-label">
                            Khoang {compartmentIndex + 1}
                          </span>
                          <div className="train-beds">
                            {beds.map((seat) =>
                              renderSeat(seat, selectedCarriage.type),
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          )}

          <div className="train-seat-legend">
            <span>
              <i className="train-legend-available" /> Còn trống
            </span>
            <span>
              <i className="train-legend-booked" /> Đã đặt
            </span>
            <span>
              <i className="train-legend-locked" /> Đang khóa
            </span>
            <span>
              <i className="train-legend-selected" /> Đang chọn
            </span>
          </div>
        </section>

        <aside className="train-seat-editor">
          <h3>Thông tin chỗ</h3>

          {!selectedSeat ? (
            <p>Chọn ghế hoặc giường trên sơ đồ để xem thông tin.</p>
          ) : (
            <>
              <div className="train-selected-seat">
                {selectedCarriage.type === "seat" ? (
                  <Armchair size={24} />
                ) : (
                  <BedDouble size={24} />
                )}
                <strong>{selectedSeat.id}</strong>
              </div>

              <div className="train-editor-field">
                <label>Toa tàu</label>
                <strong>{selectedCarriage.name}</strong>
              </div>

              <div className="train-editor-field">
                <label>Trạng thái</label>
                <strong>{statusLabels[selectedSeat.status]}</strong>
              </div>

              <div className="train-editor-field">
                <label>Giá vé (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={selectedSeat.price}
                  onChange={(event) =>
                    updateSelectedSeat(
                      "price",
                      Math.max(0, Number(event.target.value)),
                    )
                  }
                />
              </div>

              {selectedSeat.status === "booked" ? (
                <p className="train-seat-warning">
                  <Lock size={15} /> Chỗ đã đặt, không thể khóa/mở.
                </p>
              ) : (
                <button
                  type="button"
                  className="train-seat-toggle"
                  onClick={toggleSeatStatus}
                >
                  {selectedSeat.status === "available" ? (
                    <>
                      <Lock size={16} /> Khóa chỗ
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Mở khóa chỗ
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
