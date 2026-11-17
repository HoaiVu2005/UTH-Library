import re
import unicodedata

from django.db import transaction

from apps.assistant.models import AssistantConversation, AssistantMemoryEntry, AssistantMessage

# Bộ nhớ dài hạn riêng theo tài khoản.

MAX_MEMORY_ENTRIES = 100
MAX_RETRIEVED_MESSAGES = 6
MAX_MEMORY_CONTEXT_CHARS = 4000

STOP_WORDS = {
    'anh', 'ban', 'cua', 'cho', 'co', 'gi', 'la', 'lai', 'minh', 'mot', 'nao',
    'nhac', 'nhung', 'noi', 'tao', 'the', 'thi', 'toi', 'va', 've', 'voi', 'may',
}


def _fold_text(value: str) -> str:
    decomposed = unicodedata.normalize('NFD', value.lower())
    without_marks = ''.join(char for char in decomposed if unicodedata.category(char) != 'Mn')
    return re.sub(r'\s+', ' ', without_marks.replace('đ', 'd')).strip()


def _tokens(value: str) -> set[str]:
    return {
        token for token in re.findall(r'[a-z0-9]+', _fold_text(value))
        if len(token) > 1 and token not in STOP_WORDS
    }


def _extract_explicit_memories(message: str) -> list[tuple[str, str]]:
    text = message.strip()
    folded = _fold_text(text)
    memories: list[tuple[str, str]] = []

    fact_match = re.search(r'(?:hay\s+)?(?:nho|ghi\s+nho)(?:\s+rang|\s+la)?\s+(.+)', folded)
    if fact_match:
        original_start = len(text) - len(fact_match.group(1))
        content = text[max(0, original_start):].strip(' .,!?:;')
        content = re.sub(r'\s+(?:nhe|nha)$', '', content, flags=re.IGNORECASE).strip()
        if 3 <= len(content) <= 1000:
            kind = 'preference' if any(word in folded for word in ['thich', 'muon', 'uu tien']) else 'fact'
            memories.append((kind, content))

    if any(marker in folded for marker in ['tao may', 'may tao', 'xung tao', 'xung may', 'cu tao', 'cu may']):
        memories.append(('instruction', 'Cách xưng hô người dùng chọn: tao–mày'))

    return memories


def _enforce_memory_limit(user) -> None:
    queryset = AssistantMemoryEntry.objects.filter(user=user).order_by('-updated_at', '-id')
    stale_ids = list(queryset.values_list('id', flat=True)[MAX_MEMORY_ENTRIES:])
    if stale_ids:
        AssistantMemoryEntry.objects.filter(id__in=stale_ids).delete()


@transaction.atomic
def remember_explicit_user_facts(user, message: str) -> list[AssistantMemoryEntry]:
    if not user or not getattr(user, 'is_authenticated', False):
        return []

    saved = []
    for kind, content in _extract_explicit_memories(message):
        normalized = _fold_text(content)
        memory, _ = AssistantMemoryEntry.objects.update_or_create(
            user=user,
            normalized_content=normalized,
            defaults={'kind': kind, 'content': content, 'is_active': True},
        )
        saved.append(memory)
    _enforce_memory_limit(user)
    return saved


@transaction.atomic
def record_conversation_turn(user, client_session_id: str, user_message: str, assistant_reply: str):
    if not user or not getattr(user, 'is_authenticated', False):
        return None

    session_id = (client_session_id or 'default')[:120]
    conversation, _ = AssistantConversation.objects.get_or_create(
        user=user,
        client_session_id=session_id,
        defaults={'title': user_message[:160]},
    )
    AssistantMessage.objects.bulk_create([
        AssistantMessage(conversation=conversation, role='user', content=user_message[:8000]),
        AssistantMessage(conversation=conversation, role='assistant', content=assistant_reply[:8000]),
    ])
    conversation.save(update_fields=['last_message_at', 'updated_at'])
    return conversation


def build_long_term_memory_context(user, query: str) -> str:
    if not user or not getattr(user, 'is_authenticated', False):
        return ''

    query_tokens = _tokens(query)
    memory_lines = [
        f'- [{memory.kind}] {memory.content}'
        for memory in AssistantMemoryEntry.objects.filter(user=user, is_active=True)
        .order_by('-updated_at')[:30]
    ]

    scored_messages = []
    prior_messages = (
        AssistantMessage.objects.filter(conversation__user=user, role='user')
        .select_related('conversation')
        .order_by('-created_at')[:300]
    )
    for message in prior_messages:
        overlap = len(query_tokens & _tokens(message.content))
        if overlap:
            scored_messages.append((overlap, message.created_at, message.content))
    scored_messages.sort(key=lambda item: (item[0], item[1]), reverse=True)

    relevant_lines = [
        f'- {content}' for _, _, content in scored_messages[:MAX_RETRIEVED_MESSAGES]
    ]
    if not memory_lines and not relevant_lines:
        return ''

    sections = []
    if memory_lines:
        sections.append('Thông tin người dùng đã yêu cầu ghi nhớ:\n' + '\n'.join(memory_lines))
    if relevant_lines:
        sections.append('Các phát biểu trước đây có liên quan:\n' + '\n'.join(relevant_lines))
    return '\n\n'.join(sections)[:MAX_MEMORY_CONTEXT_CHARS]
