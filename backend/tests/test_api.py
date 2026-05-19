import asyncio
import pytest
import uuid
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_health_check_telemetry(client: AsyncClient):
    """Verify health check and existence of telemetry headers."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert "X-Correlation-ID" in response.headers
    assert "X-Execution-Time" in response.headers
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_full_user_lifecycle(client: AsyncClient):
    """Test registration, login, and protected resource access."""
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "production_password_123",
        "full_name": "Principal Engineer"
    }
    
    # 1. Register
    reg_res = await client.post("/api/v1/auth/register", json=user_data)
    assert reg_res.status_code == 201
    assert reg_res.json()["payload"]["email"] == email

    # 2. Login
    login_data = {"username": email, "password": "production_password_123"}
    login_res = await client.post("/api/v1/auth/login", data=login_data)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Access Protected
    prot_res = await client.get("/api/v1/providers/", headers=headers)
    assert prot_res.status_code == 200
    assert prot_res.json()["status"] == "success"

@pytest.mark.asyncio
async def test_validation_constraints(client: AsyncClient):
    """Verify Pydantic validation for invalid inputs (422)."""
    # Invalid email format
    invalid_data = {"email": "not-an-email", "password": "short"}
    response = await client.post("/api/v1/auth/register", json=invalid_data)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_task_ingestion_pipeline(client: AsyncClient):
    """Verify full ingestion task creation and status retrieval."""
    # Setup: Auth & Provider
    email = f"task_owner_{uuid.uuid4().hex[:8]}@test.com"
    await client.post("/api/v1/auth/register", json={"email": email, "password": "password123"})
    login_res = await client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    prov_res = await client.post(
        "/api/v1/providers/",
        json={"name": "Ingestor", "email": f"ingest_{uuid.uuid4().hex[:8]}@test.com"},
        headers=headers,
    )
    assert prov_res.status_code == 201
    provider_id = prov_res.json()["payload"]["id"]

    # 1. Create Task (Accepted 202)
    task_payload = {
        "provider_id": provider_id,
        "payload": {"metric": "cpu_load", "value": 85.5},
        "priority": 8
    }
    task_res = await client.post("/api/v1/tasks/", json=task_payload, headers=headers)
    assert task_res.status_code == 202
    task_id = task_res.json()["payload"]["id"]

    # 2. Verify Status until the task reaches completion
    final_status = None
    for _ in range(20):
        status_res = await client.get(f"/api/v1/tasks/{task_id}", headers=headers)
        assert status_res.status_code == 200
        final_status = status_res.json()["payload"]["status"]
        if final_status == "completed":
            break
        await asyncio.sleep(1)

    assert final_status == "completed"
