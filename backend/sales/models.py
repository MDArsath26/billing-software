from django.db import models

# Create your models here.
from mongoengine import (
    Document,
    EmbeddedDocument,
    StringField,
    DecimalField,
    IntField,
    BooleanField,
    DateTimeField,
    EmbeddedDocumentListField,
)
from datetime import datetime


class InvoiceItem(EmbeddedDocument):
    product_id = StringField(required=True)
    name = StringField(required=True)
    sku = StringField(required=True)

    qty = IntField(required=True, min_value=1)
    unit_price = DecimalField(required=True, precision=2, min_value=0)
    gst_rate = DecimalField(default=0, precision=2, min_value=0)

    line_subtotal = DecimalField(required=True, precision=2, min_value=0)
    line_tax = DecimalField(default=0, precision=2, min_value=0)
    line_total = DecimalField(required=True, precision=2, min_value=0)


class Invoice(Document):
    invoice_no = StringField(required=True, unique=True)

    is_gst_enabled = BooleanField(default=True)

    customer_name = StringField(null=True)
    customer_phone = StringField(null=True)
    customer_address = StringField(null=True, default="")

    payment_method = StringField(default="CASH")  # CASH/UPI/CARD/SPLIT

    subtotal = DecimalField(default=0, precision=2)
    tax_amount = DecimalField(default=0, precision=2)
    discount_amount = DecimalField(default=0, precision=2)
    total = DecimalField(default=0, precision=2)

    created_by = StringField(required=True)  # store Django user id as string
    created_at = DateTimeField(default=datetime.utcnow)

    items = EmbeddedDocumentListField(InvoiceItem)

    meta = {"collection": "invoices", "indexes": ["invoice_no", "created_at"]}
