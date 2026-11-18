from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_deaccessionbatch_copy_deaccession_batch_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='deaccessionbatch',
            name='bgh_decision_number',
            field=models.CharField(blank=True, help_text='Số quyết định phê duyệt BGH (VD: 125/QĐ-ĐHGTVT-BGH)', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='deaccessionbatch',
            name='bgh_decision_date',
            field=models.DateField(blank=True, help_text='Ngày ký QĐ phê duyệt BGH', null=True),
        ),
        migrations.AddField(
            model_name='deaccessionbatch',
            name='bgh_approver_name',
            field=models.CharField(blank=True, help_text='Người ký duyệt BGH (VD: PGS.TS Nguyễn Xuân Phương - Hiệu trưởng)', max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='deaccessionbatch',
            name='disposal_method',
            field=models.CharField(blank=True, default='Tiêu hủy phân loại sinh học', help_text='Phương thức xử lý tài sản thanh lý', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='deaccessionbatch',
            name='approval_note',
            field=models.TextField(blank=True, help_text='Ý kiến / Căn cứ phê duyệt của BGH', null=True),
        ),
    ]

