const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const ACCESS_TOKEN_KEY = "access_token";

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return result;
}

export const api = apiRequest;

export async function login(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export function getAccessToken() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) return token;

  const legacyToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (legacyToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  return legacyToken;
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Đường dẫn /api đi qua proxy của Vite tới Flask :5000 (cả localhost lẫn ngrok).
export function getSessionId() {
  const key = "travel_mini_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id =
      crypto.randomUUID?.() ??
      `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ---- Định dạng hiển thị ----
const toDate = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d : null;
};

export const formatVND = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export const formatDate = (v) =>
  toDate(v)?.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) ?? "—";

export const formatTime = (v) =>
  toDate(v)?.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }) ?? "--:--";

export const durationText = (minutes = 0) => {
  const total = Math.max(0, Number(minutes) || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h} giờ${m ? ` ${m} phút` : ""}`;
};

// Alias cho API đặt vé xe khách
export const busApi = api;
