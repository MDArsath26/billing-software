from rest_framework import serializers
from .models import Product, Category, SubCategory


class CategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()


class SubCategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    category_id = serializers.CharField(write_only=True)


class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    sku = serializers.CharField()
    barcode = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    hsn_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    category_id = serializers.CharField(required=False, allow_null=True)
    subcategory_id = serializers.CharField(required=False, allow_null=True)
    
    # Read-only nested fields for display
    category_name = serializers.SerializerMethodField()
    subcategory_name = serializers.SerializerMethodField()

    cost_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    selling_price = serializers.DecimalField(max_digits=12, decimal_places=2)

    gst_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    stock_qty = serializers.IntegerField(required=False)

    is_active = serializers.BooleanField(required=False)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_subcategory_name(self, obj):
        return obj.subcategory.name if obj.subcategory else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.category:
            data['category_id'] = str(instance.category.id)
        if instance.subcategory:
            data['subcategory_id'] = str(instance.subcategory.id)
        return data

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        subcategory_id = validated_data.pop('subcategory_id', None)
        
        product = Product(**validated_data)
        
        if category_id:
            product.category = Category.objects.get(id=category_id)
        if subcategory_id:
            product.subcategory = SubCategory.objects.get(id=subcategory_id)
            
        product.save()
        return product

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        subcategory_id = validated_data.pop('subcategory_id', None)

        if category_id is not None: # only update if provided
            instance.category = Category.objects.get(id=category_id) if category_id else None
            
        if subcategory_id is not None:
             instance.subcategory = SubCategory.objects.get(id=subcategory_id) if subcategory_id else None

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
