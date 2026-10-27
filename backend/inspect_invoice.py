import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
INVOICES_URL = f"{BASE_URL}/invoices/"

username = "admin"
password = "admin"

def inspect_invoice_keys():
    # 1. Login
    resp = requests.post(AUTH_URL, json={"username": username, "password": password})
    token = resp.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get List
    resp = requests.get(INVOICES_URL, headers=headers)
    invoices = resp.json()
    if not invoices:
        print("No invoices.")
        return
    
    first_id = invoices[0]['id']
    
    # 3. Get Details
    detail_resp = requests.get(f"{INVOICES_URL}{first_id}/", headers=headers)
    data = detail_resp.json()
    
    print("Top Level Keys:", list(data.keys()))
    if data['items']:
        print("Item Keys:", list(data['items'][0].keys()))
        print("First Item Sample:", data['items'][0])
    else:
        print("Items list is empty.")

if __name__ == "__main__":
    inspect_invoice_keys()
