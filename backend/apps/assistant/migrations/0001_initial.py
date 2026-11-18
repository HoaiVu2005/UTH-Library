from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name='AssistantConversation',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('client_session_id', models.CharField(max_length=120)),
                ('title', models.CharField(blank=True, default='', max_length=160)),
                ('last_message_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assistant_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'assistant_conversations'},
        ),
        migrations.CreateModel(
            name='AssistantMemoryEntry',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('kind', models.CharField(choices=[('fact', 'Fact'), ('preference', 'Preference'), ('instruction', 'Instruction')], default='fact', max_length=24)),
                ('content', models.TextField(max_length=1000)),
                ('normalized_content', models.CharField(max_length=1000)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assistant_memories', to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'assistant_memory_entries'},
        ),
        migrations.CreateModel(
            name='AssistantMessage',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('role', models.CharField(choices=[('user', 'User'), ('assistant', 'Assistant')], max_length=16)),
                ('content', models.TextField(max_length=8000)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='assistant.assistantconversation')),
            ],
            options={'db_table': 'assistant_messages', 'ordering': ['created_at', 'id']},
        ),
        migrations.AddConstraint(
            model_name='assistantconversation',
            constraint=models.UniqueConstraint(fields=('user', 'client_session_id'), name='uq_assistant_conversation_user_session'),
        ),
        migrations.AddConstraint(
            model_name='assistantmemoryentry',
            constraint=models.UniqueConstraint(fields=('user', 'normalized_content'), name='uq_assistant_memory_user_content'),
        ),
        migrations.AddIndex(model_name='assistantconversation', index=models.Index(fields=['user', '-last_message_at'], name='assistant_c_user_id_deae81_idx')),
        migrations.AddIndex(model_name='assistantmemoryentry', index=models.Index(fields=['user', 'is_active', '-updated_at'], name='assistant_m_user_id_2aabd0_idx')),
        migrations.AddIndex(model_name='assistantmessage', index=models.Index(fields=['conversation', '-created_at'], name='assistant_m_convers_e4d26f_idx')),
    ]
