import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
PRODUCTS_URL = f"{BASE_URL}/products/"

username = "admin"
password = "admin"

def inspect_products():
    # 1. Login
    resp = requests.post(AUTH_URL, json={"username": username, "password": password})
    if resp.status_code != 200:
        print("Login failed")
        return
    token = resp.json().get("access")
    
    # 2. Get Products
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(PRODUCTS_URL, headers=headers)
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"Count: {len(data)}")
        if len(data) > 0:
            print("First Product Sample:")
            print(json.dumps(data[0], indent=2))
        else:
            print("No products found.")
    else:
        print(f"Failed to get products: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    inspect_products()
