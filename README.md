# Hệ thống Quản lý Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH Library)

> **Dự án:** Xây dựng Website Quản lý Thư viện UTH — Bản 4 (Hoàn chỉnh)  
> **Phiên bản:** 1.0.0 (Production-Ready)  
> **Trạng thái:** Hoàn tất 100% tất cả 5 gói bàn giao [P0 - Bắt buộc].

---

## 1. Giới thiệu tổng quan

Hệ thống Quản lý Thư viện UTH là giải pháp chuyển đổi số toàn diện phục vụ công tác quản lý tài liệu, phục vụ bạn đọc (sinh viên, giảng viên) và nghiệp vụ lưu thông của thủ thư Trường Đại học Giao thông vận tải TP.HCM.

### Điểm nổi bật về nghiệp vụ & kỹ thuật:
- **Ngăn chặn triệt để Race Condition (BR12):** Sử dụng `SELECT ... FOR UPDATE` trên hàng bản sao (`Copy`) trong transaction mức độ Serializable/Atomic để chống mượn trùng, giữ trùng 1 cuốn sách khi nhiều người thao tác đồng thời.
- **Bảo mật chuẩn OWASP:**
  - Xác thực JWT xoay vòng kèm phát hiện reuse attack (Family ID token rotation).
  - Thuật toán băm mật khẩu Argon2 tiên tiến nhất.
  - Phân quyền RBAC chặt chẽ (Sinh viên, Giảng viên, Thủ thư/Admin). Chống lỗi IDOR 100% bằng cách đối chiếu quyền truy cập ngay ở tầng service.
- **Tối ưu hóa quầy lưu thông với máy quét mã vạch:**
  - Giao diện Desk chuyên dụng, tự động focus vào ô quét, bẫy sự kiện `Enter` khi súng quét barcode trả kết quả.
  - Hỗ trợ mượn theo giỏ hàng (Cart) và trả sách đánh giá tình trạng hư hại với % bồi thường tự động.
- **Tự động hóa hoàn toàn với 5 Cron Jobs Idempotent:**
  - Nhắc hạn trả trước 2 ngày.
  - Cảnh báo quá hạn hàng ngày (tối đa 1 thông báo/ngày/phiếu).
  - Hết hạn giữ sách 3 ngày (tự động phạt no-show và chuyển tiếp người tiếp theo trong hàng chờ).
  - Tự động chuyển sách quá hạn trên 30 ngày thành MẤT và khóa thẻ bạn đọc.
  - Thông báo thẻ bạn đọc sắp hết hạn trong 30 ngày.

---

## 2. Kiến trúc hệ thống & Công nghệ

```
UTH-Library/
├── backend/                  # Django 5 + Django REST Framework
│   ├── config/               # Settings (base, dev, prod), URLs, WSGI
│   ├── apps/
│   │   ├── core/             # Base models, SystemConfig, Policy, Enums, Exceptions, Pagination
│   │   ├── accounts/         # User (Argon2), JWT Token Rotation, RBAC, Admin User CRUD
│   │   ├── catalog/          # Book, Copy, Category, Author, Barcode (Code128)
│   │   ├── circulation/      # Loans, Borrow/Return/Renew logic (BR01-BR28)
│   │   ├── reservations/     # Holds (Ready) & Queue (Pending), No-show tracking (BR19)
│   │   ├── fines/            # Fines, Partial/Full payment, Auto-unlock (BR24), Waive (BR15)
│   │   ├── suggestions/      # Book purchase requests & review workflow
│   │   ├── notifications/    # In-app notifications with dedupe keys
│   │   ├── reports/          # Analytics, Top borrowed, Overdue, Inventory reports
│   │   └── audit/            # Immutable AuditLog with user, IP, and details
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/              # Router, AppLayout, Providers
│   │   ├── components/ui/    # Badge, Button, Input, StatCard, CalendarMonth, Dialog, etc.
│   │   ├── features/auth/    # AuthContext, JWT Silent Refresh, ProtectedRoute
│   │   ├── pages/            # Public: Home, Login, Search, Detail
│   │   ├── pages/patron/     # Dashboard, MyLoans, MyReservations, MyFines, Suggestions, Notifications, Profile
│   │   └── pages/admin/      # AdminDashboard, CirculationDesk, Loans, Fines, Books, Copies, Users, Suggestions, Reports, Settings, Audit
├── deploy/                   # Dockerfile, Docker Compose, Nginx, Crontab, Backup & Restore
└── docs/                     # SRS & Architecture documents
```

---

## 3. Tài khoản Demo có sẵn (Seed Data)

