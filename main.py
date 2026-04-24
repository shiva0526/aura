import os
import time
import json
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
    print(f"Severity: {plan.get('severity', 'N/A')}")
    print(f"Teams: {plan.get('teams', 'N/A')}")
    print(f"Route: {plan.get('route', 'N/A')}")
    print(f"Hospital: {plan.get('hospital', 'N/A')}")
    print(f"Status: {plan.get('status', 'N/A')}")
    print(f"Attempts: {plan.get('attempts', 'N/A')}")
    print("=" * 50)

def cleanup():
    for f in ["sos_alert.json", "oracle_report.json", "rescue_plan.json"]:
        if os.path.exists(f):
            os.remove(f)

def run_pipeline():
    print("\n[AURA] 🚨 SOS DETECTED — Activating Pipeline\n")

    print("[AURA] Running ORACLE...")
    run_oracle()
    
    print("[AURA] Running COMPASS...")
    run_compass()
    
    print("[AURA] Running SHIELD...")
    final_plan = run_shield()

    if final_plan:
        print_final_plan(final_plan)
        
    cleanup()

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
