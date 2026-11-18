import json
import importlib
from unittest.mock import MagicMock, patch

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.assistant.AI import (
    call_gemini_api,
    classify_chat_mode,
    compact_simple_reply,
    get_conversation_tone,
    get_generation_max_output_tokens,
    get_ai_role_profile,
    normalize_assistant_voice,
)


class ChatModeTests(APITestCase):
    def test_ai_is_a_package_split_by_responsibility(self):
        ai_package = importlib.import_module('apps.assistant.AI')

        self.assertTrue(hasattr(ai_package, '__path__'))
        for module_name in [
            'books',
            'fallback',
            'gemini',
            'memory',
            'operations',
            'patrons',
            'roles',
            'routing',
        ]:
            importlib.import_module(f'apps.assistant.AI.{module_name}')

    def test_routes_casual_food_chat_away_from_library_search(self):
        self.assertEqual(classify_chat_mode('tao muốn ăn cơm tấm'), 'conversation')

    def test_routes_library_and_account_questions_to_grounded_modes(self):
        self.assertEqual(classify_chat_mode('Gợi ý giáo trình Python'), 'library')
        self.assertEqual(classify_chat_mode('Sách của tôi khi nào hết hạn?'), 'library')

    def test_routes_nearby_venue_questions_to_campus_life_instead_of_address_lookup(self):
        self.assertEqual(
            classify_chat_mode('Có quán trà sữa nào gần cơ sở 1 không?'),
            'campus_life',
        )


class AIRoleProfileTests(APITestCase):
    def test_student_profile_uses_student_borrowing_policy(self):
        profile = get_ai_role_profile('student')

        self.assertEqual(profile.key, 'student')
        self.assertEqual(profile.borrow_limit, 5)
        self.assertEqual(profile.borrow_days, 14)
        self.assertIn('giáo trình', profile.library_priority.lower())

    def test_lecturer_profile_uses_lecturer_borrowing_policy(self):
        profile = get_ai_role_profile('lecturer')

        self.assertEqual(profile.key, 'lecturer')
        self.assertEqual(profile.borrow_limit, 10)
        self.assertEqual(profile.borrow_days, 30)
        self.assertIn('nghiên cứu', profile.library_priority.lower())

    def test_staff_profile_prioritizes_library_operations(self):
        profile = get_ai_role_profile('student', is_staff=True)

        self.assertEqual(profile.key, 'admin')
        self.assertIsNone(profile.borrow_limit)
        self.assertIsNone(profile.borrow_days)
        self.assertIn('nghiệp vụ', profile.library_priority.lower())


class AssistantVoiceTests(APITestCase):
    def test_removes_repeated_generic_greeting_after_conversation_has_started(self):
        reply = 'Chào bạn! Mình nghe đây. Khu Võ Oanh có nhiều lựa chọn trà sữa.'

        self.assertEqual(
            normalize_assistant_voice(reply, has_history=True),
            'Khu Võ Oanh có nhiều lựa chọn trà sữa.',
        )

    def test_removes_listening_filler_before_the_actual_answer(self):
        reply = 'Mình đang nghe đây. Chọn cơm tấm nếu bạn muốn no lâu.'

        self.assertEqual(
            normalize_assistant_voice(reply, has_history=True),
            'Chọn cơm tấm nếu bạn muốn no lâu.',
        )

    def test_keeps_a_natural_answer_that_does_not_start_with_a_scripted_greeting(self):
        reply = 'Có chứ. Đi dọc Nguyễn Gia Trí là dễ tìm nhất.'

        self.assertEqual(normalize_assistant_voice(reply, has_history=True), reply)

    def test_short_casual_question_uses_a_small_token_budget(self):
        self.assertEqual(
            get_generation_max_output_tokens('Cơm tấm hay bún bò?', 'conversation'),
            180,
        )

    def test_detailed_explanation_keeps_enough_room_for_a_complete_answer(self):
        self.assertEqual(
            get_generation_max_output_tokens(
                'Giải thích chi tiết cách hoạt động của thuật toán Dijkstra và cho ví dụ',
                'conversation',
            ),
            1200,
        )

    def test_compacts_a_verbose_casual_reply_to_two_direct_sentences(self):
        reply = (
            'Nếu muốn no lâu thì chọn cơm tấm. '
            'Nếu thích món nóng có nước thì chọn bún bò. '
            'Bạn đang nghiêng về món nào hơn và có muốn mình phân tích thêm không?'
        )

        self.assertEqual(
            compact_simple_reply(reply, 'Cơm tấm hay bún bò?', is_admin=False),
            'Nếu muốn no lâu thì chọn cơm tấm. Nếu thích món nóng có nước thì chọn bún bò.',
        )

    def test_remembers_an_explicit_tao_may_tone_preference_from_history(self):
        history = [
            {'sender': 'user', 'text': 'Mày nói chuyện thoải mái với tao đi, cứ tao mày nhé'},
            {'sender': 'ai', 'text': 'Ừ, được.'},
        ]

        self.assertEqual(get_conversation_tone(history, 'Giờ chọn món nào?'), 'peer')

