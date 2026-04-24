import json
import os

def get_weather():
    return {
        "wind_speed": 45, 
        "humidity": 20, 
        "temperature": 38, 
        "condition": "dry"
    }

def score_severity(face_count, distance_cm, weather):
    score = 0

    # face_count scoring
    if face_count >= 3:
        score += 40
    elif face_count == 2:
        score += 25
    else:
        score += 10

    # distance_cm scoring
    if distance_cm < 100:
        score += 30
    elif distance_cm < 200:
        score += 20
    else:
        score += 10

    # weather scoring
    wind = weather["wind_speed"]
    humidity = weather["humidity"]
    
    if wind > 40 and humidity < 25:
        score += 30
    elif wind > 20:
        score += 15
    else:
        score += 5

    return score

def predict_wildfire(weather):
    wind = weather["wind_speed"]
    humidity = weather["humidity"]
    
    if wind > 40 and humidity <= 20:
        return "CRITICAL — spreads North-East in 30 mins"
    elif wind > 20 and humidity < 40:
        return "HIGH — spreading slowly"
    else:
        return "LOW — minimal risk"

def get_severity_level(score):
    if score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"

def run_oracle(alert=None):
    if alert is not None:
        alert_data = alert
    else:
        if not os.path.exists("sos_alert.json"):
            print("[ORACLE] Waiting...")
            return None
        with open("sos_alert.json", "r") as f:
            alert_data = json.load(f)

    weather = get_weather()
    score = score_severity(alert_data["face_count"], alert_data["distance_cm"], weather)
    wildfire_forecast = predict_wildfire(weather)
    severity_level = get_severity_level(score)

    oracle_report = {
        "severity_level": severity_level,
        "severity_score": score,
        "face_count": alert_data["face_count"],
        "distance_cm": alert_data["distance_cm"],
        "wildfire_forecast": wildfire_forecast,
        "weather": weather
    }

    with open("oracle_report.json", "w") as f:
        json.dump(oracle_report, f)

    print(f"[ORACLE] Report: {oracle_report}")
    return oracle_report

if __name__ == "__main__":
    run_oracle()
