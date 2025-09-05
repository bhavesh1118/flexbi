#!/usr/bin/env python3
"""
Test script for FlexBI Python Backend
This script tests all the API endpoints to ensure they work correctly.
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3001"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PATCH":
            response = requests.patch(url, json=data)
        
        if response.status_code == expected_status:
            print(f"✅ {method} {endpoint} - Status: {response.status_code}")
            return response.json()
        else:
            print(f"❌ {method} {endpoint} - Expected: {expected_status}, Got: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection failed (is server running?)")
        return None
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {e}")
        return None

def main():
    print("🧪 Testing FlexBI Python Backend")
    print("=" * 50)
    
    # Test health check
    print("\n1. Testing health check...")
    health = test_endpoint("GET", "/")
    
    # Test hyperlocal data endpoints
    print("\n2. Testing hyperlocal data endpoints...")
    
    # Get hyperlocal data
    hyperlocal_data = test_endpoint("GET", "/api/hyperlocal-data")
    
    # Add new location
    new_location = {
        "pincode": "TEST123",
        "neighborhood": "Test Area",
        "sales": 1000,
        "impressions": 5000,
        "conversions": 50
    }
    add_result = test_endpoint("POST", "/api/hyperlocal-data", new_location, 201)
    
    # Update location
    if add_result:
        update_data = {"sales": 1200}
        test_endpoint("PATCH", "/api/hyperlocal-data/TEST123", update_data)
    
    # Test data analysis
    print("\n3. Testing data analysis...")
    analysis_data = {
        "data": [
            {"sales": 100, "category": "A"},
            {"sales": 200, "category": "B"},
            {"sales": 150, "category": "A"}
        ],
        "question": "What is the average of sales?"
    }
    test_endpoint("POST", "/api/analyze", analysis_data)
    
    # Test forecasting
    print("\n4. Testing forecasting...")
    forecast_data = {
        "data": [
            {"date": "2024-01-01", "value": 100},
            {"date": "2024-01-02", "value": 120},
            {"date": "2024-01-03", "value": 110},
            {"date": "2024-01-04", "value": 130},
            {"date": "2024-01-05", "value": 125}
        ],
        "periods": 3
    }
    test_endpoint("POST", "/api/forecast", forecast_data)
    
    # Test dashboard management
    print("\n5. Testing dashboard management...")
    
    # Save dashboard
    dashboard_data = {
        "name": "Test Dashboard",
        "config": {"charts": ["sales", "revenue"], "layout": "grid"}
    }
    test_endpoint("POST", "/api/save-dashboard", dashboard_data)
    
    # Load dashboard
    test_endpoint("GET", "/api/load-dashboard")
    
    # Test alerts
    print("\n6. Testing alerts...")
    
    # Save alert
    alert_data = {
        "name": "Test Alert",
        "condition": "sales > 1000",
        "value": 1000.0,
        "email": "test@example.com"
    }
    test_endpoint("POST", "/api/alerts", alert_data)
    
    # Get alerts
    test_endpoint("GET", "/api/alerts")
    
    print("\n🎉 Test completed!")
    print("\nIf all tests passed, the Python backend is working correctly.")
    print("You can now access:")
    print("- API Documentation: http://localhost:3001/docs")
    print("- Alternative Docs: http://localhost:3001/redoc")

if __name__ == "__main__":
    main()
