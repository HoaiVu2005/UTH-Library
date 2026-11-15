from django.urls import path
from .views import (
    MySuggestionsView,
    AdminSuggestionListView,
    ApproveSuggestionView,
    RejectSuggestionView,
    ReceiveSuggestionView,
)

urlpatterns = [
    path('suggestions', AdminSuggestionListView.as_view(), name='suggestion-list'),
    path('suggestions/me', MySuggestionsView.as_view(), name='suggestion-me'),
    path('suggestions/<int:pk>/approve', ApproveSuggestionView.as_view(), name='suggestion-approve'),
    path('suggestions/<int:pk>/reject', RejectSuggestionView.as_view(), name='suggestion-reject'),
    path('suggestions/<int:pk>/receive', ReceiveSuggestionView.as_view(), name='suggestion-receive'),
]
