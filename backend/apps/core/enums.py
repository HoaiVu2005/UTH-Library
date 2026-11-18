from django.db import models

class UserRole(models.TextChoices):
    STUDENT = 'student', 'Sinh viên'
    LECTURER = 'lecturer', 'Giảng viên'
    LIBRARIAN = 'librarian', 'Thủ thư'
    ADMIN = 'admin', 'Quản trị viên / Trưởng thư viện'

class CopyStatus(models.TextChoices):
    AVAILABLE = 'available', 'Sẵn sàng'
    BORROWED = 'borrowed', 'Đang mượn'
    RESERVED_HOLD = 'reserved_hold', 'Đang giữ chỗ'
    READING_ROOM = 'reading_room', 'Đọc tại chỗ'
    DAMAGED = 'damaged', 'Bị hỏng'
    LOST = 'lost', 'Đã mất'
    WITHDRAWN = 'withdrawn', 'Đã thanh lý'

class LoanStatus(models.TextChoices):
    ACTIVE = 'active', 'Đang mượn'
    RETURNED = 'returned', 'Đã trả'
    LOST = 'lost', 'Đã báo mất'

class ReturnCondition(models.TextChoices):
    NORMAL = 'normal', 'Bình thường'
    DAMAGED = 'damaged', 'Hư hỏng'
    LOST = 'lost', 'Mất sách'

class DamageLevel(models.TextChoices):
    LIGHT = 'light', 'Hỏng nhẹ'
    MEDIUM = 'medium', 'Hỏng vừa'
    HEAVY = 'heavy', 'Hỏng nặng'

class ReservationStatus(models.TextChoices):
    PENDING = 'pending', 'Chờ có sách (Hàng chờ)'
    READY = 'ready', 'Sách đã sẵn sàng (Đang giữ)'
    FULFILLED = 'fulfilled', 'Đã nhận sách'
    EXPIRED = 'expired', 'Hết hạn giữ'
    CANCELLED = 'cancelled', 'Đã hủy'

class ReservationType(models.TextChoices):
    BORROW = 'borrow', 'Mượn về'
    READING_ROOM = 'reading_room', 'Đọc tại chỗ'

class FineType(models.TextChoices):
    OVERDUE = 'overdue', 'Quá hạn'
    DAMAGE = 'damage', 'Làm hỏng'
    LOST = 'lost', 'Làm mất'

class FineStatus(models.TextChoices):
    UNPAID = 'unpaid', 'Chưa thanh toán'
    PARTIAL = 'partial', 'Thanh toán một phần'
    PAID = 'paid', 'Đã thanh toán'
    WAIVED = 'waived', 'Được miễn giảm'

class NotificationType(models.TextChoices):
    DUE_SOON = 'due_soon', 'Sắp đến hạn trả'
    OVERDUE = 'overdue', 'Quá hạn trả'
    RESERVATION_READY = 'reservation_ready', 'Sách đặt trước đã sẵn sàng'
    SUGGESTION_RESULT = 'suggestion_result', 'Kết quả duyệt đề xuất'
    FINE_CREATED = 'fine_created', 'Khoản phạt mới'
    FINE_PAID = 'fine_paid', 'Thanh toán tiền phạt thành công'
    CARD_EXPIRING = 'card_expiring', 'Thẻ bạn đọc sắp hết hạn'

class NotificationChannel(models.TextChoices):
    IN_APP = 'in_app', 'Trong ứng dụng'
    EMAIL = 'email', 'Thư điện tử'

class SuggestionStatus(models.TextChoices):
    PENDING = 'pending', 'Chờ duyệt'
    APPROVED = 'approved', 'Đã duyệt'
    REJECTED = 'rejected', 'Từ chối'
    RECEIVED = 'received', 'Đã nhập kho'

class LockReason(models.TextChoices):
    MANUAL = 'manual', 'Khóa thủ công'
    LOGIN = 'login', 'Khóa do sai mật khẩu quá nhiều lần'
    UNPAID_LOST_FINE = 'unpaid_lost_fine', 'Khóa do quá hạn sách thành mất và chưa nộp phạt'
    OVERDUE_THRESHOLD = 'overdue_threshold', 'Khóa do có sách quá hạn > 7 ngày'
    UNPAID_FINE_THRESHOLD = 'unpaid_fine_threshold', 'Khóa do nợ phạt vượt ngưỡng (> 50.000đ)'


