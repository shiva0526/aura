import json
import os

BLOCKED_ROUTES = [
    "Route A — Highway 4 via North Bridge"
]

FULL_HOSPITALS = [
    "City General Hospital"
]

FALLBACK_ROUTES = [
    "Route B — Main Street via East Gate",
    "Route C — Service Road",
    "Route D — River Path Emergency Only"
]

FALLBACK_HOSPITALS = [
    "District Hospital",
    "Local Clinic",
    "Field Medical Camp"
]

MAX_RETRIES = 3

def check_plan(plan):
    issues = []
    if plan.get("route") in BLOCKED_ROUTES:
        issues.append(f"Route is blocked: {plan.get('route')}")
    if plan.get("hospital") in FULL_HOSPITALS:
        issues.append(f"Hospital is full: {plan.get('hospital')}")
    return issues

def replan(plan, attempt):
    plan["route"] = FALLBACK_ROUTES[attempt % len(FALLBACK_ROUTES)]
    plan["hospital"] = FALLBACK_HOSPITALS[attempt % len(FALLBACK_HOSPITALS)]
    return plan

def run_shield():
    if not os.path.exists("rescue_plan.json"):
        print("[SHIELD] Waiting...")
        return None

    with open("rescue_plan.json", "r") as f:
        plan = json.load(f)

    attempt = 0
    while attempt < MAX_RETRIES:
        issues = check_plan(plan)
        if not issues:
            plan["status"] = "APPROVED"
            break
            
        print(f"[SHIELD] Issues found on attempt {attempt}: {issues}")
        plan = replan(plan, attempt)
        attempt += 1

    if attempt >= MAX_RETRIES:
        plan["status"] = "BEST_AVAILABLE"

    plan["attempts"] = attempt
    
    if os.path.exists("oracle_report.json"):
        with open("oracle_report.json", "r") as f:
            oracle_report = json.load(f)
    else:
        oracle_report = {}
        
    plan["severity"] = oracle_report.get("severity_level", "UNKNOWN")
    plan["face_count"] = oracle_report.get("face_count", 1)
    
    with open("final_plan.json", "w") as f:
        json.dump(plan, f)

    print(f"[SHIELD] Final Plan: {plan}")
    return plan

if __name__ == "__main__":
    run_shield()
