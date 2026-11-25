from django.db import migrations
from django.db.models import F, Q
from django.utils import timezone


def merge_reservation_locks(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    now = timezone.now()

    # Preserve every active legacy no-show lock as the single borrowing lock.
    User.objects.filter(reservation_locked_until__gt=now).update(
        is_locked=True,
        lock_reason='no_show_threshold',
        locked_until=F('reservation_locked_until'),
    )

    # Expired legacy locks carry no active permission restriction.
    User.objects.filter(
        Q(reservation_locked_until__isnull=False),
        reservation_locked_until__lte=now,
        is_locked=False,
    ).update(locked_until=None)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_user_borrow_override'),
    ]

    operations = [
        migrations.RunPython(merge_reservation_locks, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='user',
            name='reservation_locked_until',
        ),
    ]
