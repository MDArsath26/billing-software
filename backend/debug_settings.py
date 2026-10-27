import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
SETTINGS_URL = f"{BASE_URL}/auth/settings/"

def debug_settings_update():
    # 1. Login
    print("Logging in...")
    resp = requests.post(AUTH_URL, json={"username": "admin", "password": "admin"})
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
    
    token = resp.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Current Settings
    print("Fetching current settings...")
    resp = requests.get(SETTINGS_URL, headers=headers)
    print(f"GET Status: {resp.status_code}")
    print(f"GET Payload: {resp.text}")

    # 3. Try to Update
    print("Attempting update...")
    payload = {
        "store_name": "Abc store",
        "address": "pondicherry",
        "phone": "8270652229",
        "gstin": "",
        "email": ""
    }
    
    resp = requests.put(SETTINGS_URL, json=payload, headers=headers)
    print(f"PUT Status: {resp.status_code}")
    print(f"PUT Response: {resp.text}")

if __name__ == "__main__":
    debug_settings_update()