class GeminiLatencyBudgetTests(APITestCase):
    @patch('apps.assistant.AI.gemini.urllib.request.urlopen')
    def test_gemini_request_has_a_short_server_timeout_and_bounded_context(self, urlopen_mock):
        response = MagicMock()
        response.read.return_value = json.dumps({
            'candidates': [{'content': {'parts': [{'text': 'Phản hồi nhanh'}]}}],
        }).encode('utf-8')
        urlopen_mock.return_value.__enter__.return_value = response
        history = [
            {'sender': 'user' if index % 2 == 0 else 'ai', 'text': f'Lượt {index}'}
            for index in range(12)
        ]

        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key'}):
            result = call_gemini_api('Câu hỏi mới', history, [])

        self.assertEqual(result, 'Phản hồi nhanh')
        self.assertEqual(urlopen_mock.call_args.kwargs['timeout'], 10)
        request = urlopen_mock.call_args.args[0]
        payload = json.loads(request.data.decode('utf-8'))
        self.assertEqual(payload['generationConfig']['maxOutputTokens'], 180)
        self.assertEqual(len(payload['contents']), 9)  # 8 history turns + current message
        self.assertEqual(payload['contents'][0]['parts'][0]['text'], 'Lượt 4')

    @patch('apps.assistant.AI.gemini.urllib.request.urlopen')
    def test_library_questions_receive_the_highest_grounding_priority(self, urlopen_mock):
        response = MagicMock()
        response.read.return_value = json.dumps({
            'candidates': [{'content': {'parts': [{'text': 'Trả lời thư viện'}]}}],
        }).encode('utf-8')
        urlopen_mock.return_value.__enter__.return_value = response

        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key'}):
            call_gemini_api('Sách của tôi khi nào phải trả?', [], [])

        payload = json.loads(urlopen_mock.call_args.args[0].data.decode('utf-8'))
        system_prompt = payload['system_instruction']['parts'][0]['text']
        self.assertIn('ƯU TIÊN CAO NHẤT', system_prompt)
        self.assertIn('không bịa', system_prompt.lower())

    @patch('apps.assistant.AI.gemini.urllib.request.urlopen')
    def test_casual_questions_are_answered_lightly_without_forcing_library_context(self, urlopen_mock):
        response = MagicMock()
        response.read.return_value = json.dumps({
            'candidates': [{'content': {'parts': [{'text': 'Trả lời vui vẻ'}]}}],
        }).encode('utf-8')
        urlopen_mock.return_value.__enter__.return_value = response

        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key'}):
            call_gemini_api('Hôm nay ăn gì?', [], [])

        payload = json.loads(urlopen_mock.call_args.args[0].data.decode('utf-8'))
        system_prompt = payload['system_instruction']['parts'][0]['text']
        self.assertIn('TRẢ LỜI VUI VẺ', system_prompt)
        self.assertNotIn('ƯU TIÊN CAO NHẤT', system_prompt)


