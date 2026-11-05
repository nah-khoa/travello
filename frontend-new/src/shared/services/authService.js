import {
  apiRequest,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
} from "./api";

// Đăng nhập
export async function login(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!data.access_token || !data.user) {
    throw new Error("Dữ liệu đăng nhập từ máy chủ không hợp lệ.");
  }

  // Chỉ lưu token sau khi đăng nhập thành công
  setAccessToken(data.access_token);

  // Lưu thông tin người dùng để frontend sử dụng
  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

// Kiểm tra có token đăng nhập hay không
export function isAuthenticated() {
  return Boolean(getAccessToken());
}

// Lấy thông tin người dùng hiện tại
export async function getCurrentUser() {
  const data = await apiRequest("/api/auth/me");

  if (!data.user) {
    throw new Error("Không lấy được thông tin người dùng.");
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

// Cập nhật thông tin cá nhân
export async function updateCurrentUser(name, phone) {
  const data = await apiRequest("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify({
      name,
      phone,
    }),
  });

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data.user;
}

// Đăng xuất
export async function logout() {
  try {
    if (getAccessToken()) {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    }
  } finally {
    clearAccessToken();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}
