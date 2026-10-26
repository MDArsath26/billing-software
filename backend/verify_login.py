import requests
import json

url = "http://127.0.0.1:8000/api/auth/login/"
payload = {"username": "admin", "password": "admin"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print("Login Successful!")
        print("Token received:", response.json().get("access", "")[:20] + "...")
    else:
        print(f"Login Failed via API. Status: {response.status_code}")
        print("Response:", response.text)
except Exception as e:
    print(f"Error connecting to API: {e}")
