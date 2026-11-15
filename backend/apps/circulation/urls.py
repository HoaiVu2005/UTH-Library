from django.urls import path
from .views import (
    DirectBorrowView,
    ReservationBorrowView,
    LoanListView,
    MyLoansView,
    RenewLoanView,
    ReturnLoanView,
    MarkLostView,
    DeskPatronView,
    DeskReturnLookupView,
    BatchCheckoutView,
)

urlpatterns = [
    # Desk operations (supports both with and without trailing slash)
    path('circulation/desk/patron', DeskPatronView.as_view(), name='desk-patron'),
    path('circulation/desk/patron/', DeskPatronView.as_view(), name='desk-patron-slash'),
    path('loans/lookup-return', DeskReturnLookupView.as_view(), name='loan-lookup-return'),
    path('loans/lookup-return/', DeskReturnLookupView.as_view(), name='loan-lookup-return-slash'),
    path('circulation/desk/return-lookup', DeskReturnLookupView.as_view(), name='desk-return-lookup'),
    path('circulation/desk/return-lookup/', DeskReturnLookupView.as_view(), name='desk-return-lookup-slash'),
    path('loans/checkout', BatchCheckoutView.as_view(), name='loan-batch-checkout'),
    path('loans/checkout/', BatchCheckoutView.as_view(), name='loan-batch-checkout-slash'),

    # Existing endpoints
    path('loans/direct', DirectBorrowView.as_view(), name='loan-direct-borrow'),
    path('loans/from-reservation', ReservationBorrowView.as_view(), name='loan-reservation-borrow'),
    path('loans', LoanListView.as_view(), name='loan-list'),
    path('loans/me', MyLoansView.as_view(), name='loan-me'),
    path('loans/<int:pk>/renew', RenewLoanView.as_view(), name='loan-renew'),
    path('loans/<int:pk>/return', ReturnLoanView.as_view(), name='loan-return'),
    path('loans/<int:pk>/mark-lost', MarkLostView.as_view(), name='loan-mark-lost'),
]