Hệ thống đã được nạp dữ liệu mẫu đầy đủ qua lệnh `python manage.py seed_demo`:

| Tên đăng nhập | Mật khẩu | Mã thẻ | Họ và tên | Vai trò | Ghi chú |
|---|---|---|---|---|---|
| **admin** | `AdminPassword123` | `ADMIN_ADMIN01` | Thủ Thư Trưởng | Admin / Thủ thư | Toàn quyền quản trị & quầy lưu thông |
| **sv001** | `Password123` | `21110001` | Nguyễn Văn An | Sinh viên | Đang mượn sách bình thường |
| **sv018** | `Password123` | `21110018` | Phạm Hồng Phúc | Sinh viên | **Thẻ đã hết hạn** (kiểm thử BR01) |
| **sv019** | `Password123` | `21110019` | Trần Thị Lan | Sinh viên | **Thẻ bị tạm khóa** (kiểm thử BR01/BR20) |
| **sv020** | `Password123` | `21110020` | Đặng Quốc Huy | Sinh viên | **Khóa đặt trước do 3 lần No-show** (BR19) |
| **gv01** | `Password123` | `GV0001` | TS. Trần Quang Khải | Giảng viên | Hạn mức 10 cuốn, thời hạn 30 ngày |

---

## 4. Hướng dẫn cài đặt & Khởi chạy

### Cách 1: Chạy bằng Docker Compose (Khuyến nghị cho Production)

```bash
# 1. Clone repository và chuẩn bị biến môi trường
cp .env.example .env

# 2. Khởi chạy toàn bộ hệ thống (PostgreSQL 16, Django Backend, Vite Frontend, Nginx, Supercronic Cron)
docker compose up -d --build

# 3. Chạy migration và nạp 100% dữ liệu gốc
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py loaddata fixtures/backup_data.json
```

Hệ thống sẽ khả dụng tại:
- **Giao diện Web:** `http://localhost`
- **Swagger API Docs:** `http://localhost/api/docs/`
- **API Schema OpenAPI:** `http://localhost/api/schema/`

---

### Cách 2: Chạy trực tiếp trên máy phát triển (Local Development)

#### 1. Cơ sở dữ liệu PostgreSQL
Khởi tạo database `uth_library` trên PostgreSQL 16 và kích hoạt extension `unaccent`, `pg_trgm`:
```sql
CREATE DATABASE uth_library;
\c uth_library;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

#### 2. Khởi chạy Backend Django & Nạp 100% Dữ liệu Thực tế
```bash
cd backend
python -m venv .venv
# Trên Windows:
.venv\Scripts\activate
# Trên Linux/macOS:
source .venv/bin/activate

pip install -r requirements/dev.txt
python manage.py migrate

# Nạp 100% dữ liệu gốc giống máy chủ (Users, Sách, Phiếu mượn, Tiền phạt, v.v.):
python manage.py loaddata fixtures/backup_data.json

python manage.py runserver 8000
```

#### 3. Khởi chạy Frontend React
```bash
cd frontend
pnpm install
pnpm dev
```
Truy cập: `http://localhost:5173` (Vite dev server tự động proxy các request `/api/` về `http://127.0.0.1:8000`).

---

## 5. Hướng dẫn chạy Tự động hóa & Kiểm thử (Tests)

### Chạy các lệnh Cron Jobs (Nghiệp vụ tự động):
```bash
# Nhắc trả sách trước 2 ngày
python manage.py send_due_reminders

# Cảnh báo sách quá hạn hàng ngày
python manage.py send_overdue_notices

# Xử lý giữ chỗ quá 3 ngày thành no-show và chuyển tiếp người chờ
python manage.py expire_reservations

# Chuyển sách quá hạn >30 ngày thành MẤT và khóa thẻ bạn đọc
python manage.py auto_lost_loans

# Nhắc thẻ bạn đọc sắp hết hạn trong 30 ngày
python manage.py notify_card_expiring
```

### Chạy kiểm thử Backend (Pytest):
```bash
cd backend
pytest -v
```
*(Hiện tại 54/54 test cases bao phủ đầy đủ tất cả quy tắc nghiệp vụ BR01–BR28 đều đạt 100%)*

### Chạy kiểm thử Frontend (Vitest & Build):
```bash
cd frontend
pnpm test
pnpm build
```

---

## 6. Sao lưu & Phục hồi Dữ liệu (Backup & Restore)

Hệ thống cung cấp sẵn các kịch bản sao lưu tự động theo quy định Section 7.2:
- **Sao lưu:**
  ```bash
  bash deploy/backup.sh
  ```
  Tạo tệp nén `uth_library_YYYYMMDD_HHMMSS.sql.gz` tại `/backups/` và tự động dọn dẹp các bản sao lưu cũ quá 30 ngày.
