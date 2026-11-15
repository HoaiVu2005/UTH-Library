from rest_framework import status

ERROR_CODE_MAPPING = {
    # Xác thực (401)
    'AUTH_INVALID_CREDENTIALS': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu.',
    },
    'AUTH_TOKEN_EXPIRED': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'Phiên đăng nhập đã hết hạn. Vui lòng làm mới phiên hoặc đăng nhập lại.',
    },
    'AUTH_TOKEN_INVALID': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'Mã thông báo không hợp lệ hoặc đã bị thay đổi.',
    },
    'AUTH_REFRESH_REVOKED': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'Phiên đăng nhập đã bị thu hồi vì lý do bảo mật. Vui lòng đăng nhập lại.',
    },
    'UNAUTHORIZED': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'Yêu cầu đăng nhập để thực hiện chức năng này.',
    },

    # Quyền / trạng thái tài khoản (403)
    'FORBIDDEN': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'Bạn không có quyền thực hiện thao tác này.',
    },
    'USER_LOCKED': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'Tài khoản hiện đang bị tạm khóa. Vui lòng liên hệ thủ thư hoặc thử lại sau.',
    },
    'USER_EXPIRED': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'Thẻ bạn đọc đã hết hạn sử dụng. Vui lòng liên hệ quầy thư viện để gia hạn thẻ.',
    },
    'USER_NO_SHOW_LOCKED': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'Tài khoản bị tạm khóa chức năng đặt trước/giữ chỗ do quá 3 lần không đến nhận sách đúng hẹn.',
    },

    # Không tìm thấy (404 / 400)
    'NOT_FOUND': {
        'status': status.HTTP_404_NOT_FOUND,
        'detail': 'Dữ liệu yêu cầu không tồn tại trong hệ thống.',
    },
    'USER_NOT_FOUND': {
        'status': status.HTTP_404_NOT_FOUND,
        'detail': 'Không tìm thấy người dùng hoặc thẻ bạn đọc tương ứng.',
    },
    'INVALID_BARCODE_FORMAT': {
        'status': status.HTTP_400_BAD_REQUEST,
        'detail': 'Mã vạch không đúng định dạng chuẩn UTH (UTH-[CHUYÊN_NGÀNH]-[6 SỐ]).',
    },

    # Quy tắc nghiệp vụ không thỏa (422)
    'LOAN_LIMIT_REACHED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bạn đọc đã đạt giới hạn số sách được mượn/giữ chỗ tối đa.',
    },
    'LOAN_HAS_OVERDUE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bạn đọc hiện có sách quá hạn chưa trả. Vui lòng trả sách trước khi thực hiện mượn hoặc giữ chỗ.',
    },
    'LOAN_HAS_UNPAID_FINE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bạn đọc có khoản tiền phạt chưa thanh toán. Vui lòng hoàn tất nộp phạt tại quầy.',
    },
    'RENEWAL_LIMIT_REACHED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Sách này đã đạt số lần gia hạn tối đa cho phép.',
    },
    'RENEWAL_OVERDUE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Không thể gia hạn sách khi sách đã bị quá hạn trả.',
    },
    'RENEWAL_HAS_RESERVATION': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Không thể gia hạn vì đầu sách này đang có bạn đọc khác xếp hàng đặt trước.',
    },
    'RESERVATION_LIMIT_REACHED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bạn đã đạt giới hạn số lượng đặt trước đang chờ tối đa.',
    },
    'RESERVATION_HAS_OVERDUE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Không thể đặt trước do tài khoản đang có sách quá hạn.',
    },
    'RESERVATION_EXPIRED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Yêu cầu giữ chỗ này đã hết thời gian hiệu lực.',
    },
    'COPY_READING_ROOM_ONLY': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bản sao này chỉ dành để đọc tại chỗ, không thể mượn về nhà hoặc đặt trước.',
    },
    'COPY_NOT_AVAILABLE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bản sao hiện không ở trạng thái sẵn sàng để mượn hoặc giữ chỗ.',
    },
    'FINE_AMOUNT_INVALID': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Số tiền phạt không hợp lệ hoặc vượt quá số tiền cần thu.',
    },
    'FINE_ALREADY_PAID': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Khoản phạt này đã được thanh toán hoặc đã được miễn giảm.',
    },
    'POLICY_INVALID_VALUE': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Giá trị chính sách không hợp lệ.',
    },
    'DAMAGE_NOTE_REQUIRED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bắt buộc phải nhập ghi chú giải thích khi thay đổi số tiền đền bù hư hỏng.',
    },
    'WAIVE_REASON_REQUIRED': {
        'status': status.HTTP_422_UNPROCESSABLE_ENTITY,
        'detail': 'Bắt buộc phải nhập lý do miễn giảm khoản phạt.',
    },

    # Xung đột / trùng (409)
    'COPY_ALREADY_BORROWED': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Bản sao này hiện đang được người khác mượn.',
    },
    'COPY_HELD_FOR_OTHER': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Bản sao này đang được giữ chỗ ưu tiên cho một bạn đọc khác.',
    },
    'LOAN_DUPLICATE_BOOK': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Bạn đọc đang mượn hoặc đang giữ một bản khác của cùng đầu sách này.',
    },
    'LOAN_ALREADY_RETURNED': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Phiếu mượn này đã được trả hoặc sách đã được ghi nhận trước đó.',
    },
    'RESERVATION_DUPLICATE': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Bạn đọc đã có một yêu cầu đặt trước hoặc giữ chỗ cho đầu sách này.',
    },
    'BOOK_HAS_ACTIVE_LOANS': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Không thể xóa đầu sách do vẫn còn các bản sao đang được mượn hoặc giữ chỗ.',
    },
    'BOOK_HAS_ACTIVE_RESERVATIONS': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Không thể xóa đầu sách do đang có bạn đọc xếp hàng đặt trước.',
    },
    'USER_DUPLICATE': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại.',
    },
    'CARD_ALREADY_EXISTS': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Mã thẻ bạn đọc này đã được sử dụng cho một tài khoản khác.',
    },
    'CONFLICT': {
        'status': status.HTTP_409_CONFLICT,
        'detail': 'Dữ liệu bị xung đột hoặc phiên làm việc đã bị thay đổi bởi người khác.',
    },

    # Dữ liệu vào (400, 413, 415)
    'VALIDATION_ERROR': {
        'status': status.HTTP_400_BAD_REQUEST,
        'detail': 'Dữ liệu gửi lên không đúng định dạng hoặc thiếu các trường bắt buộc.',
    },
    'IMPORT_VALIDATION_FAILED': {
        'status': status.HTTP_400_BAD_REQUEST,
        'detail': 'Dữ liệu file import có lỗi ở một hoặc nhiều dòng.',
    },
    'FILE_TOO_LARGE': {
        'status': status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        'detail': 'Kích thước tập tin vượt quá giới hạn tối đa cho phép (5MB).',
    },
    'FILE_TYPE_NOT_ALLOWED': {
        'status': status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        'detail': 'Định dạng tập tin không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh JPG, PNG, WebP.',
    },

    # Hệ thống (429, 500)
    'RATE_LIMITED': {
        'status': status.HTTP_429_TOO_MANY_REQUESTS,
        'detail': 'Quá nhiều yêu cầu gửi liên tục. Vui lòng chờ ít phút và thử lại.',
    },
    'INTERNAL_ERROR': {
        'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'detail': 'Đã xảy ra lỗi nội bộ hệ thống. Đội ngũ kỹ thuật đã được thông báo để kiểm tra.',
    },
}

