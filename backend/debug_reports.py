import requests
import json
import os
import django
from datetime import datetime

# Setup Django standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def get_token():
    user = User.objects.first()
    if not user:
        print("No user found! Create a superuser first.")
        return None
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

def test_api(endpoint):
    token = get_token()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}
    base_url = "http://127.0.0.1:8000/api/reports"
    
    print(f"\n--- Testing {endpoint} ---")
    try:
        response = requests.get(f"{base_url}/{endpoint}", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success! Sample Data keys:", list(response.json().keys()))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_api("sales/?start_date=2024-01-01")
    test_api("inventory/")
    test_api("profit/")
