const STORAGE_KEY = "travel-mini-admin-transport-trips";
export const PAYMENT_STORAGE_KEY = "travel-mini-admin-payment-data";

const fallbackData = {
  bus: [
    { id: 1, code: "BUS001", operator: "Phương Trang", departure: "TP. Hồ Chí Minh", destination: "Đà Lạt", departureTime: "2026-11-05T07:00", arrivalTime: "2026-11-05T13:00", price: 250000, seats: 40, status: "active" },
    { id: 2, code: "BUS002", operator: "Thành Bưởi", departure: "TP. Hồ Chí Minh", destination: "Cần Thơ", departureTime: "2026-11-05T08:30", arrivalTime: "2026-11-05T12:00", price: 180000, seats: 36, status: "active" },
    { id: 3, code: "BUS003", operator: "FUTA Bus Lines", departure: "Đà Nẵng", destination: "Huế", departureTime: "2026-11-06T09:00", arrivalTime: "2026-11-06T12:00", price: 150000, seats: 34, status: "inactive" },
  ],
  flight: [
    { id: 101, code: "VN001", operator: "Vietnam Airlines", departure: "TP. Hồ Chí Minh", destination: "Hà Nội", departureTime: "2026-11-05T07:00", arrivalTime: "2026-11-05T09:10", price: 1850000, seats: 60, vehicleType: "Airbus A321", status: "active" },
    { id: 102, code: "VJ002", operator: "VietJet Air", departure: "TP. Hồ Chí Minh", destination: "Đà Nẵng", departureTime: "2026-11-05T10:30", arrivalTime: "2026-11-05T11:50", price: 1200000, seats: 60, vehicleType: "Airbus A321", status: "active" },
    { id: 103, code: "VN003", operator: "Vietnam Airlines", departure: "Hà Nội", destination: "Phú Quốc", departureTime: "2026-11-06T08:00", arrivalTime: "2026-11-06T10:15", price: 2100000, seats: 60, vehicleType: "Boeing 787", status: "inactive" },
  ],
  train: [
    { id: 201, code: "SE1", operator: "Đường sắt Việt Nam", departure: "Hà Nội", destination: "TP. Hồ Chí Minh", departureTime: "2026-11-05T06:00", arrivalTime: "2026-11-06T18:00", price: 850000, seats: 60, vehicleType: "SE - Ghế mềm", status: "active" },
    { id: 202, code: "SE3", operator: "Đường sắt Việt Nam", departure: "Hà Nội", destination: "Đà Nẵng", departureTime: "2026-11-05T19:20", arrivalTime: "2026-11-06T11:00", price: 650000, seats: 60, vehicleType: "SE - Giường nằm", status: "active" },
  ],
};

function cloneFallbackData() {
  return JSON.parse(JSON.stringify(fallbackData));
}

export function loadTransportTrips() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneFallbackData();

  try {
    const parsed = JSON.parse(raw);
    return {
      bus: Array.isArray(parsed.bus) ? parsed.bus : [],
      flight: Array.isArray(parsed.flight) ? parsed.flight : [],
      train: Array.isArray(parsed.train) ? parsed.train : [],
    };
  } catch (error) {
    console.error("Không thể đọc dữ liệu chuyến vận tải đã lưu.", error);
    return cloneFallbackData();
  }
}

export function saveTransportTrips(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("admin-transport-data-updated"));
}

export function loadAdminPaymentData(fallback) {
  const raw = window.localStorage.getItem(PAYMENT_STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return {
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : fallback.transactions,
      refunds: Array.isArray(parsed.refunds) ? parsed.refunds : fallback.refunds,
    };
  } catch (error) {
    console.error("Không thể đọc dữ liệu thanh toán đã lưu.", error);
    return fallback;
  }
}

export function saveAdminPaymentData(data) {
  window.localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("admin-payment-data-updated"));
}
