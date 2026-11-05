# Travel Mini Frontend

Ứng dụng frontend React + Vite. Chạy các lệnh từ thư mục này:

- `npm run dev`: chạy môi trường phát triển.
- `npm run build`: kiểm tra và tạo bản build.
- `npm run lint`: kiểm tra quy tắc ESLint.

## Cấu trúc mã nguồn

- `src/main.jsx`: điểm khởi chạy React và gắn ứng dụng vào DOM.
- `src/App.jsx`: khai báo router và ánh xạ URL tới trang.
- `src/App.css` và `src/index.css`: kiểu dáng dùng chung ở cấp ứng dụng và thiết lập nền tảng toàn cục.
- `src/page/`: các trang theo route; mỗi trang kết hợp giao diện và điều phối thao tác của trang đó.
- `src/components/`: các thành phần giao diện có thể dùng lại giữa nhiều trang.
- `src/layouts/`: khung bố cục dùng chung cho nhiều trang.
- `src/hooks/`: logic React dùng lại; ví dụ `useCurrentUser.js` quản lý tải, thử tải lại và lưu trạng thái hồ sơ.
- `src/state/`: nơi đặt state dùng chung toàn ứng dụng khi nhiều tính năng cần cùng nguồn dữ liệu; state chỉ phục vụ một tính năng nên ở hook của tính năng đó.
- `src/services/`: giao tiếp backend và nghiệp vụ dùng chung. `api.js` quản lý request/token; `authService.js` gom các thao tác đăng nhập, lấy hồ sơ, cập nhật và đăng xuất.
- `src/css/`: stylesheet; tách theo trang/chức năng để không trộn giao diện vào logic API.
- `src/data/`: dữ liệu tĩnh phục vụ giao diện.
- `src/assets/`: hình ảnh và tài nguyên được import từ mã nguồn.
- `public/`: tài nguyên tĩnh được phục vụ trực tiếp, không cần import.

## Hồ sơ cá nhân: cách hoạt động và cách mở rộng

Phần này giải thích vì sao luồng profile được chia thành các lớp, và chỉ dẫn nơi thêm tính năng mới. Nguyên tắc cốt lõi: **mỗi loại trách nhiệm có một chỗ sở hữu rõ ràng**. Giao diện không tự gọi API, service không render giao diện, và hook giữ trạng thái giữa hai phần đó.

### 1. Những lỗi đã sửa và lý do thiết kế

- **Không lấy được user:** trước đây `profile.jsx` tự viết hook và tự gọi API, trong khi đã có hook/service chung. Cách này tạo hai nguồn logic và khiến trang đọc token khác với trang login. Profile hiện dùng `useCurrentUser`, hook gọi `getCurrentUser`, service gọi API `/api/auth/me`.
- **Token nằm sai storage:** login từng ghi token vào `sessionStorage`, còn request profile đọc `localStorage`. `services/api.js` nay làm nơi duy nhất quản lý token. Login ghi token qua service; request lấy token tại cùng một nơi. Token cũ trong `sessionStorage` được chuyển sang `localStorage` khi đọc để phiên cũ tiếp tục hoạt động.
- **Đăng xuất không thực sự chạy:** nút trước đây chỉ hiển thị thông báo. Nút hiện gọi `authService.logout`, xóa token cả ở storage mới và cũ, rồi điều hướng về `/`. Nếu server không xác nhận, phiên trên trình duyệt vẫn bị xóa và trang chủ nhận được thông báo lỗi thay vì giả vờ rằng server đã đăng xuất thành công.
- **Dữ liệu user giả:** tên “Khách” cố định được thay bằng tên/email/vai trò nhận từ API. Khi API đang tải hoặc lỗi, profile thể hiện trạng thái tương ứng và cho phép thử lại/đăng nhập.
- **Điều hướng tìm vé sai:** `/hero-benefits` không phải route/form tìm vé của ứng dụng. Profile dùng `/#booking`, là URL trang chủ kèm ID biểu mẫu; khi Home đã render, trang cuộn đến đúng form.
- **Khả năng thêm tính năng:** API và token được gom vào `services/`, trạng thái tải/lỗi và dữ liệu dùng lại ở `hooks/`, còn page/component tập trung hiển thị. Vì vậy một tính năng mới không cần tự viết lại header token, parse lỗi và vòng đời request.

### 2. Đọc luồng hiện tại từ đầu đến cuối

Ví dụ profile tải thông tin tài khoản:

```text
Browser mở /profile
    -> src/page/profile.jsx
       gọi hook useCurrentUser()
    -> src/hooks/useCurrentUser.js
       quản lý user, loading, error; gọi hàm lấy hồ sơ
    -> src/services/authService.js
       getCurrentUser() gọi API /api/auth/me
    -> src/services/api.js
       apiRequest() gắn Authorization từ token tập trung
    -> backend trả { success, user }
       service trả user -> hook cập nhật state -> page truyền user xuống component
```

