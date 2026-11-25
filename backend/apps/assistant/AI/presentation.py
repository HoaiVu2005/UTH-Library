import re
from datetime import datetime

import pytz
from django.utils import timezone

from .config import GEMINI_MAX_OUTPUT_TOKENS
from .routing import classify_chat_mode

# Chuẩn hóa giọng văn, độ dài và cách trình bày câu trả lời.

def sanitize_ai_reply(reply: str) -> str:
    """
    Loại bỏ các chuỗi JSON hoặc action do LLM tự sinh (ví dụ {"action": "show_book_cards", ...})
    để tránh hiển thị rác kỹ thuật trên bong bóng chat của người dùng.
    """
    if not reply:
        return reply

    # 1. Loại bỏ các khối code json markdown: ```json { ... } ```
    reply = re.sub(r'```(?:json)?\s*\{[\s\S]*?\}\s*```', '', reply, flags=re.IGNORECASE)

    # 2. Loại bỏ các đoạn JSON đơn dòng hoặc đa dòng chứa action/book_ids/suggested_books/command
    reply = re.sub(r'\{[\s\r\n]*"(?:action|book_ids|suggested_books|command)"[\s\S]*?\}', '', reply, flags=re.IGNORECASE)

    # 3. Chuẩn hóa lại các dòng trống thừa sau khi xóa
    reply = re.sub(r'\n{3,}', '\n\n', reply).strip()
    return reply


def normalize_assistant_voice(reply: str, has_history: bool = False) -> str:
    """Remove scripted re-introductions once a conversation is underway and clean technical markup."""
    if not reply:
        return reply

    cleaned = sanitize_ai_reply(reply)
    if not has_history:
        return cleaned

    greeting_patterns = [
        r'^(?:chào|xin chào)\s+(?:bạn|thầy/?cô)[!,.:–\-\s]*',
        r'^mình\s+(?:là\s+uthie\s+)?(?:đang\s+)?(?:nghe đây|đây)[!,.:–\-\s]*',
        r'^uthie\s+(?:đây|nghe đây)[!,.:–\-\s]*',
    ]
    for _ in range(3):
        previous = cleaned
        for pattern in greeting_patterns:
            cleaned = re.sub(pattern, '', cleaned, count=1, flags=re.IGNORECASE).lstrip()
        if cleaned == previous:
            break
    return cleaned or reply.strip()


def get_conversation_tone(history: list, user_message: str) -> str:
    recent_text = ' '.join(
        str(item.get('text', '')) for item in (history or [])[-8:]
        if isinstance(item, dict)
    )
    combined = f'{recent_text} {user_message}'.lower()
    peer_markers = [
        'tao mày', 'mày tao', 'xưng tao', 'xưng mày', 'cứ tao', 'cứ mày',
        'nói chuyện thoải mái với tao',
    ]
    return 'peer' if any(marker in combined for marker in peer_markers) else 'default'


def is_simple_conversation_query(user_message: str, chat_mode: str) -> bool:
    if chat_mode != 'conversation' or len(user_message.strip()) > 80:
        return False
    msg = user_message.lower()
    detailed_markers = [
        'giải thích', 'phân tích', 'chi tiết', 'hướng dẫn', 'so sánh', 'tại sao',
        'như thế nào', 'lập kế hoạch', 'viết code', 'đánh giá', 'tóm tắt tài liệu',
        'nói chuyện', 'tâm sự', 'kể', 'nghĩ sao', 'vựa rau', 'đại gia', 'định kiến',
        '1 đằng', 'một đằng', '1 nẻo', 'một nẻo', 'lạc đề', 'sai rồi', 'thế nào',
        'quan điểm', 'chia sẻ', 'cảm nghĩ', 'vui vẻ', 'tám', 'chém gió', 'nghĩ gì',
        'hả', 'ủa', 'gì cơ', 'sao vậy', 'sao thế',
    ]
    return not any(marker in msg for marker in detailed_markers)


def get_generation_max_output_tokens(user_message: str, chat_mode: str) -> int:
    if is_simple_conversation_query(user_message, chat_mode):
        return 180
    if chat_mode == 'campus_life':
        return 360
    if chat_mode == 'operations':
        return 650
    return GEMINI_MAX_OUTPUT_TOKENS


def compact_simple_reply(reply: str, user_message: str, is_admin: bool = False) -> str:
    chat_mode = classify_chat_mode(user_message, is_admin=is_admin)
    if not reply or not is_simple_conversation_query(user_message, chat_mode):
        return reply

    normalized = re.sub(r'\s+', ' ', reply).strip()
    sentences = re.split(r'(?<=[.!?])\s+', normalized)
    selected = []
    word_count = 0
    for sentence in sentences:
        sentence_words = sentence.split()
        if selected and (len(selected) >= 2 or word_count + len(sentence_words) > 60):
            break
        if not selected and len(sentence_words) > 60:
            return ' '.join(sentence_words[:60]).rstrip(' ,;:') + '…'
        selected.append(sentence)
        word_count += len(sentence_words)
    return ' '.join(selected).strip() or normalized

def get_current_vietnam_time_str() -> str:
    tz = pytz.timezone('Asia/Ho_Chi_Minh')
    now = datetime.now(tz)
    weekday_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
    weekday = weekday_names[now.weekday()]
    return f"{weekday}, ngày {now.day:02d}/{now.month:02d}/{now.year} (giờ hiện tại: {now.strftime('%H:%M')})"
