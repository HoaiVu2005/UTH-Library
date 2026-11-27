"""Vietnamese text normalization helpers for deterministic intent routing."""

import re
import unicodedata


def normalize_vietnamese_text(value: str) -> str:
    """Normalize accents, punctuation and spacing while preserving word order."""
    text = unicodedata.normalize('NFD', (value or '').lower())
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
    text = text.replace('đ', 'd')
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = re.sub(r'\s+', ' ', text).strip().split()
    chat_aliases = {
        'ntn': ('nhu', 'the', 'nao'),
        'dc': ('duoc',),
        'ko': ('khong',),
        'k': ('khong',),
        'kh': ('khong',),
    }
    expanded = []
    for token in tokens:
        expanded.extend(chat_aliases.get(token, (token,)))
    return ' '.join(expanded)


def contains_any_phrase(value: str, phrases) -> bool:
    normalized = normalize_vietnamese_text(value)
    return any(normalize_vietnamese_text(phrase) in normalized for phrase in phrases)
