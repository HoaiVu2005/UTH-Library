"""Public API for the UTHie assistant domain.

Implementation is split by responsibility so callers can keep importing from
``apps.assistant.AI`` without depending on internal module layout.
"""

from .fallback import generate_smart_fallback
from .actions import get_fine_workflow_action
from .gemini import call_gemini_api
from .books import query_relevant_books
from .memory import (
    build_long_term_memory_context,
    record_conversation_turn,
    remember_explicit_user_facts,
)
from .presentation import (
    compact_simple_reply,
    get_conversation_tone,
    get_generation_max_output_tokens,
    normalize_assistant_voice,
)
from .operations import get_admin_library_statistics, send_overdue_notice_to_student
from .patrons import get_patron_context
from .routing import classify_chat_mode, is_admin_query, is_book_query_intent
from .roles import AIRoleProfile, get_ai_role_profile

__all__ = [
    'build_long_term_memory_context',
    'call_gemini_api',
    'classify_chat_mode',
    'compact_simple_reply',
    'generate_smart_fallback',
    'get_fine_workflow_action',
    'get_admin_library_statistics',
    'get_ai_role_profile',
    'get_conversation_tone',
    'get_generation_max_output_tokens',
    'get_patron_context',
    'is_admin_query',
    'is_book_query_intent',
    'normalize_assistant_voice',
    'query_relevant_books',
    'record_conversation_turn',
    'remember_explicit_user_facts',
    'send_overdue_notice_to_student',
    'AIRoleProfile',
]
