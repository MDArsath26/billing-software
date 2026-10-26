from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/invoices/", include("sales.urls")),
    path("api/customers/", include("customers.urls")),
    path("api/reports/", include("reports.urls")),
]
