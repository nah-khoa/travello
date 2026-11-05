import { useCallback, useEffect, useState } from "react";
import {
  getAdminUsers,
  lockAdminUser,
  unlockAdminUser,
} from "../../shared/services/adminService";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        role,
        status,
      });

      if (!result?.success || !result?.data) {
        throw new Error("Dữ liệu người dùng trả về không hợp lệ.");
      }

      setUsers(result.data.users ?? []);
      setPagination((current) => ({
        ...current,
        ...result.data.pagination,
      }));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, role, status]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearch(event) {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  }

  function handleRoleChange(event) {
    setRole(event.target.value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  async function handleLock(user) {
    const reason = window.prompt(`Nhập lý do khóa tài khoản ${user.name}:`);

    if (reason === null) return;

    if (!reason.trim()) {
      window.alert("Lý do khóa không được để trống.");
      return;
    }

    if (!window.confirm(`Bạn chắc chắn muốn khóa tài khoản ${user.email}?`)) {
      return;
    }

    setActionId(user.id);
    setError("");

    try {
      await lockAdminUser(user.id, reason.trim());
      await loadUsers();
      window.alert("Đã khóa tài khoản.");
    } catch (err) {
      setError(err.message || "Không thể khóa tài khoản.");
    } finally {
      setActionId("");
    }
  }

  async function handleUnlock(user) {
    if (!window.confirm(`Bạn chắc chắn muốn mở khóa ${user.email}?`)) {
      return;
    }

    setActionId(user.id);
    setError("");

    try {
      await unlockAdminUser(user.id);
      await loadUsers();
      window.alert("Đã mở khóa tài khoản.");
    } catch (err) {
      setError(err.message || "Không thể mở khóa tài khoản.");
    } finally {
      setActionId("");
    }
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("vi-VN");
  }

  function changePage(nextPage) {
    setPagination((current) => ({
      ...current,
      page: nextPage,
    }));
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-heading">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản và trạng thái hoạt động của người dùng.</p>
        </div>

        <button
          type="button"
          className="admin-users-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          Làm mới
        </button>
      </div>

      <div className="admin-users-summary">
        <div className="admin-users-summary-card">
          <span>Tổng tài khoản</span>
          <strong>{pagination.total}</strong>
        </div>
        <div className="admin-users-summary-card">
          <span>Trang hiện tại</span>
          <strong>
            {pagination.page} / {pagination.total_pages || 1}
          </strong>
        </div>
      </div>

      <form className="admin-users-filters" onSubmit={handleSearch}>
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          aria-label="Tìm người dùng"
        />

        <select
          value={role}
          onChange={handleRoleChange}
          aria-label="Lọc theo vai trò"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">Customer</option>
        </select>

        <select
          value={status}
          onChange={handleStatusChange}
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>

        <button type="submit" className="admin-users-primary">
          Tìm kiếm
        </button>
      </form>

      {error && (
        <div className="admin-users-error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-users-table-card">
        <div className="admin-users-table-scroll">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="admin-users-message">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-users-message">
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-users-name">
                        <span className="admin-users-avatar">
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </span>
                        <strong>{user.name || "Chưa có tên"}</strong>
                      </div>
                    </td>

                    <td>{user.email}</td>
                    <td>{user.phone || "—"}</td>

                    <td>
                      <span
                        className={`admin-users-role ${
                          user.role === "ADMIN" ? "is-admin" : ""
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-users-status ${
                          user.status === "locked" ? "is-locked" : "is-active"
                        }`}
                      >
                        {user.status === "locked"
                          ? "Đã khóa"
                          : "Đang hoạt động"}
                      </span>
                    </td>

                    <td>{formatDate(user.created_at)}</td>

                    <td>
                      {user.role !== "CUSTOMER" ? (
                        <span className="admin-users-no-action">
                          Không áp dụng
                        </span>
                      ) : user.status === "locked" ? (
                        <button
                          type="button"
                          className="admin-users-action unlock"
                          disabled={actionId === user.id}
                          onClick={() => handleUnlock(user)}
                        >
                          {actionId === user.id ? "Đang xử lý..." : "Mở khóa"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-users-action lock"
                          disabled={actionId === user.id}
                          onClick={() => handleLock(user)}
                        >
                          {actionId === user.id ? "Đang xử lý..." : "Khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-users-pagination">
          <span>Tổng {pagination.total} tài khoản</span>

          <div className="admin-users-page-buttons">
            <button
              type="button"
              disabled={loading || pagination.page <= 1}
              onClick={() => changePage(pagination.page - 1)}
            >
              Trước
            </button>

            <span>
              Trang {pagination.page} / {pagination.total_pages || 1}
            </span>

            <button
              type="button"
              disabled={
                loading || pagination.page >= (pagination.total_pages || 1)
              }
              onClick={() => changePage(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
