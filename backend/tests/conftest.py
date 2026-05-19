import asyncio
import os

# Set environment to test before importing app or settings
os.environ["ENVIRONMENT"] = "test"

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database import Base, engine as app_engine
from backend.app.core.config import settings

# Use either TEST_DATABASE_URL or the default settings URL for testing
DATABASE_URL = settings.DATABASE_URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", DATABASE_URL)

@pytest_asyncio.fixture(scope="function", loop_scope="function")
async def test_engine():
    """Initializes the test database and manages the schema lifecycle."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in TEST_DATABASE_URL else {},
        poolclass=StaticPool if "sqlite" in TEST_DATABASE_URL else None,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture(scope="function", loop_scope="function")
async def db_session(test_engine):
    """Provides an isolated database session for a test."""
    from backend.app.database import async_sessionmaker, AsyncSession
    
    session_factory = async_sessionmaker(
        bind=test_engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async with session_factory() as session:
        yield session

@pytest_asyncio.fixture(loop_scope="function")
async def client(db_session):
    """Provides an AsyncClient with the database dependency overridden."""
    from backend.app.database import get_db
    
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
