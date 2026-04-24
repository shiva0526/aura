import json
import os

PLANS = {
    "HIGH": {
        "teams": 3,
        "route": "Route A — Highway 4 via North Bridge",
        "hospital": "City General Hospital",
        "actions": [
            "Deploy rescue boats immediately",
            "Activate emergency broadcast",
            "Alert nearest fire station"
        ]
    },
    "MEDIUM": {
        "teams": 2,
        "route": "Route B — Main Street via East Gate",
        "hospital": "District Hospital",
        "actions": [
            "Send ambulances",
            "Notify local police"
        ]
    },
    "LOW": {
        "teams": 1,
        "route": "Route C — Service Road",
        "hospital": "Local Clinic",
        "actions": [
            "Send single response unit"
        ]
    }
}

def generate_plan(oracle_report):
    severity_level = oracle_report["severity_level"]
    # Copy dictionary to avoid mutating the constant PLANS
    plan = PLANS[severity_level].copy()
    plan["actions"] = list(plan["actions"])
    
    plan["actions"].append(oracle_report["wildfire_forecast"])
    return plan

def run_compass():
    if not os.path.exists("oracle_report.json"):
        print("[COMPASS] Waiting...")
        return None

    with open("oracle_report.json", "r") as f:
        oracle_report = json.load(f)

    plan = generate_plan(oracle_report)

    with open("rescue_plan.json", "w") as f:
        json.dump(plan, f)

    print(f"[COMPASS] Plan Generated: {plan}")
    return plan

if __name__ == "__main__":
    run_compass()
