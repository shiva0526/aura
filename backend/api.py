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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def read_json(filename):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            return json.load(f)
    return None

@app.get("/status")
def get_status():
    return {
        "pulse": os.path.exists("sos_alert.json"),
        "oracle": os.path.exists("oracle_report.json"),
        "compass": os.path.exists("rescue_plan.json"),
        "shield": os.path.exists("final_plan.json")
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
    if os.path.exists("map.html"):
        return FileResponse("map.html")
    return {"status": "no map yet"}

class AssignRequest(BaseModel):
    lat: float
    lon: float
    task_id: str

@app.get("/api/officers")
async def get_officers(db: AsyncSession = Depends(get_db)):
    query = select(GroundOfficer)
    result = await db.execute(query)
    officers = result.scalars().all()
    return [{"id": o.id, "name": o.name, "lat": o.lat, "lon": o.lon, "status": o.status} for o in officers]

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
