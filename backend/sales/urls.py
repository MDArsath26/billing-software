from django.urls import path
from .views import InvoiceCreateAPIView, InvoiceDetailAPIView

urlpatterns = [
    path("", InvoiceCreateAPIView.as_view(), name="invoice_create_list"),
    path("<str:invoice_id>/", InvoiceDetailAPIView.as_view(), name="invoice_detail"),
]
