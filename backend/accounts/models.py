from mongoengine import Document, StringField, EmailField

class UserProfile(Document):
    user_id = StringField(required=True, unique=True)
    store_name = StringField(default="My Billing Store")
    address = StringField(default="")
    phone = StringField(default="")
    gstin = StringField(default="")
    email = StringField(default="")
    
    meta = {'collection': 'user_profiles'}
