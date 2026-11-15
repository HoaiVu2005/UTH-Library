from django.urls import path
from .views import (
    MyFinesView,
    FineListView,
    CollectFineView,
    WaiveFineView,
    PayFineOnlineView,
    PayAllFinesOnlineView,
    CheckFineStatusView,
    CheckAllFinesStatusView,
    SimulateBankTransferView,
    BankWebhookView,
)

urlpatterns = [
    path('fines/me', MyFinesView.as_view(), name='fine-me'),
    path('fines/me/', MyFinesView.as_view(), name='fine-me-slash'),
    path('fines/all-status', CheckAllFinesStatusView.as_view(), name='fine-all-status'),
    path('fines/all-status/', CheckAllFinesStatusView.as_view(), name='fine-all-status-slash'),
    path('fines/simulate-bank-transfer', SimulateBankTransferView.as_view(), name='fine-simulate-bank-transfer'),
    path('fines/simulate-bank-transfer/', SimulateBankTransferView.as_view(), name='fine-simulate-bank-transfer-slash'),
    path('fines/bank-webhook', BankWebhookView.as_view(), name='fine-bank-webhook'),
    path('fines/bank-webhook/', BankWebhookView.as_view(), name='fine-bank-webhook-slash'),
    path('fines/pay-all-online', PayAllFinesOnlineView.as_view(), name='fine-pay-all-online'),
    path('fines/pay-all-online/', PayAllFinesOnlineView.as_view(), name='fine-pay-all-online-slash'),
    path('fines', FineListView.as_view(), name='fine-list'),
    path('fines/', FineListView.as_view(), name='fine-list-slash'),
    path('fines/<int:pk>/collect', CollectFineView.as_view(), name='fine-collect'),
    path('fines/<int:pk>/collect/', CollectFineView.as_view(), name='fine-collect-slash'),
    path('fines/<int:pk>/waive', WaiveFineView.as_view(), name='fine-waive'),
    path('fines/<int:pk>/waive/', WaiveFineView.as_view(), name='fine-waive-slash'),
    path('fines/<int:pk>/status', CheckFineStatusView.as_view(), name='fine-status'),
    path('fines/<int:pk>/status/', CheckFineStatusView.as_view(), name='fine-status-slash'),
    path('fines/<int:pk>/pay-online', PayFineOnlineView.as_view(), name='fine-pay-online'),
    path('fines/<int:pk>/pay-online/', PayFineOnlineView.as_view(), name='fine-pay-online-slash'),
]


