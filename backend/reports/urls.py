from django.urls import path
from .views import DashboardStatsAPIView, SalesReportAPIView, InventoryReportAPIView, ProfitReportAPIView

urlpatterns = [
    path("dashboard/", DashboardStatsAPIView.as_view(), name="dashboard-stats"),
    path("sales/", SalesReportAPIView.as_view(), name="sales-report"),
    path("inventory/", InventoryReportAPIView.as_view(), name="inventory-report"),
    path("profit/", ProfitReportAPIView.as_view(), name="profit-report"),
]
