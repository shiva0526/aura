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
    # Calculate next ID
    query = select(GroundOfficer)
    result = await db.execute(query)
    count = len(result.scalars().all())
    new_id = f"GO-{str(count + 1).zfill(2)}"
    
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
    if os.path.exists(filepath):
        os.remove(filepath)
    return {"status": "ok"}
