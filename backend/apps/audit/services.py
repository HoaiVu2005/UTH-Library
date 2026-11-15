from .models import AuditLog

def log_action(user=None, action=None, entity_type=None, entity_id=None, detail=None, ip_address=None, user_agent=None, request=None):
    if request:
        if not user and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
        if not ip_address:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
        if not user_agent:
            user_agent = request.META.get('HTTP_USER_AGENT', '')

    safe_detail = detail or {}
    # Convert non-serializable objects if any
    clean_detail = {}
    for k, v in safe_detail.items():
        if isinstance(v, (str, int, float, bool, list, dict)) or v is None:
            clean_detail[k] = v
        else:
            clean_detail[k] = str(v)

    return AuditLog.objects.create(
        user=user,
        action=action or 'UNKNOWN',
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        detail=clean_detail,
        ip_address=ip_address,
        user_agent=user_agent[:500] if user_agent else None
    )

