from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from unittest.mock import patch

from apps.accounts.models import User
from apps.assistant.AI import (
    build_long_term_memory_context,
    record_conversation_turn,
    remember_explicit_user_facts,
)
from apps.assistant.models import AssistantConversation, AssistantMemoryEntry, AssistantMessage


class AssistantLongTermMemoryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='memory-student',
            password='Password123',
            full_name='Sinh viên Memory',
            card_code='MEMORY001',
        )
        self.other_user = User.objects.create_user(
            username='other-student',
            password='Password123',
            full_name='Sinh viên Khác',
            card_code='MEMORY002',
        )

    def test_records_conversation_by_user_and_client_session(self):
        record_conversation_turn(
            user=self.user,
            client_session_id='session-a',
            user_message='Tao thích đọc sách AI.',
            assistant_reply='Tao nhớ rồi.',
        )

        conversation = AssistantConversation.objects.get(user=self.user)
        self.assertEqual(conversation.client_session_id, 'session-a')
        self.assertEqual(
            list(conversation.messages.values_list('role', 'content')),
            [('user', 'Tao thích đọc sách AI.'), ('assistant', 'Tao nhớ rồi.')],
        )

    def test_extracts_only_explicit_memory_requests_and_deduplicates_them(self):
        remember_explicit_user_facts(self.user, 'Nhớ là tao thích sách trí tuệ nhân tạo nhé')
        remember_explicit_user_facts(self.user, 'Nhớ là tao thích sách trí tuệ nhân tạo nhé')
        remember_explicit_user_facts(self.user, 'Hôm nay trời mưa')

        memories = list(AssistantMemoryEntry.objects.filter(user=self.user))
        self.assertEqual(len(memories), 1)
        self.assertIn('thích sách trí tuệ nhân tạo', memories[0].content.lower())

    def test_retrieves_relevant_memory_without_leaking_another_users_data(self):
        AssistantMemoryEntry.objects.create(
            user=self.user,
            kind='preference',
            content='Tao thích tài liệu AI và Machine Learning.',
            normalized_content='tao thích tài liệu ai và machine learning',
        )
        AssistantMemoryEntry.objects.create(
            user=self.other_user,
            kind='preference',
            content='Người dùng này thích tài liệu Logistics.',
            normalized_content='người dùng này thích tài liệu logistics',
        )

        context = build_long_term_memory_context(self.user, 'Gợi ý sách AI cho tao')

        self.assertIn('Machine Learning', context)
        self.assertNotIn('Logistics', context)

    def test_retrieves_relevant_prior_messages_across_different_sessions(self):
        old_conversation = AssistantConversation.objects.create(
            user=self.user,
            client_session_id='old-session',
            title='Đồ án tốt nghiệp',
        )
        AssistantMessage.objects.create(
            conversation=old_conversation,
            role='user',
            content='Đồ án của tao dùng Python để nhận diện biển số xe.',
        )

        context = build_long_term_memory_context(self.user, 'Nhắc lại đồ án Python của tao')

        self.assertIn('nhận diện biển số xe', context)

    def test_memory_is_bounded_per_user(self):
        for index in range(105):
            AssistantMemoryEntry.objects.create(
                user=self.user,
                kind='fact',
                content=f'Thông tin {index}',
                normalized_content=f'thông tin {index}',
            )

        remember_explicit_user_facts(self.user, 'Hãy nhớ mã sở thích cuối cùng là UTH-TEAL')

        self.assertLessEqual(AssistantMemoryEntry.objects.filter(user=self.user).count(), 100)
        self.assertTrue(
            AssistantMemoryEntry.objects.filter(user=self.user, content__icontains='UTH-TEAL').exists()
        )


class AssistantMemoryApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='memory-api-user',
            password='Password123',
            full_name='Memory API User',
            card_code='MEMAPI001',
        )
        self.client.force_authenticate(self.user)

    @patch('apps.assistant.views.call_gemini_api', return_value='Tao đã dùng bộ nhớ để trả lời.')
    def test_authenticated_chat_retrieves_memory_and_persists_the_turn(self, call_gemini_mock):
        AssistantMemoryEntry.objects.create(
            user=self.user,
            kind='preference',
            content='Người dùng thích sách Machine Learning.',
            normalized_content='nguoi dung thich sach machine learning',
        )

        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Gợi ý tài liệu phù hợp với sở thích của tao',
                'session_id': 'new-browser-session',
                'history': [],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('Machine Learning', call_gemini_mock.call_args.kwargs['memory_context'])
        conversation = AssistantConversation.objects.get(
            user=self.user,
            client_session_id='new-browser-session',
        )
        self.assertEqual(conversation.messages.count(), 2)

    @patch('apps.assistant.views.call_gemini_api', return_value='Tao nhớ rồi.')
    def test_explicit_remember_request_is_available_through_memory_api(self, _call_gemini_mock):
        self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Hãy nhớ là tao thích sách AI ứng dụng',
                'session_id': 'memory-write-session',
                'history': [],
            },
            format='json',
        )

        response = self.client.get(reverse('ai-memory'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 1)
        self.assertIn('AI ứng dụng', response.data['data'][0]['content'])

    def test_user_can_delete_all_personal_ai_memory(self):
        AssistantMemoryEntry.objects.create(
            user=self.user,
            kind='fact',
            content='Dữ liệu có thể xóa',
            normalized_content='du lieu co the xoa',
        )
        record_conversation_turn(
            self.user,
            'session-to-delete',
            'Nội dung cũ cần xóa',
            'Đã ghi nhận.',
        )

        response = self.client.delete(reverse('ai-memory'))

        self.assertEqual(response.status_code, 204)
        self.assertFalse(AssistantMemoryEntry.objects.filter(user=self.user).exists())
        self.assertFalse(AssistantConversation.objects.filter(user=self.user).exists())

    def test_anonymous_user_cannot_read_memory(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse('ai-memory'))

        self.assertEqual(response.status_code, 401)