**Tại sao cần các lớp này?** Nếu API đổi đường dẫn hoặc cách xác thực, sửa service/API thay vì mọi nút hay component. Nếu trạng thái tải/lỗi cần đổi, sửa hook/trạng thái UI của feature. Nếu chỉ đổi cách trình bày, sửa component/CSS mà không động vào giao tiếp backend.

Các file hiện đang sở hữu phần việc tương ứng:

- `src/page/profile.jsx`: ghép các khu vực của profile, điều phối đăng xuất/điều hướng, và render loading/error/content. Đây là nơi nhìn tổng thể trang, không nên viết `fetch` ở đây.
- `src/hooks/useCurrentUser.js`: state và hành vi React cho hồ sơ hiện tại (tải lần đầu, tải lại, lỗi, cập nhật tên). Hook là cầu nối giữa giao diện và service.
- `src/services/authService.js`: nghiệp vụ xác thực/tài khoản (login, lấy/cập nhật user, logout); không chứa JSX.
- `src/services/api.js`: nền tảng HTTP dùng chung (base URL, token, header, lỗi response); không chứa nghiệp vụ riêng như danh sách vé.
- `src/css/profile.css`: giao diện riêng profile và các trạng thái của nó.
- `src/components/`: thành phần giao diện dùng lại. `ProfileMenu.jsx`, `ProfileSummary.jsx`, `UpcomingTrip.jsx`, `SavedDestinations.jsx` hiện có các bản component riêng; route `/profile` hiện đang dùng các component khai báo trong `page/profile.jsx`. Khi cần tách/tái sử dụng, chọn một nơi làm nguồn component thật và import vào page, tránh duy trì hai bản giống nhau.
- `src/data/profileData.js`: vị trí phù hợp cho dữ liệu tĩnh/demo có cấu trúc; dữ liệu thật từ backend không nên bị chép cố định ở đây.
- `src/App.jsx`: đăng ký route. Các link đi đến tính năng phải trỏ route đã khai báo hoặc URL backend/ngoài ứng dụng có chủ đích.
- `src/css/`: CSS chia theo phạm vi trang/chức năng; không đặt logic API trong CSS.

### 3. Thêm tính năng profile: chọn đúng nơi

| Tính năng | Nơi thêm nghiệp vụ/dữ liệu | Nơi giữ state | Nơi hiển thị và thao tác |
| --- | --- | --- | --- |
| Danh sách chuyến bay/chuyến đi của user | Tạo `src/services/tripService.js` với hàm như `getMyTrips()`; gọi endpoint backend thực tế | Tạo `src/hooks/useMyTrips.js` nếu state có loading/error/reload hoặc được dùng ở nhiều component | Tạo/tách `src/components/profile/TripList.jsx` và `TripCard.jsx`; `profile.jsx` ghép khu vực |
| Xem vé/chi tiết đặt chỗ | Tạo `getTicket(bookingId)` trong `src/services/ticketService.js` (hoặc gom vào `tripService.js` nếu backend cùng tài nguyên và quy mô còn nhỏ) | Hook như `useTicket(bookingId)` nếu cần tải/refresh/trạng thái | `TicketDetails.jsx`; nếu có URL riêng, đăng ký route `/profile/tickets/:bookingId` trong `src/App.jsx` |
| Đổi lịch/hủy vé | Tạo hàm service rõ hành động như `changeBooking(...)`, `cancelBooking(...)`; xác nhận API hỗ trợ và gửi ID đặt chỗ | Hook giữ trạng thái đang gửi, kết quả/lỗi, đồng thời tải lại danh sách sau khi thao tác thành công | Nút/form trong `TripCard` hoặc `TicketDetails`; hỏi xác nhận hủy trước khi gửi và báo lỗi/thành công rõ ràng |
| Danh sách điểm đã lưu | Tạo `src/services/savedDestinationService.js` (lấy/thêm/bỏ) | Tạo `src/hooks/useSavedDestinations.js` để danh sách và thao tác thêm/bỏ có cùng nguồn state | `src/components/profile/SavedDestinations.jsx` nhận dữ liệu qua props và phát callback; trang nối với hook |
| Chỉ số chuyến đi/điểm đã lưu | Lấy từ endpoint thống kê hoặc tính từ dữ liệu đã tải nếu nghiệp vụ cho phép | Tận dụng hook sở hữu danh sách hoặc tạo hook thống kê nếu endpoint độc lập | Component summary nhận số liệu qua props; không giữ số giả như `12`, `5`, `8` khi đã có dữ liệu thật |

Các tên file trên là **khung gợi ý để mở rộng**, không phải file đã được tạo hay endpoint chắc chắn tồn tại. Trước khi lập service, xác nhận backend có endpoint, phương thức, cấu trúc response và quyền thao tác tương ứng. Không tự đoán URL/API. Nếu service nhỏ và chỉ có một tính năng dùng, không cần tạo nhiều lớp/file chỉ để đủ kiến trúc; tách khi trách nhiệm hoặc khả năng tái sử dụng tăng lên.

