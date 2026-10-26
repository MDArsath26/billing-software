from django.urls import path
from .views import (
    ProductListCreateAPIView, ProductDetailAPIView,
    CategoryListCreateAPIView, CategoryDetailAPIView,
    SubCategoryListCreateAPIView, SubCategoryDetailAPIView
)

urlpatterns = [
    path("", ProductListCreateAPIView.as_view(), name="product_list_create"),
    
    # Categories
    path("categories/", CategoryListCreateAPIView.as_view(), name="category_list_create"),
    path("categories/<str:category_id>/", CategoryDetailAPIView.as_view(), name="category_detail"),
    
    # SubCategories
    path("subcategories/", SubCategoryListCreateAPIView.as_view(), name="subcategory_list_create"),
    path("subcategories/<str:subcategory_id>/", SubCategoryDetailAPIView.as_view(), name="subcategory_detail"),

    path("<str:product_id>/", ProductDetailAPIView.as_view(), name="product_detail"),
]
