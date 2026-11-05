import { useLocation } from "react-router-dom";

const pageInfo = {
  "/admin/places": {
    title: "Quản lý địa điểm",
    description: "Thêm, chỉnh sửa, tìm kiếm và quản lý địa điểm du lịch.",
    icon: "⌖",
  },
  "/admin/categories": {
    title: "Quản lý danh mục",
    description: "Tổ chức và quản lý các danh mục du lịch.",
    icon: "▤",
  },
  "/admin/users": {
    title: "Quản lý người dùng",
    description: "Theo dõi tài khoản và phân quyền người dùng.",
    icon: "♙",
  },
  "/admin/ai": {
    title: "Quản lý AI",
    description: "Khu vực quản lý các tính năng AI của Travel Mini.",
    icon: "✳",
  },
};

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  const page = pageInfo[pathname] || {
    title: "Đang phát triển",
    description: "Nội dung trang sẽ được bổ sung ở bước tiếp theo.",
    icon: "◷",
  };

  return (
    <section className="admin-placeholder admin-panel">
      <span className="admin-placeholder-icon">{page.icon}</span>
      <span className="admin-kicker">TRAVEL MINI / ADMIN</span>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      <span className="admin-coming-soon">Đang xây dựng chức năng</span>
    </section>
  );
}
