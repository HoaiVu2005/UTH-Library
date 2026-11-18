from django.urls import path
from .views import (
    CreateReservationView,
    MyReservationsView,
    CancelReservationView,
    ReservationListView,
    AdvanceReservationView,
    ExpireStaleReservationsView,
)

urlpatterns = [
    path('reservations', CreateReservationView.as_view(), name='reservation-create'),
    path('reservations/me', MyReservationsView.as_view(), name='reservation-me'),
    path('reservations/expire-stale', ExpireStaleReservationsView.as_view(), name='reservation-expire-stale'),
    path('reservations/<int:pk>', CancelReservationView.as_view(), name='reservation-cancel'),
    path('reservations/all', ReservationListView.as_view(), name='reservation-all'),
    path('reservations/<int:pk>/advance', AdvanceReservationView.as_view(), name='reservation-advance'),
]
