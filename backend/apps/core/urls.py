from django.urls import path
from .views import (
    PublicSystemConfigView,
    AdminSystemConfigView,
    PolicyListView,
    PolicyUpdateView,
    HolidayListView,
)

urlpatterns = [
    path('system/config/public', PublicSystemConfigView.as_view(), name='system-config-public'),
    path('system/config', AdminSystemConfigView.as_view(), name='system-config-admin'),
    path('policies', PolicyListView.as_view(), name='policy-list'),
    path('policies/<str:role>', PolicyUpdateView.as_view(), name='policy-update'),
    path('holidays', HolidayListView.as_view(), name='holiday-list'),
]

