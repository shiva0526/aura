import json
import os
import sys
import io

# Force utf-8 encoding for Windows terminal to support emojis
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def create_fake_alert():
    payload = {
        "signal_type": "VISUAL_SOS",
        "face_count": 3,
        "distance_cm": 85,
        "snapshot": "snapshots/test.jpg",
        "timestamp": 1234567890.0
    }
    with open("sos_alert.json", "w") as f:
        json.dump(payload, f)

def test_oracle():
    print("\n--- Testing ORACLE ---")
    try:
        from layer2_oracle.oracle import run_oracle
    except ImportError:
        from backend.layer2_oracle.oracle import run_oracle
        
    run_oracle()
    
    if not os.path.exists("oracle_report.json"):
        print("❌ ORACLE FAIL: oracle_report.json does not exist")
        return
        
    with open("oracle_report.json", "r") as f:
        report = json.load(f)
        
    if "severity_level" not in report:
        print("❌ ORACLE FAIL: severity_level key missing")
        return
        
    if report["severity_level"] not in ["HIGH", "MEDIUM", "LOW"]:
        print(f"❌ ORACLE FAIL: Invalid severity level '{report['severity_level']}'")
        return
        
    if "wildfire_forecast" not in report:
        print("❌ ORACLE FAIL: wildfire_forecast key missing")
        return
        
    print("✅ ORACLE PASS")

def test_compass():
    print("\n--- Testing COMPASS ---")
    try:
        from layer3_compass.compass import run_compass
    except ImportError:
        from backend.layer3_compass.compass import run_compass
        
    run_compass()
    
    if not os.path.exists("rescue_plan.json"):
        print("❌ COMPASS FAIL: rescue_plan.json does not exist")
        return
        
    with open("rescue_plan.json", "r") as f:
        plan = json.load(f)
        
    if not all(k in plan for k in ["teams", "route", "hospital"]):
        print("❌ COMPASS FAIL: Missing teams, route, or hospital keys")
        return
        
    if not isinstance(plan.get("teams", 0), (int, float)) or plan["teams"] <= 0:
        print("❌ COMPASS FAIL: teams must be a number greater than 0")
        return
        
    if "actions" not in plan or not isinstance(plan["actions"], list) or len(plan["actions"]) == 0:
        print("❌ COMPASS FAIL: actions must be a non-empty list")
        return
        
    print("✅ COMPASS PASS")

def cleanup():
    for filename in ["sos_alert.json", "oracle_report.json", "rescue_plan.json"]:
        if os.path.exists(filename):
            os.remove(filename)

def run_all_tests():
    print("=" * 40)
    print("   AURA SYSTEM TEST")
    print("=" * 40)

    create_fake_alert()
    test_oracle()
    test_compass()
    cleanup()

    print("\n" + "=" * 40)
    print("   TEST COMPLETE")
    print("=" * 40)

if __name__ == "__main__":
    run_all_tests()
