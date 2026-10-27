from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.Serializer):
    store_name = serializers.CharField(max_length=255, required=False)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    gstin = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        instance.store_name = validated_data.get('store_name', instance.store_name)
        instance.address = validated_data.get('address', instance.address)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.gstin = validated_data.get('gstin', instance.gstin)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
