from django.urls import path
from .views import (
    MyFinesView,
    FineListView,
    CollectFineView,
    WaiveFineView,
    PayFineOnlineView,
    PayAllFinesOnlineView,
)

urlpatterns = [
    path('fines/me', MyFinesView.as_view(), name='fine-me'),
    path('fines/me/', MyFinesView.as_view(), name='fine-me-slash'),
    path('fines/pay-all-online', PayAllFinesOnlineView.as_view(), name='fine-pay-all-online'),
    path('fines/pay-all-online/', PayAllFinesOnlineView.as_view(), name='fine-pay-all-online-slash'),
    path('fines', FineListView.as_view(), name='fine-list'),
    path('fines/', FineListView.as_view(), name='fine-list-slash'),
    path('fines/<int:pk>/collect', CollectFineView.as_view(), name='fine-collect'),
    path('fines/<int:pk>/collect/', CollectFineView.as_view(), name='fine-collect-slash'),
    path('fines/<int:pk>/waive', WaiveFineView.as_view(), name='fine-waive'),
    path('fines/<int:pk>/waive/', WaiveFineView.as_view(), name='fine-waive-slash'),
    path('fines/<int:pk>/pay-online', PayFineOnlineView.as_view(), name='fine-pay-online'),
    path('fines/<int:pk>/pay-online/', PayFineOnlineView.as_view(), name='fine-pay-online-slash'),
]

