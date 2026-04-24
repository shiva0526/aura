import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/aura"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def update_orphaned_coords():
    async with AsyncSessionLocal() as session:
        # Move any leftover markers from Bengaluru to Kodagu automatically
        await session.execute(
            text("""
            UPDATE ground_officers 
            SET lat = 12.4300, lon = 75.7350 
            WHERE lat > 12.6 OR lon > 76.0
            """)
        )
        await session.commit()
        print("Orphaned markers relocated!")

if __name__ == "__main__":
    asyncio.run(update_orphaned_coords())
