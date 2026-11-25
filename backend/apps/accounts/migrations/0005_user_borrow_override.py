from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_studentroster_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='borrow_override_reason',
            field=models.TextField(
                blank=True,
                null=True,
                verbose_name='Lý do cho phép mượn ngoại lệ',
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='borrow_override_until',
            field=models.DateTimeField(
                blank=True,
                null=True,
                verbose_name='Cho phép mượn ngoại lệ đến',
            ),
        ),
    ]
