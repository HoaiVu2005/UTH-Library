# AGENTS.md — Hướng dẫn và Ngữ cảnh Dự án UTH Library

Tài liệu này cung cấp toàn bộ hướng dẫn, tiêu chuẩn kỹ thuật và quy tắc thiết kế dành cho các AI Agent khi làm việc trên dự án **Hệ thống Quản lý Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH)**.

---

## Design Context

### Users
- **Primary Users (Patrons):**
  - **Students (Sinh viên):** Cần giao diện tự phục vụ nhanh chóng để tra cứu sách, theo dõi giáo trình, kiểm tra tình trạng sách thời gian thực, gia hạn sách 1-click, theo dõi hàng chờ đặt trước, thanh toán phạt, và gửi đề xuất mua sách. Bối cảnh: Thường truy cập qua thiết bị di động/laptop giữa các giờ học, cần thông tin rõ ràng, không gây quá tải nhận thức.
  - **Lecturers / Faculty (Giảng viên):** Hạn mức mượn ưu tiên (10 cuốn, 30 ngày) và phục vụ nhu cầu tham khảo tài liệu nghiên cứu, giảng dạy.
- **Secondary Users / Operators (Library Staff & Administrators):**
  - **Circulation Librarians (Thủ thư quầy lưu thông):** Thao tác nhanh với máy quét mã vạch chuyên dụng tại `CirculationDeskPage`, xử lý giỏ mượn nhiều cuốn, quy trình trả sách đánh giá tình trạng hư hại (% bồi thường), thu phí phạt và phân phối sách đặt trước.
  - **System Administrators (Quản trị viên):** Quản lý danh mục sách & bản sao Code128, quản lý người dùng (gia hạn thẻ, khóa/mở thẻ, reset mật khẩu), duyệt đề xuất mua sách, kiểm tra nhật ký kiểm toán (Audit Logs) và cấu hình chính sách lưu thông.

### Brand Personality
- **Voice & Tone:** Chuyên nghiệp, Hiện đại, Tin cậy, Thân thiện (*Authoritative, Crisp, Accessible*).
- **3-Word Personality:** **Authoritative, Crisp, Accessible.**
- **Emotional Goals:** Mang lại cảm giác an tâm, tin cậy, phân cấp thông tin sáng rõ, không gây nhầm lẫn về thời hạn mượn/tiền phạt, tối ưu tốc độ thao tác cho công việc hàng ngày.

### Aesthetic Direction
- **Visual Direction:** Modern Enterprise Dashboard kết hợp Clean University Portal. Kế thừa bố cục thẻ thông tin từ Cổng thông tin sinh viên UTH chính thức nhưng được hiện đại hóa về typography, khoảng trắng và hiệu ứng tương tác.
- **Color Palette:**
  - **Primary Brand (Teal):** `#008B8B` (Chủ đạo), `#006F70` (Hover/Dark), `#E6F4F3` (Nền sáng/Highlight).
  - **Accent & Secondary (Orange):** `#ED6C02` / `#FF6600` cho badge quan trọng, cảnh báo hạn chót, thông báo khẩn.
  - **Backgrounds:** `#F3F6F8` (Nền toàn trang), `#FFFFFF` (Bề mặt thẻ/Card), `#F8FAFC` (Hàng xen kẽ trong bảng).
  - **Typography & Ink:** `#263238` (Chữ chính), `#64748B` (Chữ phụ/Muted).
  - **Borders & Dividers:** `#E2E8F0` (Đường kẻ thanh mảnh).
  - **Trạng thái:** `#16A34A` (Thành công), `#F59E0B` (Cảnh báo), `#EF4444` (Lỗi/Nguy hiểm), `#3B82F6` (Thông tin).
- **Typography Stack:** `"Be Vietnam Pro"`, `"Inter"`, system-ui, sans-serif. Phân cấp cỡ chữ và độ đậm rõ ràng, không in đậm tràn lan.
- **Anti-References:**
  - Tránh giao diện demo/template AI mặc định hoặc dark mode crypto.
  - Tránh gradient đa sắc sặc sỡ hoặc màu neon gây mỏi mắt.
  - Tránh nhồi nhét: không tạo quá nhiều card con lồng nhau, không để viền khung rối rắm, và không để khoảng trống vô nghĩa.

### Implementation Defaults
- **Runtime & Framework:** React 18 (`18.3.1`) + TypeScript (`5.6.3`) + Vite (`5.4.8`) SPA.
- **Styling System:** Tailwind CSS (`3.4.13`) với tokens màu mở rộng (`primary`, `brand`, `pageBg`, `surface`, `textPrimary`, `textSecondary`, `border`).
- **Component Architecture:** Hệ thống component nội bộ tại `frontend/src/components/ui/` (`Button`, `Badge`, `Input`, `StatCard`, `CalendarMonth`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Skeleton`, `Pagination`).
- **Form Architecture:** React Hook Form (`7.53.0`) + `@hookform/resolvers` + `zod` (`3.23.8`) kết hợp React controlled state cho form gọn nhẹ.
- **Table / Data-Grid Architecture:** Bảng HTML ngữ nghĩa responsive, sticky headers (`bg-gray-50/80`), hiệu ứng hover nhẹ (`hover:bg-teal-50/30`), status badge và cụm nút thao tác đồng nhất.
- **Data Fetching & State:** `@tanstack/react-query` (`5.59.0`) + Axios (`1.7.7`) + `AuthContext` (JWT rotation với cơ chế silent refresh).
- **Data Visualization:** Recharts (`2.13.0`) cho thống kê lưu thông.
- **Iconography:** Lucide React (`lucide-react@0.453.0`) nét 16px/18px/20px đồng nhất.
- **Backend Stack:** Django 5 + Django REST Framework + PostgreSQL 16 (port 5433).

### Design Principles
1. **Less is More (Ưu tiên khả dụng trước trang trí):**
   Mỗi màn hình chỉ tập trung vào một nhiệm vụ trọng tâm. Sử dụng khoảng cách và độ đậm của chữ để tạo phân cấp thị giác trước khi dùng màu sắc. Không lạm dụng viền khung và thẻ chồng chéo.
2. **Nhận diện UTH đồng nhất & Hiện đại:**
   Duy trì màu Teal UTH (`#008B8B`) làm neo định danh thị giác cùng sắc cam (`#ED6C02`) tinh tế. Tái hiện chuẩn nét bố cục cổng sinh viên UTH (thẻ sinh viên ảnh 125x165, lịch tháng với viền teal báo ngày hiện tại, 8 thẻ chức năng nhanh) nhưng lược bỏ các khuyết điểm rườm rà.
3. **Căn chỉnh chuẩn xác & Hình học cân bằng:**
   Bảng dữ liệu, danh sách và form nhập liệu phải căn chỉnh thẳng hàng với nhãn cố định (`w-20`, `w-28`). Bo góc đồng đều (12px–16px), đệm trong hợp lý (16px–24px), không để khoảng trống lệch lạc.
4. **Phản hồi trạng thái minh bạch:**
   Mọi tương tác đều có phản hồi trực quan: loading skeleton khi tải dữ liệu, empty state kèm nút kích hoạt hành động, thông báo lỗi inline, và modal xác nhận an toàn trước các thao tác nhạy cảm.
5. **Tối ưu tốc độ Quầy lưu thông (Desk Speed & Barcode):**
   Giao diện quầy lưu thông phải hỗ trợ phím tắt và máy quét mã vạch (auto-focus, bắt phím `Enter`), giỏ hàng mượn sách mượt mà, không gián đoạn thao tác của thủ thư.