class AIChatViewTests(APITestCase):
    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_van_lang_stereotype_question_is_not_misclassified_as_food_because_van_contains_an(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': (
                    'Trường Hutech với Văn Lang được gọi là vựa rau vì có nhiều '
                    'nữ sinh đi cặp đại gia đúng không?'
                ),
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('định kiến', response.data['reply'].lower())
        self.assertNotIn('đang đói', response.data['reply'].lower())

    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_correction_after_a_wrong_food_reply_recovers_from_the_user_question(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Sao tôi hỏi một đằng bạn trả lời một nẻo rồi?',
                'history': [
                    {
                        'sender': 'user',
                        'text': 'Hutech với Văn Lang có phải vựa rau không?',
                    },
                    {
                        'sender': 'ai',
                        'text': 'Nghe là biết đang đói rồi. Bạn đang thèm món gì?',
                    },
                ],
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('định kiến', response.data['reply'].lower())
        self.assertNotIn('đang đói', response.data['reply'].lower())

    @patch('apps.assistant.views.get_admin_library_statistics', return_value={
        'unpaid_fines_count': 2,
        'total_unpaid_amount': 217000,
    })
    @patch('apps.assistant.views.call_gemini_api', return_value='Bạn vui lòng mang thẻ đến quầy thủ thư.')
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_staff_fine_collection_intent_returns_direct_management_action(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
        _get_admin_stats_mock,
    ):
        staff = User.objects.create_user(
            username='fine_staff',
            password='test-password',
            full_name='Thủ thư kiểm thử',
            card_code='STAFF_FINE_TEST',
            role='admin',
            is_staff=True,
        )
        self.client.force_authenticate(staff)

        response = self.client.post(
            reverse('ai-chat'),
            {'message': 'nộp phạt', 'user_role': 'admin'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('quét/nhập mã thẻ', response.data['reply'])
        self.assertEqual(response.data['suggested_tab'], 'fines')
        self.assertEqual(response.data['action'], {
            'label': 'Mở quầy thu phạt',
            'path': '/admin/fines?mode=collect',
        })

    @patch('apps.assistant.views.get_patron_context', return_value={
        'name': 'Sinh viên kiểm thử',
        'role': 'student',
        'card_code': 'SV_FINE_TEST',
        'active_loans_count': 0,
        'unpaid_fines_count': 2,
        'unpaid_amount': 217000,
    })
    @patch('apps.assistant.views.call_gemini_api', return_value='Hãy quét mã sinh viên tại quầy.')
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_student_fine_intent_uses_personal_payment_action_not_staff_workflow(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
        _get_patron_context_mock,
    ):
        student = User.objects.create_user(
            username='fine_student',
            password='test-password',
            full_name='Sinh viên kiểm thử',
            card_code='SV_FINE_TEST',
            role='student',
        )
        self.client.force_authenticate(student)

        response = self.client.post(
            reverse('ai-chat'),
            {'message': 'tôi có bị phạt không?', 'user_role': 'admin'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('217.000', response.data['reply'])
        self.assertNotIn('quét/nhập mã thẻ', response.data['reply'])
        self.assertEqual(response.data['action'], {
            'label': 'Xem và nộp phạt',
            'path': '/fines',
        })
        self.assertIsNone(response.data['suggested_tab'])

    @patch('apps.assistant.views.get_patron_context', return_value={
        'name': 'Phong',
        'role': 'student',
        'card_code': 'SV_ZERO_FINE',
        'active_loans_count': 0,
        'unpaid_fines_count': 0,
        'unpaid_amount': 0,
    })
    @patch('apps.assistant.views.call_gemini_api', return_value='Không có phạt.')
    @patch('apps.assistant.views.query_relevant_books', return_value=[
        {'title': 'Kiến trúc Microservices', 'authors': 'Martin Fowler', 'category': 'CNTT', 'available_copies': 8, 'total_copies': 8}
    ])
    def test_student_fine_inquiry_and_payment_consistency_without_book_cards(
        self,
        query_relevant_books_mock,
        _call_gemini_api_mock,
        _get_patron_context_mock,
    ):
        student = User.objects.create_user(
            username='zero_fine_student',
            password='test-password',
            full_name='Phong',
            card_code='SV_ZERO_FINE',
            role='student',
        )
        self.client.force_authenticate(student)

        # 1. Tra cứu "mình đang có phạt nợ nào không"
        resp1 = self.client.post(
            reverse('ai-chat'),
            {'message': 'mình đang có phạt nợ nào không', 'user_role': 'student'},
            format='json',
        )
        self.assertEqual(resp1.status_code, 200)
        self.assertIn('hiện không có khoản phạt nào chưa thanh toán', resp1.data['reply'])
        self.assertEqual(resp1.data['suggested_books'], [])
        self.assertEqual(resp1.data['action'], {
            'label': 'Xem lịch sử tiền phạt',
            'path': '/fines',
        })

        # 2. Thao tác "thanh toán phạt"
        resp2 = self.client.post(
            reverse('ai-chat'),
            {'message': 'thanh toán phạt', 'user_role': 'student'},
            format='json',
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertIn('hiện không có khoản phạt nào chưa thanh toán', resp2.data['reply'])
        self.assertEqual(resp2.data['suggested_books'], [])
        self.assertEqual(resp2.data['action'], {
            'label': 'Xem lịch sử tiền phạt',
            'path': '/fines',
        })
        # Query books should never be called when workflow is active
        query_relevant_books_mock.assert_not_called()

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

    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_nearby_place_fallback_answers_the_place_intent_instead_of_repeating_the_address(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Có quán trà sữa nào gần cơ sở 1 không?',
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('trà sữa', response.data['reply'].lower())
        self.assertIn('bản đồ', response.data['reply'].lower())
        self.assertNotEqual(
            response.data['reply'],
            'Cơ sở 1 (Trụ sở chính) của UTH tọa lạc tại số 2 đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM.',
        )

    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_fallback_uses_food_context_and_makes_a_concise_choice(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Chưa biết nữa, đang phân vân',
                'history': [
                    {'sender': 'user', 'text': 'Cơm tấm hay bún bò, bạn chọn cái nào?'},
                    {'sender': 'ai', 'text': 'Cả hai đều ổn.'},
                ],
                'user_role': 'student',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('cơm tấm', response.data['reply'].lower())
        self.assertLessEqual(len(response.data['reply'].split()), 35)
        self.assertNotIn('mình đang nghe đây', response.data['reply'].lower())

    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_tone_change_request_takes_priority_over_the_previous_food_topic(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Mày nói chuyện thoải mái với tao được không, cứ tao mày đi',
                'history': [
                    {'sender': 'user', 'text': 'Cơm tấm hay bún bò?'},
                    {'sender': 'ai', 'text': 'Chọn cơm tấm.'},
                ],
                'user_role': 'student',
            },
            format='json',
        )

        reply = response.data['reply'].lower()
        self.assertEqual(response.status_code, 200)
        self.assertIn('tao', reply)
        self.assertIn('mày', reply)
        self.assertNotIn('cơm tấm', reply)

    @patch('apps.assistant.views.call_gemini_api', return_value=None)
    @patch('apps.assistant.views.query_relevant_books', return_value=[])
    def test_fallback_keeps_tao_may_preference_on_the_next_turn(
        self,
        _query_relevant_books_mock,
        _call_gemini_api_mock,
    ):
        response = self.client.post(
            reverse('ai-chat'),
            {
                'message': 'Vậy chốt món nào?',
                'history': [
                    {'sender': 'user', 'text': 'Cơm tấm hay bún bò?'},
                    {'sender': 'user', 'text': 'Cứ xưng tao mày đi'},
                    {'sender': 'ai', 'text': 'Ừ, được.'},
                ],
                'user_role': 'student',
            },
            format='json',
        )

        reply = response.data['reply'].lower()
        self.assertIn('mày', reply)
        self.assertIn('cơm tấm', reply)

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
