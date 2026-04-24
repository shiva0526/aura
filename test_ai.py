import requests
import sys
import io

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("🚨 Simulating: Drone found a trapped person...")
disaster_data = {
    "lat": 12.9716, 
    "lon": 77.5946, 
    "task_id": "RESCUE-001"
}

print("📡 Asking AURA to find the closest available officer...")
try:
    response = requests.post("http://localhost:8000/api/assign", json=disaster_data)

    if response.status_code == 200:
        officer = response.json()
        print("\n✅ MATCH FOUND!")
        print(f"Officer Assigned: {officer['name']} (ID: {officer['id']})")
        print(f"Distance to disaster: {officer['distance']:.2f} km")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
except requests.exceptions.ConnectionError:
    print("❌ Connection Error: FastAPI server is not running on localhost:8000")
