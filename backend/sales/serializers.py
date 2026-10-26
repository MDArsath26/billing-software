from rest_framework import serializers


class InvoiceItemCreateSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    qty = serializers.IntegerField(min_value=1)


class InvoiceCreateSerializer(serializers.Serializer):
    is_gst_enabled = serializers.BooleanField(default=True)
    customer_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payment_method = serializers.ChoiceField(
        choices=["CASH", "UPI", "CARD", "SPLIT"], default="CASH"
    )
    discount_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, default=0
    )
    items = InvoiceItemCreateSerializer(many=True)
