from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
