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
