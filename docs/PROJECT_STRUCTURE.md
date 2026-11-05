# Travel Mini - Cấu trúc dự án

Tài liệu này mô tả ranh giới thư mục và đường đi của dữ liệu. Mục tiêu là
để người mới có thể tìm đúng nơi sửa, và khi debug có thể lần theo request
từ giao diện đến database mà không phải đọc toàn bộ dự án.

## 1. Sơ đồ tổng quát

```text
travel_mini/
├── backend/
│   ├── app.py                 # Điểm khởi động Flask và đăng ký blueprint
│   ├── api/routes/            # HTTP contract: nhận request, trả response
│   ├── domain/models/         # Quy tắc tạo/đọc document nghiệp vụ
│   ├── core/                  # Database, audit, permission và hạ tầng dùng chung
│   └── scripts/               # Seed hoặc thao tác vận hành chạy thủ công
├── frontend-new/
│   └── src/
│       ├── App.jsx            # Router cấp ứng dụng
│       ├── pages/              # Màn hình gắn với URL
│       ├── features/           # Chức năng theo nghiệp vụ, đặc biệt khu vực admin
│       ├── components/         # UI dùng lại
│       ├── shared/             # Service, hook, layout, data và CSS dùng chung
│       └── legacy/             # Mã cũ chưa thuộc runtime React hiện tại
└── docs/                      # Tài liệu kiến trúc và quy ước vận hành
```

## 2. Backend

### `backend/app.py`

Là composition root của backend. File này chỉ nên:

- khởi tạo Flask;
- cấu hình CORS/JWT;
- đăng ký blueprint;
- khai báo health check.

Không đặt logic nghiệp vụ hoặc truy vấn phức tạp vào đây.

### `backend/api/routes/`

Đây là lớp API. Mỗi file nhận input HTTP, kiểm tra điều kiện cơ bản, gọi
logic cần thiết và định dạng JSON response.

```text
api/routes/
├── auth.py                 # Đăng ký, đăng nhập, hồ sơ hiện tại
├── admin.py                # Dashboard và quản trị người dùng
├── admin_places.py         # CRUD địa điểm trong khu vực admin
├── places.py               # API địa điểm công khai
├── bus.py                  # API tìm/đặt xe khách
├── flights.py              # API tìm/đặt máy bay
├── trains.py               # API tìm/đặt tàu hỏa
└── users/                  # Endpoint transport dành cho người dùng
```

Quy tắc: route không nên biết chi tiết giao diện frontend; nó chỉ bảo đảm
API contract và gọi lớp bên dưới.

### `backend/domain/models/`

Chứa document builder và quy tắc dữ liệu của miền nghiệp vụ:

- `user.py`: tạo user document và xác minh mật khẩu;
- `locations.py`: document địa điểm;
- `providers.py`: document nhà cung cấp;
- `routes.py`: document tuyến đường.

Đây chưa phải nơi đặt route HTTP. Khi logic nghiệp vụ tăng, có thể bổ sung
`domain/services/` mà không làm phình `api/routes`.

### `backend/core/`

Chứa hạ tầng dùng chung, không phụ thuộc vào một màn hình cụ thể:

- `database.py`: khởi tạo MongoDB client và database;
- `audit.py`: ghi lịch sử thao tác;
- `security/permissions.py`: JWT guard và kiểm tra quyền;
- `__init__.py`: đánh dấu package Python.

Mọi module nên import database từ `core.database`, không tạo MongoClient mới.

### `backend/scripts/`

Các script seed/demo hoặc thao tác vận hành một lần. Script không được
được import ngược vào API runtime.

## 3. Frontend

### `frontend-new/src/pages/`

Mỗi file là một màn hình hoặc một bước trong luồng đặt vé, ví dụ:

- `pages/bus/`: tìm kiếm, kết quả, chọn ghế, checkout, vé;
- `pages/admin/`: dashboard, user, địa điểm;
- `pages/Flight*`, `pages/Train*`: các luồng tương ứng.

Page được phép dùng `shared/services` và `components`, nhưng không nên
chứa API client dùng lại ở nhiều page.

### `frontend-new/src/features/`

Chứa chức năng hoàn chỉnh theo nghiệp vụ. Hiện tại:

```text
features/admin/
├── content/                 # Quản lý nội dung trang chủ
│   ├── HomeContentManagement.jsx
│   └── home-content-management.css
└── operations/              # Các màn hình vận hành admin
    ├── PaymentRefundManagement.jsx
    ├── PartnerManagement.jsx
    ├── SystemReports.jsx
    └── CustomerSupportManagement.jsx
```

`HomeContentManagement` là nơi quản lý banner, service card và article.
Trạng thái hiển thị hiện vẫn là state phía client; khi nối backend, feature
này nên gọi API content và chỉ hiển thị dữ liệu đã được backend publish.

### `frontend-new/src/components/`

Các UI component dùng lại, gồm header, bảng dữ liệu, layout admin và guard
route. Component không nên tự gọi database; nếu cần dữ liệu thì nhận props
hoặc dùng service.

### `frontend-new/src/shared/`

```text
shared/
├── services/                # API client và hàm gọi backend
├── hooks/                   # React hooks dùng chung
├── layouts/                 # Khung hiển thị cấp ứng dụng
├── data/                    # Dữ liệu tĩnh/chờ thay bằng API
└── styles/                  # CSS nền và CSS theo nhóm màn hình
```

Đây là tầng dùng chung. Không đưa logic chỉ dành cho một nghiệp vụ vào đây.

### `frontend-new/src/legacy/`

Chứa phần promo API viết theo CommonJS/Mongoose cũ. Không có import từ
`App.jsx` hoặc runtime React hiện tại. Giữ riêng để tham khảo hoặc di trú
sang backend sau này; không thêm tính năng mới vào thư mục này.

## 4. Quy tắc phụ thuộc

```text
App.jsx
  -> pages / features
pages / features
  -> components / shared
shared
  -> thư viện bên ngoài
backend api
  -> core / domain
core
  -> thư viện hạ tầng
domain
  -> không phụ thuộc frontend
```

Không tạo chiều ngược như `shared -> pages`, `domain -> api` hoặc import
component của feature này vào feature khác nếu chưa xác định rõ contract.

## 5. Cách debug theo một request

1. Tìm URL trong `frontend-new/src/App.jsx`.
2. Mở page/feature tương ứng và xác định service được gọi.
3. Tìm endpoint tương ứng trong `backend/api/routes/`.
4. Kiểm tra guard tại `backend/core/security/permissions.py`.
5. Kiểm tra document/collection trong `backend/domain/models/` và
   `backend/core/database.py`.
6. Với thao tác quản trị, kiểm tra audit tại `backend/core/audit.py`.
7. Gắn cùng một `correlationId` vào log ở các bước khi cần theo dõi xuyên tầng.

## 6. Quy tắc đặt file mới

- Tên thư mục dùng lowercase, số nhiều cho nhóm (`pages`, `services`,
  `models`).
- Tên component React dùng PascalCase.
- Tên service/helper dùng camelCase.
- Không tạo thư mục chung chung mới như `utils`, `misc`, `temp` nếu chưa
  xác định trách nhiệm.
- Mỗi module mới phải cập nhật tài liệu này nếu nó tạo thêm ranh giới
  nghiệp vụ hoặc tầng phụ thuộc.
