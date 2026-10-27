import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
PRODUCTS_URL = f"{BASE_URL}/products/"
INVOICES_URL = f"{BASE_URL}/invoices/"

username = "admin"
password = "admin"

def get_token():
    try:
        resp = requests.post(AUTH_URL, json={"username": username, "password": password})
        return resp.json().get("access")
    except Exception as e:
        print(f"Auth failed: {e}")
        return None

def test_stock_logic():
    token = get_token()
    if not token:
        print("Could not get token. Exiting.")
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 1. Create a Product with Stock = 10
    product_data = {
        "name": "Test Stock Product",
        "sku": "TEST-STOCK-001",
        "cost_price": 100,
        "selling_price": 150,
        "stock_qty": 10,
        "gst_rate": 18
    }
    
    print("\n--- Creating Product ---")
    resp = requests.post(PRODUCTS_URL, json=product_data, headers=headers)
    if resp.status_code != 201:
        # Maybe it already exists? Try to delete it or fetch it
        print(f"Failed to create product or already exists: {resp.text}")
        # Assuming we might need to find reliable way to get an ID if it failed...
        # For now, let's hope it works or we just use manual cleanup
        # If SKU exists, let's filter the list to find it
        list_resp = requests.get(PRODUCTS_URL, headers=headers)
        for p in list_resp.json():
            if p['sku'] == "TEST-STOCK-001":
                product_id = p['id']
                print(f"Found existing product ID: {product_id}")
                # Reset stock to 10
                requests.put(f"{PRODUCTS_URL}{product_id}/", json={**product_data, "stock_qty": 10}, headers=headers)
                break
    else:
        product_id = resp.json()["id"]
        print(f"Product Created. ID: {product_id}")

    # 2. Buy 5 items
    print("\n--- Buying 5 items ---")
    invoice_data = {
        "customer_name": "Test Customer",
        "items": [
            {"product_id": product_id, "qty": 5}
        ]
    }
    resp = requests.post(INVOICES_URL, json=invoice_data, headers=headers)
    if resp.status_code == 201:
        print("Invoice created successfully.")
    else:
        print(f"Failed to create invoice: {resp.text}")

    # 3. Check Stock (Should be 5)
    print("\n--- Checking Stock (Expect 5) ---")
    resp = requests.get(f"{PRODUCTS_URL}{product_id}/", headers=headers)
    curr_stock = resp.json().get("stock_qty")
    print(f"Current Stock: {curr_stock}")
    if curr_stock == 5:
        print("✅ Stock deduction worked!")
    else:
        print(f"❌ Stock deduction FAILED. Expected 5, got {curr_stock}")

    # 4. Try to buy 6 items (Should fail)
    print("\n--- Buying 6 items (Expect Failure) ---")
    invoice_data_fail = {
        "customer_name": "Test Customer Fail",
        "items": [
            {"product_id": product_id, "qty": 6}
        ]
    }
    resp = requests.post(INVOICES_URL, json=invoice_data_fail, headers=headers)
    if resp.status_code == 400:
        print(f"✅ Correctly failed: {resp.json().get('detail')}")
    else:
        print(f"❌ Unexpected success or different error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_stock_logic()
