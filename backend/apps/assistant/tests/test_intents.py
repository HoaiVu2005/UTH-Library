from django.test import TestCase

from apps.assistant.AI.intents import resolve_intent_message
from apps.assistant.models import AssistantIntentExample


class IntentResolutionTests(TestCase):
    def test_equal_fuzzy_scores_do_not_compare_model_instances(self):
        common = 'mot hai ba bon nam sau bay tam chin'
        AssistantIntentExample.objects.create(
            role='any', intent='borrow_guide', utterance=f'{common} muoi',
        )
        AssistantIntentExample.objects.create(
            role='any', intent='renew_guide', utterance=f'{common} mottram',
        )

        resolved = resolve_intent_message(f'{common} khac', role='student')

        self.assertIn(resolved, {'cách mượn sách', 'cách gia hạn sách'})