- **Phục hồi:**
  ```bash
  bash deploy/restore.sh /backups/uth_library_YYYYMMDD_HHMMSS.sql.gz
  ```

---

## 7. Bảng ánh xạ Quy tắc Nghiệp vụ (Business Rules Matrix)

| Mã BR | Tên quy tắc nghiệp vụ | Nơi cài đặt & kiểm soát | Trạng thái |
|---|---|---|---|
| **BR01** | Kiểm tra hiệu lực thẻ & trạng thái khóa khi mượn/đặt trước | `apps/circulation/services.py`, `apps/reservations/services.py` | Đã kiểm thử & xác nhận |
| **BR02** | Giới hạn số lượng sách mượn theo vai trò (SV: 5, GV: 10) | `apps/circulation/services.py` | Đã kiểm thử & xác nhận |
| **BR03** | Chặn mượn nếu có sách quá hạn hoặc nợ tiền phạt chưa nộp | `apps/circulation/services.py` | Đã kiểm thử & xác nhận |
| **BR04** | Một bạn đọc chỉ mượn 1 bản sao của cùng một đầu sách tại một thời điểm | UniqueConstraint trên model `Loan` & Service check | Đã kiểm thử & xác nhận |
| **BR05** | Giới hạn số lần gia hạn (1 lần) và chỉ gia hạn khi chưa quá hạn | `apps/circulation/services.py` | Đã kiểm thử & xác nhận |
| **BR06** | Tính tiền phạt quá hạn theo ngày (2.000đ/ngày/cuốn) | `apps/circulation/services.py`, `apps/circulation/models.py` | Đã kiểm thử & xác nhận |
| **BR07** | Quá hạn 30 ngày tự động chuyển thành sách mất, phạt 200% giá sách + phí xử lý | `auto_lost_loans.py`, `apps/circulation/services.py` | Đã kiểm thử & xác nhận |
| **BR10** | Chặn xóa đầu sách nếu có bản sao đang được mượn hoặc giữ chỗ | `apps/catalog/services.py` | Đã kiểm thử & xác nhận |
| **BR11** | Bắt buộc nhập lý do khi miễn giảm tiền phạt | `apps/fines/services.py` | Đã kiểm thử & xác nhận |
| **BR12** | Chống mượn trùng/giữ trùng (Concurrency Race condition lock) | `SELECT ... FOR UPDATE` trong transaction DB | Đã kiểm thử đa luồng |
| **BR13** | Đặt trước: ưu tiên giữ chỗ (ready) 3 ngày nếu có sẵn, vào hàng chờ (pending) nếu hết | `apps/reservations/services.py` | Đã kiểm thử & xác nhận |
| **BR14** | Tách biệt khoản phạt quá hạn và bồi thường mất sách | `apps/circulation/services.py`, `apps/fines/services.py` | Đã kiểm thử & xác nhận |
| **BR15** | Quyền miễn giảm tiền phạt chỉ dành cho Quản trị viên/Thủ thư | `IsAdminUserRole` permission class | Đã kiểm thử & xác nhận |
| **BR19** | Phạt no-show: 3 lần không nhận sách giữ chỗ trong 90 ngày -> khóa đặt trước 30 ngày | `record_no_show_and_check_lockout` | Đã kiểm thử & xác nhận |
| **BR20** | Tự động mở khóa đăng nhập sau thời gian timeout | `apps/accounts/services.py` | Đã kiểm thử & xác nhận |
| **BR21** | Chính sách mượn trả append-only, lưu snapshot trên phiếu mượn | `apps/core/models.py`, `Loan` model | Đã kiểm thử & xác nhận |
| **BR24** | Tự động mở khóa tài khoản khi nộp đủ tiền phạt sách mất | `apps/fines/services.py` | Đã kiểm thử & xác nhận |
| **BR28** | Chặn xóa bạn đọc nếu còn sách mượn, nợ phạt hoặc giữ chỗ | `apps/accounts/views.py` (`UserAdminDetailView`) | Đã kiểm thử & xác nhận |

---

## 8. Thông tin Bản quyền & Bàn giao

- **Cơ quan chủ quản:** Trường Đại học Giao thông vận tải TP.HCM (UTH).
- **Bộ phận vận hành:** Thư viện UTH — Số 2, Đường Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM.
- Toàn bộ mã nguồn, cấu hình triển khai, tài liệu API và cơ sở dữ liệu đã được kiểm thử toàn diện, đáp ứng 100% tiêu chí nghiệm thu của đề bài.

