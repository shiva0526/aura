import asyncio
from backend.database import engine, Base, init_db

async def reset():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await init_db()

asyncio.run(reset())
