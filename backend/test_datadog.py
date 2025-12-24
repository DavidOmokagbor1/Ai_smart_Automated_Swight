#!/usr/bin/env python3
"""
Quick test script to generate API traffic for Datadog testing.
Run this after starting your Flask app to generate traces.
"""

import requests
import time
import sys

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5, headers={"Content-Type": "application/json"})
        
        print(f"✅ {method} {endpoint} - Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection refused (is Flask app running?)")
        return False
    except Exception as e:
        print(f"⚠️  {method} {endpoint} - Error: {e}")
        return False

def main():
    print("🚀 Generating API traffic for Datadog testing...")
    print(f"   Target: {BASE_URL}\n")
    
    # Check if server is running
    if not test_endpoint("/api/status"):
        print("\n❌ Flask app is not running!")
        print("   Start it with: cd backend && python3 app.py")
        sys.exit(1)
    
    print("\n📊 Testing API endpoints...\n")
    
    # Test various endpoints
    endpoints = [
        ("/api/status", "GET"),
        ("/api/lights", "GET"),
        ("/api/ai/status", "GET"),
        ("/api/weather", "GET"),
        ("/api/statistics", "GET"),
        ("/api/schedules", "GET"),
        ("/api/activity/logs", "GET"),
    ]
    
    for endpoint, method in endpoints:
        test_endpoint(endpoint, method)
        time.sleep(0.5)  # Small delay between requests
    
    # Test POST endpoints
    print("\n💡 Testing light control (generates custom metrics)...\n")
    
    post_tests = [
        ("/api/lights/living_room/control", {"action": "on", "brightness": 80}),
        ("/api/lights/kitchen/control", {"action": "on", "brightness": 60}),
        ("/api/lights/bedroom/toggle", None),
    ]
    
    for endpoint, data in post_tests:
        if data:
            test_endpoint(endpoint, "POST", data)
        else:
            test_endpoint(endpoint, "POST")
        time.sleep(0.5)
    
    print("\n✅ Test complete!")
    print("\n📈 Next steps:")
    print("   1. Wait 1-2 minutes for traces to appear in Datadog")
    print("   2. Go to: https://app.datadoghq.com/apm/services")
    print("   3. Look for 'ai-smart-lights' service")
    print("   4. Click on it to see traces and metrics")
    print("\n💡 Tip: Run this script multiple times to generate more traces")

if __name__ == "__main__":
    main()

