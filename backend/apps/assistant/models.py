from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class AssistantConversation(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assistant_conversations',
    )
    client_session_id = models.CharField(max_length=120)
    title = models.CharField(max_length=160, blank=True, default='')
    last_message_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        db_table = 'assistant_conversations'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'client_session_id'],
                name='uq_assistant_conversation_user_session',
            ),
        ]
        indexes = [models.Index(fields=['user', '-last_message_at'])]


class AssistantMessage(BaseModel):
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    conversation = models.ForeignKey(
        AssistantConversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    role = models.CharField(max_length=16, choices=ROLE_CHOICES)
    content = models.TextField(max_length=8000)

    class Meta:
        db_table = 'assistant_messages'
        ordering = ['created_at', 'id']
        indexes = [models.Index(fields=['conversation', '-created_at'])]


class AssistantMemoryEntry(BaseModel):
    KIND_CHOICES = [
        ('fact', 'Fact'),
        ('preference', 'Preference'),
        ('instruction', 'Instruction'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assistant_memories',
    )
    kind = models.CharField(max_length=24, choices=KIND_CHOICES, default='fact')
    content = models.TextField(max_length=1000)
    normalized_content = models.CharField(max_length=1000)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'assistant_memory_entries'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'normalized_content'],
                name='uq_assistant_memory_user_content',
            ),
        ]
        indexes = [models.Index(fields=['user', 'is_active', '-updated_at'])]


class AssistantIntentExample(BaseModel):
    """Curated Vietnamese utterances used to route library workflows safely."""

    ROLE_CHOICES = [
        ('any', 'Mọi bạn đọc'),
        ('student', 'Sinh viên'),
        ('lecturer', 'Giảng viên'),
        ('librarian', 'Thủ thư'),
        ('admin', 'Quản trị viên'),
    ]
    INTENT_CHOICES = [
        ('borrow_guide', 'Hướng dẫn mượn sách'),
        ('borrow_policy', 'Chính sách mượn sách'),
        ('loan_status', 'Sách đang mượn'),
        ('renew_guide', 'Hướng dẫn gia hạn'),
        ('return_guide', 'Hướng dẫn trả sách'),
        ('overdue_policy', 'Chính sách quá hạn'),
        ('reservation_status', 'Trạng thái đặt trước'),
        ('fine_status', 'Tiền phạt cá nhân'),
    ]
    SOURCE_CHOICES = [
        ('seed', 'Dữ liệu nền UTH'),
        ('admin', 'Thủ thư bổ sung'),
        ('feedback', 'Phản hồi đã duyệt'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='any', db_index=True)
    intent = models.CharField(max_length=40, choices=INTENT_CHOICES, db_index=True)
    utterance = models.CharField(max_length=500)
    normalized_text = models.CharField(max_length=500, db_index=True, editable=False)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='admin')
    is_hard_negative = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'assistant_intent_examples'
        ordering = ['intent', 'role', 'utterance']
        constraints = [
            models.UniqueConstraint(
                fields=['role', 'normalized_text'],
                name='uq_assistant_intent_role_text',
            ),
        ]

    def save(self, *args, **kwargs):
        from apps.assistant.AI.language import normalize_vietnamese_text

        self.normalized_text = normalize_vietnamese_text(self.utterance)
        super().save(*args, **kwargs)
