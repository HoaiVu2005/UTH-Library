from django.contrib import admin

from .models import AssistantIntentExample


@admin.register(AssistantIntentExample)
class AssistantIntentExampleAdmin(admin.ModelAdmin):
    list_display = ('utterance', 'intent', 'role', 'source', 'is_hard_negative', 'is_active')
    list_filter = ('intent', 'role', 'source', 'is_hard_negative', 'is_active')
    search_fields = ('utterance', 'normalized_text')
    readonly_fields = ('normalized_text',)
