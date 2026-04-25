from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, GroundOfficer
from assignment_ai import find_closest_officer, assign_task_to_officer
import json
import os
import joblib
import numpy as np

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "rescueops_forest_model.pkl")
try:
    forest_model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load forest model from {MODEL_PATH}: {e}")
    forest_model = None

IGNITION_MODEL_PATH = os.path.join(os.path.dirname(__file__), "rescueops_ignition_classifier.pkl")
try:
    ignition_model = joblib.load(IGNITION_MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load ignition model from {IGNITION_MODEL_PATH}: {e}")
    ignition_model = None

app = FastAPI()

# Resolve paths from the project root (one level up from backend/)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def read_json(filename):
    filepath = os.path.join(PROJECT_ROOT, filename)
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            return json.load(f)
    return None

@app.get("/status")
def get_status():
    return {
        "pulse": os.path.exists(os.path.join(PROJECT_ROOT, "sos_alert.json")),
        "oracle": os.path.exists(os.path.join(PROJECT_ROOT, "oracle_report.json")),
        "compass": os.path.exists(os.path.join(PROJECT_ROOT, "rescue_plan.json")),
        "shield": os.path.exists(os.path.join(PROJECT_ROOT, "final_plan.json"))
    }

@app.get("/oracle")
def get_oracle():
    data = read_json("oracle_report.json")
    if data is None:
        return {"status": "waiting"}
    return data

@app.get("/plan")
def get_plan():
    data = read_json("rescue_plan.json")
    if data is None:
        return {"status": "waiting"}
    return data

@app.get("/final")
def get_final():
    data = read_json("final_plan.json")
    if data is None:
        return {"status": "waiting"}
    return data

@app.get("/map")
def get_map():
    map_path = os.path.join(PROJECT_ROOT, "map.html")
    if os.path.exists(map_path):
        return FileResponse(map_path)
    return {"status": "no map yet"}

class AssignRequest(BaseModel):
    lat: float
    lon: float
    task_id: str

class OfficerCreate(BaseModel):
    name: str
    lat: float
    lon: float

@app.post("/api/officers")
async def deploy_officer(request: OfficerCreate, db: AsyncSession = Depends(get_db)):
    # Calculate next sequential ID safely analyzing existing IDs securely
    query = select(GroundOfficer)
    result = await db.execute(query)
    officers = result.scalars().all()
    
    max_num = 0
    for o in officers:
        try:
            num = int(o.id.split('-')[1])
            if num > max_num:
                max_num = num
        except:
            pass
            
    new_id = f"GO-{str(max_num + 1).zfill(2)}"
    
    new_officer = GroundOfficer(
        id=new_id,
        name=request.name,
        lat=request.lat,
        lon=request.lon,
        status="available"
    )
    
    db.add(new_officer)
    await db.commit()
    return {"id": new_id, "name": request.name, "status": "available"}

@app.get("/api/officers")
async def get_officers(db: AsyncSession = Depends(get_db)):
    query = select(GroundOfficer)
    result = await db.execute(query)
    officers = result.scalars().all()
    return [{"id": o.id, "name": o.name, "lat": o.lat, "lon": o.lon, "status": o.status, "current_task_id": o.current_task_id} for o in officers]

@app.delete("/api/officers/{officer_id}")
async def delete_officer(officer_id: str, db: AsyncSession = Depends(get_db)):
    query = select(GroundOfficer).where(GroundOfficer.id == officer_id)
    result = await db.execute(query)
    officer = result.scalar_one_or_none()
    if officer:
        await db.delete(officer)
        await db.commit()
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Officer not found")

@app.post("/api/assign")
async def assign_officer(request: AssignRequest, db: AsyncSession = Depends(get_db)):
    # 1. Find closest
    closest = await find_closest_officer(db, request.lat, request.lon)
    
    if not closest:
        raise HTTPException(status_code=404, detail="No available officers found.")
    
    # 2. Assign task
    success = await assign_task_to_officer(db, closest["id"], request.task_id)
    
    if success:
        return closest
    else:
        raise HTTPException(status_code=500, detail="Failed to assign officer.")

    filepath = os.path.join(PROJECT_ROOT, "approved_mission.json")
    if os.path.exists(filepath):
        os.remove(filepath)
    return {"status": "ok"}

class ApprovedMission(BaseModel):
    mission_id: str
    officer_id: str
    officer_name: str
    officer_lat: float
    officer_lon: float
    victim_lat: float
    victim_lon: float
    hospital_name: str
    hospital_lat: float
    hospital_lon: float
    severity: str
    victim_count: int

@app.post("/api/approve-mission")
async def approve_mission(data: ApprovedMission, db: AsyncSession = Depends(get_db)):
    query = select(GroundOfficer).where(GroundOfficer.id == data.officer_id)
    result = await db.execute(query)
    officer = result.scalar_one_or_none()
    
    if officer:
        officer.status = 'busy'
        officer.current_task_id = data.mission_id
        await db.commit()

    filepath = os.path.join(PROJECT_ROOT, "approved_mission.json")
    with open(filepath, "w") as f:
        json.dump(data.dict(), f)
    return {"status": "ok"}

@app.get("/api/approved-mission")
def get_approved_mission():
    filepath = os.path.join(PROJECT_ROOT, "approved_mission.json")
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            return json.load(f)
    return {"status": "waiting"}

class FreeOfficerRequest(BaseModel):
    officer_id: str

@app.post("/api/free-officer")
async def free_officer(request: FreeOfficerRequest, db: AsyncSession = Depends(get_db)):
    query = select(GroundOfficer).where(GroundOfficer.id == request.officer_id)
    result = await db.execute(query)
    officer = result.scalar_one_or_none()
    
    if officer:
        officer.status = 'available'
        officer.current_task_id = None
        await db.commit()

    filepath = os.path.join(PROJECT_ROOT, "approved_mission.json")

class PredictSpreadRequest(BaseModel):
    temp: float
    RH: float
    wind: float
    ISI: float
    DMC: float

@app.post("/api/v1/predict-spread")
def predict_spread(req: PredictSpreadRequest):
    if forest_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # The model expects 12 features: ['X' 'Y' 'month' 'day' 'FFMC' 'DMC' 'DC' 'ISI' 'temp' 'RH' 'wind' 'rain']
    # We will use defaults for the missing ones to avoid crashing.
    features = np.array([[
        5,           # X
        5,           # Y
        8,           # month
        5,           # day
        90.0,        # FFMC
        req.DMC,     # DMC
        500.0,       # DC
        req.ISI,     # ISI
        req.temp,    # temp
        req.RH,      # RH
        req.wind,    # wind
        0.0          # rain
    ]])
    
    # Predict area
    predicted_area = forest_model.predict(features)[0]
    
    # Derive magnitude
    spread_magnitude = float(max(50, predicted_area * 15)) # Ensure a minimum size for visualization
    
    # Derive heading (angle) based on wind, for visualization purposes
    heading = float((req.wind * 45) % 360)
    
    # Risk level classification
    if predicted_area < 2.0:
        risk_level = "Stable"
    elif predicted_area < 10.0:
        risk_level = "Moderate"
    else:
        risk_level = "Critical"
        
    return {
        "heading": heading,
        "spread_magnitude": spread_magnitude,
        "risk_level": risk_level,
        "area": float(predicted_area)
    }

class PredictIgnitionRequest(BaseModel):
    temp: float
    RH: float
    wind: float
    rain: float
    FFMC: float
    DMC: float
    ISI: float

@app.post("/api/v1/predict-ignition")
def predict_ignition(req: PredictIgnitionRequest):
    if ignition_model is None:
        raise HTTPException(status_code=503, detail="Ignition model not loaded")

    # The model expects 7 features: ['Temperature' 'RH' 'Ws' 'Rain' 'FFMC' 'DMC' 'ISI']
    features = np.array([[
        req.temp,
        req.RH,
        req.wind,
        req.rain,
        req.FFMC,
        req.DMC,
        req.ISI
    ]])
    
    # predict_proba returns [[prob_class_0, prob_class_1]]
    try:
        probabilities = ignition_model.predict_proba(features)[0]
        # Depending on the model, it might just return 1 class if it was trained on 1 class, 
        # but binary classifiers return 2.
        if len(probabilities) > 1:
            ignition_prob = float(probabilities[1] * 100)
        else:
            ignition_prob = float(probabilities[0] * 100) # fallback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    if ignition_prob < 30.0:
        risk_level = "SAFE"
    elif ignition_prob <= 70.0:
        risk_level = "WARNING"
    else:
        risk_level = "CRITICAL"
        
    return {
        "ignition_probability": round(ignition_prob, 2),
        "risk_level": risk_level
    }
