import os
import time
import json
import uuid
from layer2_oracle.oracle import run_oracle
from layer3_compass.compass import run_compass
from layer4_shield.shield import run_shield

def print_banner():
    print("=" * 50)
    print("   AURA — AUTONOMOUS DISASTER RESPONSE SYSTEM  ")
    print("=" * 50)

def print_final_plan(plan):
    print("\n" + "=" * 50)
    print("         ✅ RESCUE PLAN CONFIRMED")
    print("=" * 50)
    print(f"Severity: {plan.get('severity', plan.get('severity_level', 'UNKNOWN'))}")
    print(f"Teams:    {plan.get('teams', 'None')}")
    print(f"Route:    {plan.get('route', 'None')}")
    print(f"Hospital: {plan.get('hospital', 'None')}")
    print(f"Status:   {plan.get('status', 'None')}")
    print(f"Attempts: {plan.get('attempts', 0)}")
    print("=" * 50)

def cleanup():
    pass

def run_pipeline():
    with open("sos_alert.json", "r") as f:
        alert_data = json.load(f)
        
    os.remove("sos_alert.json")
    
    print("\n[AURA] 🚨 SOS DETECTED — Activating Pipeline\n")

    print("[AURA] Running ORACLE...")
    oracle = run_oracle(alert_data)
    time.sleep(1)

    print("[AURA] Running COMPASS...")
    plan = run_compass()
    time.sleep(1)

    print("[AURA] Running SHIELD...")
    final = run_shield()
    time.sleep(1)

    if final:
        final["mission_id"] = str(uuid.uuid4())
        with open("final_plan.json", "w") as f:
            json.dump(final, f)
        print_final_plan(final)
        
    cleanup()
    time.sleep(3)

    print("\n[AURA] Ready for next alert...\n")

def main():
    print_banner()
    print("[AURA] System Online. Waiting for SOS...\n")

    while True:
        if os.path.exists("sos_alert.json"):
            run_pipeline()
        else:
            time.sleep(2)

if __name__ == "__main__":
    main()
