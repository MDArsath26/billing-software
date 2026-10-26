from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import NotUniqueError, DoesNotExist

from .models import Product, Category, SubCategory
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer


class CategoryListCreateAPIView(APIView):
    def get(self, request):
        qs = Category.objects.all()
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = Category(name=serializer.validated_data['name'])
            category.save()
            return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)
        except NotUniqueError:
            return Response({"name": ["Category already exists."]}, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailAPIView(APIView):
    def get_object(self, category_id):
        return Category.objects.get(id=category_id)

    def delete(self, request, category_id):
        try:
            category = self.get_object(category_id)
            # prevent delete if has subcategories or products? 
            # Subcategory has reverse_delete_rule=DENY so mongoengine handles that part for subcats
            # Products have optional reference, so no strict deny unless we enforce it manually or via ReferenceField settings.
            # For now, let's allow delete, subcats will block it if connected.
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DoesNotExist:
             return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubCategoryListCreateAPIView(APIView):
    def get(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            qs = SubCategory.objects.filter(category=category_id)
        else:
            qs = SubCategory.objects.all()
        
        serializer = SubCategorySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubCategorySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = Category.objects.get(id=serializer.validated_data['category_id'])
            subcategory = SubCategory(
                name=serializer.validated_data['name'],
                category=category
            )
            subcategory.save()
            return Response(SubCategorySerializer(subcategory).data, status=status.HTTP_201_CREATED)
        except DoesNotExist:
             return Response({"category_id": ["Category not found."]}, status=status.HTTP_400_BAD_REQUEST)


class SubCategoryDetailAPIView(APIView):
    def delete(self, request, subcategory_id):
        try:
            sub = SubCategory.objects.get(id=subcategory_id)
            sub.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class ProductListCreateAPIView(APIView):
    def get(self, request):
        category_id = request.query_params.get('category_id')
        subcategory_id = request.query_params.get('subcategory_id')
        
        qs = Product.objects.order_by("-created_at")
        
        if category_id:
            qs = qs.filter(category=category_id)
        if subcategory_id:
            qs = qs.filter(subcategory=subcategory_id)

        data = [ProductSerializer(p).data for p in qs]
        return Response(data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = serializer.save()
        except NotUniqueError:
            return Response({"sku": ["SKU already exists."]}, status=status.HTTP_400_BAD_REQUEST)
        except DoesNotExist:
             return Response({"detail": "Category or Subcategory not found."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailAPIView(APIView):
    def get_object(self, product_id: str):
        return Product.objects.get(id=product_id)

    def get(self, request, product_id):
        try:
            product = self.get_object(product_id)
        except DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(ProductSerializer(product).data)

    def put(self, request, product_id):
        try:
            product = self.get_object(product_id)
        except DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = serializer.save()
        except NotUniqueError:
            return Response({"sku": ["SKU already exists."]}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ProductSerializer(product).data)

    def delete(self, request, product_id):
        try:
            product = self.get_object(product_id)
        except DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
