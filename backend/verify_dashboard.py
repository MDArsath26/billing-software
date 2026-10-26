import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
DASHBOARD_URL = f"{BASE_URL}/reports/dashboard/"

username = "admin"
password = "admin"

def get_token():
    try:
        resp = requests.post(AUTH_URL, json={"username": username, "password": password})
        if resp.status_code == 200:
            return resp.json().get("access")
        else:
            print(f"Auth failed: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print(f"Auth failed: {e}")
        return None

def test_dashboard_stats():
    # Wait for server reload if needed
    time.sleep(2)
    
    token = get_token()
    if not token:
        print("Could not get token. Exiting.")
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print("\n--- Fetching Dashboard Stats ---")
    resp = requests.get(DASHBOARD_URL, headers=headers)
    
    if resp.status_code == 200:
        data = resp.json()
        print("✅ Success!")
        print(f"Total Revenue: {data.get('total_revenue')}")
        print(f"Total Invoices: {data.get('total_invoices')}")
        print(f"Low Stock Count: {len(data.get('low_stock_products', []))}")
        print("Daily Sales Data:")
        for day in data.get('daily_sales', []):
            print(f"  {day['date']}: {day['revenue']}")
    else:
        print(f"❌ Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_dashboard_stats()
