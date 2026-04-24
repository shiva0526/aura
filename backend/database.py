# backend/database.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Float

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/aura"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

class GroundOfficer(Base):
    __tablename__ = "ground_officers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    status = Column(String)
    current_task_id = Column(String, nullable=True)

class PersonStuck(Base):
    __tablename__ = "people_stuck"
    id = Column(String, primary_key=True, index=True)
    lat = Column(Float)
    lon = Column(Float)
    severity = Column(String)
    status = Column(String)
    assigned_officer_id = Column(String, nullable=True)

async def init_db():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

    # Insert dummy data if table is empty
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(GroundOfficer))
        officers = result.scalars().all()
        
        if not officers:
            print("[DATABASE] Inserting dummy officers for demo...")
            dummy_data = [
                GroundOfficer(id="GO-01", name="Officer Alpha", lat=12.9750, lon=77.5900, status="available"),
                GroundOfficer(id="GO-02", name="Officer Bravo", lat=12.9600, lon=77.5800, status="busy", current_task_id="P-101"),
                GroundOfficer(id="GO-03", name="Officer Charlie", lat=12.9800, lon=77.6100, status="available")
            ]
            session.add_all(dummy_data)
            await session.commit()
            print("[DATABASE] Dummy officers inserted.")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

if __name__ == "__main__":
    asyncio.run(init_db())
    print("[DATABASE] PostgreSQL Database initialized successfully.")
