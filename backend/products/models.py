from mongoengine import Document, StringField, DecimalField, IntField, BooleanField, DateTimeField, ReferenceField
from datetime import datetime


class Category(Document):
    name = StringField(required=True, unique=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "categories"}


class SubCategory(Document):
    name = StringField(required=True)
    category = ReferenceField(Category, required=True, reverse_delete_rule=2)  # 2 = DENY
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "subcategories"}


class Product(Document):
    name = StringField(required=True)
    sku = StringField(required=True, unique=True)
    barcode = StringField(null=True)
    hsn_code = StringField(null=True)

    category = ReferenceField(Category, required=False)  # Making optional for migration, frontend will enforce
    subcategory = ReferenceField(SubCategory, required=False)

    cost_price = DecimalField(required=True, precision=2, min_value=0)
    selling_price = DecimalField(required=True, precision=2, min_value=0)

    gst_rate = DecimalField(default=0, precision=2, min_value=0)
    stock_qty = IntField(default=0, min_value=0)

    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "products",
        "indexes": ["sku", "barcode"],
    }
