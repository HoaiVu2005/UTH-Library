from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.assistant.services import classify_chat_mode


class ChatModeTests(APITestCase):
    def test_routes_casual_food_chat_away_from_library_search(self):
        self.assertEqual(classify_chat_mode('tao muốn ăn cơm tấm'), 'conversation')

    def test_routes_library_and_account_questions_to_grounded_modes(self):
        self.assertEqual(classify_chat_mode('Gợi ý giáo trình Python'), 'library')
        self.assertEqual(classify_chat_mode('Sách của tôi khi nào hết hạn?'), 'library')


class AIChatViewTests(APITestCase):
    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_casual_chat_fallback_stays_on_topic_without_library_pitch(
        self,
        query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {'message': 'tao muốn ăn cơm tấm', 'user_role': 'student'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('cơm tấm', response.data['reply'].lower())
        self.assertNotIn('giáo trình', response.data['reply'].lower())
        self.assertEqual(response.data['suggested_books'], [])
        query_relevant_books_mock.assert_not_called()

    @patch('apps.assistant.views.call_gemini_api', return_value='Câu trả lời chung')
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_unrelated_question_does_not_query_or_suggest_books(
        self,
        query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Làm sao để đổi mật khẩu Instagram?',
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['suggested_books'], [])
        query_relevant_books_mock.assert_not_called()

    @patch('apps.assistant.views.call_gemini_api', return_value='Danh sách tài liệu')
    @patch('apps.assistant.views.query_relevant_books', return_value=[{'id': 1}])
    def test_book_question_queries_and_returns_suggestions(
        self,
        query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Gợi ý giáo trình lập trình Python',
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['suggested_books'], [{'id': 1}])
        query_relevant_books_mock.assert_called_once()
