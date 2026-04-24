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
    print(f"Severity: {plan.get('severity', plan.get('severity_level', 'UNKNOWN'))}")
    print(f"Teams:    {plan.get('teams', 'None')}")
    print(f"Route:    {plan.get('route', 'None')}")
    print(f"Hospital: {plan.get('hospital', 'None')}")
    print(f"Status:   {plan.get('status', 'None')}")
    print(f"Attempts: {plan.get('attempts', 0)}")
    print("=" * 50)

def cleanup():
    for filename in ["sos_alert.json", "oracle_report.json", "rescue_plan.json"]:
        if os.path.exists(filename):
            os.remove(filename)

def run_pipeline():
    print("\n[AURA] 🚨 SOS DETECTED — Activating Pipeline\n")

    print("[AURA] Running ORACLE...")
    oracle = run_oracle()
    time.sleep(1)

    print("[AURA] Running COMPASS...")
    plan = run_compass()
    time.sleep(1)

    print("[AURA] Running SHIELD...")
    final = run_shield()
    time.sleep(1)

    if final:
        print_final_plan(final)
        
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
