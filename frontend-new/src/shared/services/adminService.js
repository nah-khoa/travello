import { apiRequest } from "./api";

// Lấy danh sách người dùng, hỗ trợ tìm kiếm, lọc và phân trang
export function getAdminUsers({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());
  if (role) params.set("role", role);
  if (status) params.set("status", status);

  return apiRequest(`/api/admin/users?${params.toString()}`);
}

// Khóa tài khoản CUSTOMER
export function lockAdminUser(userId, reason) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

// Mở khóa tài khoản CUSTOMER
export function unlockAdminUser(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/unlock`, {
    method: "PATCH",
  });
}
