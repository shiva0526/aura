import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/aura"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def update_coords():
    async with AsyncSessionLocal() as session:
        # GO-01 to Lat: 12.4100, Lon: 75.7300
        await session.execute(
            text("UPDATE ground_officers SET lat = 12.4100, lon = 75.7300 WHERE id = 'GO-01'")
        )
        # GO-02 to Lat: 12.4300, Lon: 75.7100
        await session.execute(
            text("UPDATE ground_officers SET lat = 12.4300, lon = 75.7100 WHERE id = 'GO-02'")
        )
        # GO-03 to Lat: 12.4000, Lon: 75.7600
        await session.execute(
            text("UPDATE ground_officers SET lat = 12.4000, lon = 75.7600 WHERE id = 'GO-03'")
        )
        await session.commit()
        print("Database updated!")

if __name__ == "__main__":
    asyncio.run(update_coords())
