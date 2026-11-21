from django.urls import path
from .views import (
    ActiveCampaignView,
    CampaignListView,
    CampaignDetailView,
    CommunitySuggestionListView,
    VoteSuggestionView,
    MySuggestionsView,
    AdminSuggestionListView,
    ApproveSuggestionView,
    RejectSuggestionView,
    ReceiveSuggestionView,
)

urlpatterns = [
    # Đợt khảo sát (Campaigns)
    path('suggestions/campaigns/active', ActiveCampaignView.as_view(), name='suggestion-campaign-active'),
    path('suggestions/campaigns', CampaignListView.as_view(), name='suggestion-campaign-list'),
    path('suggestions/campaigns/<int:pk>', CampaignDetailView.as_view(), name='suggestion-campaign-detail'),

    # Bảng nguyện vọng cộng đồng & Bình chọn ủng hộ (Community & Upvote)
    path('suggestions/community', CommunitySuggestionListView.as_view(), name='suggestion-community-list'),
    path('suggestions/<int:pk>/vote', VoteSuggestionView.as_view(), name='suggestion-vote'),

    # Đề xuất cá nhân & Quản trị
    path('suggestions', AdminSuggestionListView.as_view(), name='suggestion-list'),
    path('suggestions/me', MySuggestionsView.as_view(), name='suggestion-me'),
    path('suggestions/<int:pk>/approve', ApproveSuggestionView.as_view(), name='suggestion-approve'),
    path('suggestions/<int:pk>/reject', RejectSuggestionView.as_view(), name='suggestion-reject'),
    path('suggestions/<int:pk>/receive', ReceiveSuggestionView.as_view(), name='suggestion-receive'),
]
