import json
import logging
import re
from datetime import datetime, timezone

EMAIL_REGEX = re.compile(r'([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)')
PHONE_REGEX = re.compile(r'(\d{3})\d{4}(\d{3,4})')

def mask_sensitive_data(text: str) -> str:
    if not isinstance(text, str):
        return text
    # Mask email: h***@domain.com
    text = EMAIL_REGEX.sub(r'\1***@\2', text)
    # Mask phone: 091****123
    text = PHONE_REGEX.sub(r'\1****\2', text)
    return text

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname,
            'name': record.name,
            'message': mask_sensitive_data(record.getMessage()),
        }
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        if record.exc_info:
            log_record['exc_info'] = self.formatException(record.exc_info)
        return json.dumps(log_record, ensure_ascii=False)

