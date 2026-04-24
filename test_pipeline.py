"""Quick test: Simulate the full AURA pipeline without camera/GPS"""
import json, os, sys

# Add backend to path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, BACKEND_DIR)

# main.py will chdir to project root, so create sos_alert.json there
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

sos = {
    "signal_type": "VISUAL_SOS",
    "face_count": 2,
    "distance_cm": 150,
    "snapshot": "test.jpg",
    "timestamp": 1234567890,
    "location": {"latitude": 12.42, "longitude": 75.74, "address": "Test Location"}
}
sos_path = os.path.join(PROJECT_ROOT, "sos_alert.json")
with open(sos_path, "w") as f:
    json.dump(sos, f)

print(f"[TEST] Created sos_alert.json at {sos_path}")

from main import run_pipeline
run_pipeline()

# Check final_plan.json in project root (where main.py writes it)
final_path = os.path.join(PROJECT_ROOT, "final_plan.json")
if os.path.exists(final_path):
    with open(final_path) as f:
        plan = json.load(f)
    print("\n[TEST] final_plan.json contents:")
    print(json.dumps(plan, indent=2))
    print(f"\n[TEST] {'✅' if 'mission_id' in plan else '❌'} mission_id: {plan.get('mission_id')}")
    print(f"[TEST] {'✅' if 'lat' in plan else '❌'} lat: {plan.get('lat')}")
    print(f"[TEST] {'✅' if 'lon' in plan else '❌'} lon: {plan.get('lon')}")
else:
    print(f"[TEST] ❌ final_plan.json NOT found at {final_path}")
