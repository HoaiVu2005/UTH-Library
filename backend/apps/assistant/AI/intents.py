"""Database-backed Vietnamese intent examples for deterministic workflows."""

from difflib import SequenceMatcher

from apps.assistant.models import AssistantIntentExample

from .language import normalize_vietnamese_text


CANONICAL_INTENT_MESSAGES = {
    'borrow_guide': 'cách mượn sách',
    'borrow_policy': 'chính sách mượn sách',
    'loan_status': 'sách của tôi',
    'renew_guide': 'cách gia hạn sách',
    'return_guide': 'cách trả sách',
    'overdue_policy': 'nếu quá hạn trả sách thì sao',
    'reservation_status': 'sách tôi đặt trước đến đâu',
    'fine_status': 'tiền phạt của tôi',
}


def resolve_intent_message(user_message: str, *, role: str = 'student') -> str:
    """Return a canonical phrase for an exact or very high-confidence example."""
    normalized = normalize_vietnamese_text(user_message)
    if not normalized:
        return user_message

    examples = AssistantIntentExample.objects.filter(
        role__in=('any', role),
        is_active=True,
    )
    exact = examples.filter(normalized_text=normalized).order_by('-is_hard_negative', '-role').first()
    if exact:
        example = exact
    else:
        input_tokens = set(normalized.split())
        candidates = []
        for candidate in examples.iterator():
            candidate_tokens = set(candidate.normalized_text.split())
            if len(candidate_tokens) < 4:
                continue
            token_coverage = len(input_tokens & candidate_tokens) / len(candidate_tokens)
            sequence_score = SequenceMatcher(None, normalized, candidate.normalized_text).ratio()
            if token_coverage >= 0.9 and sequence_score >= 0.88:
                candidates.append((sequence_score, candidate.role == role, candidate.is_hard_negative, candidate))
        example = max(candidates, default=(None, None, None, None))[-1]
    if not example or example.is_hard_negative:
        return user_message
    return CANONICAL_INTENT_MESSAGES.get(example.intent, user_message)
