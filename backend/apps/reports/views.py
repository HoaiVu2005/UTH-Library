from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.permissions import IsAdminUserRole

from .services import (
    get_dashboard_summary,
    get_dashboard_action_items,
    get_top_borrowed_report,
    get_overdue_report,
    get_inventory_report,
    get_borrow_trends,
)

class DashboardSummaryView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        data = get_dashboard_summary()
        return Response({'data': data}, status=status.HTTP_200_OK)

class DashboardActionItemsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        data = get_dashboard_action_items()
        return Response({'data': data}, status=status.HTTP_200_OK)

class TopBorrowedReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        data = get_top_borrowed_report(limit=limit)
        return Response({'data': data}, status=status.HTTP_200_OK)

class OverdueReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        data = get_overdue_report()
        return Response({'data': data}, status=status.HTTP_200_OK)

class InventoryReportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        data = get_inventory_report()
        return Response({'data': data}, status=status.HTTP_200_OK)

class BorrowTrendsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        days = int(request.query_params.get('days', 7))
        data = get_borrow_trends(days=days)
        return Response({'data': data}, status=status.HTTP_200_OK)

