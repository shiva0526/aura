# backend/assignment_ai.py
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import GroundOfficer

def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine formula
    R = 6371.0 # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

async def find_closest_officer(db: AsyncSession, disaster_lat: float, disaster_lon: float):
    # Fetch all available officers
    query = select(GroundOfficer).where(GroundOfficer.status == 'available')
    result = await db.execute(query)
    officers = result.scalars().all()

    if not officers:
        return None

    closest_officer = None
    min_distance = float('inf')

    # Calculate distance for each
    for officer in officers:
        dist = calculate_distance(disaster_lat, disaster_lon, officer.lat, officer.lon)
        if dist < min_distance:
            min_distance = dist
            closest_officer = {
                "id": officer.id,
                "name": officer.name,
                "lat": officer.lat,
                "lon": officer.lon,
                "distance": min_distance
            }

    return closest_officer

async def assign_task_to_officer(db: AsyncSession, officer_id: str, task_id: str):
    query = select(GroundOfficer).where(GroundOfficer.id == officer_id)
    result = await db.execute(query)
    officer = result.scalar_one_or_none()
    
    if officer:
        officer.status = 'busy'
        officer.current_task_id = task_id
        await db.commit()
        return True
    return False
