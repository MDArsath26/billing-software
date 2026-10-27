from mongoengine import Document, StringField, DateTimeField, EmailField
from datetime import datetime

class Customer(Document):
    name = StringField(required=True)
    phone = StringField(required=True, unique=True)
    email = StringField(default="")
    address = StringField(default="")
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'customers',
        'indexes': ['name', 'phone'],
        'ordering': ['-created_at']
    }