### 4. Mẫu suy nghĩ khi làm một tính năng mới

Thực hiện lần lượt để hiểu bản chất và tránh trộn trách nhiệm:

1. **Đầu vào/đầu ra là gì?** Ví dụ danh sách vé cần `user hiện tại` và trả về `booking[]`; đổi lịch cần `bookingId + lịch mới`, trả về booking đã cập nhật.
2. **Backend đã hỗ trợ chưa?** Xác nhận route, HTTP method, schema, quyền truy cập, lỗi có thể trả về. Nếu chưa có, làm API backend trước hoặc thống nhất hợp đồng API; frontend không thể tự tạo dữ liệu thật.
3. **Viết hàm service nhỏ, có nghĩa nghiệp vụ.** Ví dụ `getMyTrips()` gọi `apiRequest("/api/...")`. Chỉ `apiRequest` xử lý token/header/lỗi HTTP dùng chung; service kiểm tra response đúng cấu trúc nghiệp vụ. Không gọi `fetch` trực tiếp từ button/component.
4. **Đặt trạng thái bất đồng bộ đúng nơi.** Nếu dữ liệu cần loading/error/reload hoặc chia sẻ trong feature, tạo hook trả về dạng dễ hiểu như `{ trips, loading, error, reloadTrips }`. Nếu chỉ là trạng thái đóng/mở một modal, `useState` trong component đó là đủ.
5. **Component nhận dữ liệu và callback qua props.** Ví dụ `TripList({ trips, onViewTicket, onCancel })`; component hiển thị và phát ý định, không tự quyết định endpoint/backend.
6. **Page ghép các phần.** `Profile` gọi hook và truyền dữ liệu/callback xuống component. Đây là nơi điều phối feature, không phải nơi cài toàn bộ nghiệp vụ.
7. **Xử lý đủ trạng thái:** đang tải, danh sách rỗng, lỗi, thành công, gửi thao tác. Hủy/đổi vé cần xác nhận phù hợp; không hiển thị thành công trước khi server trả thành công.
8. **Kiểm tra thay đổi:** chạy `npm run lint` và `npm run build`; kiểm tra cả đường đi thành công, lỗi API/401, dữ liệu rỗng và điều hướng.

Mẫu luồng khi thêm danh sách điểm đã lưu:

```text
Backend endpoint đã thống nhất
    -> savedDestinationService.getSavedDestinations()
       dùng apiRequest() để token và lỗi HTTP giống mọi request khác
    -> useSavedDestinations()
       quản lý destinations/loading/error/reload
    -> Profile gọi hook
       truyền destinations và onRemove xuống SavedDestinations
    -> SavedDestinations chỉ render danh sách/nút
       bấm bỏ lưu -> gọi callback -> hook gọi service -> tải/cập nhật state
```

Khi thêm hành động đổi/hủy, thao tác phải gắn với **ID booking cụ thể**, gọi service tương ứng, chờ kết quả backend rồi cập nhật danh sách. Không đặt toàn bộ luồng này trong `onClick={() => ...}` ở JSX; tách thành hàm có tên để đọc được thứ tự xác nhận → gửi request → xử lý lỗi/thành công → làm mới dữ liệu.

### 5. Hiện trạng cần nhớ khi tiếp tục phát triển

- Dữ liệu chuyến bay trong `UpcomingTrip` và danh sách trong `SavedDestinations` hiện là nội dung mẫu hard-code; nút xem vé/đổi-hủy vẫn là thông báo “sẽ bổ sung”. Chúng chưa được lấy từ API/backend.
- Menu “Vé của tôi”, “Điểm đến đã lưu” hiện chủ yếu là giao diện; cần nối callback/hook/service trước khi có hành vi thật.
- `src/components/UpcomingTrip.jsx`, `src/components/SavedDestinations.jsx` và các component profile khác là các bản riêng đang tồn tại. Kiểm tra trước khi sửa để biết route đang sử dụng bản nào; hiện page profile tự khai báo một số component cùng tên trong file.
- `/search` chưa được khai báo trong `src/App.jsx` ở thời điểm viết tài liệu. Form trang chủ có thể điều hướng tới URL đó, nhưng cần tạo route/trang kết quả trước khi coi luồng tìm vé là hoàn chỉnh.
- Profile hiện hiển thị lỗi khi API `/api/auth/me` trả 401 và cung cấp link đăng nhập; route chưa được bảo vệ bằng một `ProtectedRoute` riêng. Nếu muốn tự động chuyển người chưa đăng nhập sang login, thiết kế route guard tại `App.jsx` thay vì thêm kiểm tra token lặp lại vào từng component.
