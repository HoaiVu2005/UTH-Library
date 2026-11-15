from django.urls import path
from .views import (
    DashboardSummaryView,
    DashboardActionItemsView,
    TopBorrowedReportView,
    OverdueReportView,
    InventoryReportView,
    BorrowTrendsView,
)

urlpatterns = [
    path('dashboard/summary', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('reports/summary', DashboardSummaryView.as_view(), name='reports-summary'),
    path('dashboard/action-items', DashboardActionItemsView.as_view(), name='dashboard-action-items'),
    path('reports/top-borrowed', TopBorrowedReportView.as_view(), name='report-top-borrowed'),
    path('reports/overdue', OverdueReportView.as_view(), name='report-overdue'),
    path('reports/inventory', InventoryReportView.as_view(), name='report-inventory'),
    path('reports/borrow-trends', BorrowTrendsView.as_view(), name='report-borrow-trends'),
]
