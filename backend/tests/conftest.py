import asyncio
import os

# Set environment to test before importing app or settings
os.environ["ENVIRONMENT"] = "test"

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database import Base, get_db

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    raise RuntimeError("TEST_DATABASE_URL must be set before running backend tests.")

test_db_name = make_url(TEST_DATABASE_URL).database or ""
if "test" not in test_db_name.lower():
    raise RuntimeError("Refusing to run tests against a database whose name does not contain 'test'.")

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

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
