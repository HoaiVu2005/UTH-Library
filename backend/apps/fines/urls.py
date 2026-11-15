from django.urls import path
from .views import (
    MyFinesView,
    FineListView,
    CollectFineView,
    WaiveFineView,
)

urlpatterns = [
    path('fines/me', MyFinesView.as_view(), name='fine-me'),
    path('fines', FineListView.as_view(), name='fine-list'),
    path('fines/<int:pk>/collect', CollectFineView.as_view(), name='fine-collect'),
    path('fines/<int:pk>/waive', WaiveFineView.as_view(), name='fine-waive'),
]
