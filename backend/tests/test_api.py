import pytest
import httpx
from app.main import app

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.mark.anyio
async def test_root_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"

@pytest.mark.anyio
async def test_health_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True

@pytest.mark.anyio
async def test_predict_endpoint_genuine():
    payload = {
        "username": "sarah_travels",
        "accountType": "public",
        "posts": 150,
        "followers": 3200,
        "following": 500,
        "bio": "Travel writer & photographer ✈️",
        "hasProfilePic": True,
        "isVerified": False
    }
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "sarah_travels"
        assert data["prediction"] == "genuine"
        assert data["riskScore"] < 50
        assert "flags" in data

@pytest.mark.anyio
async def test_predict_endpoint_fake():
    payload = {
        "username": "bot77712345",
        "accountType": "private",
        "posts": 0,
        "followers": 1,
        "following": 4200,
        "bio": "",
        "hasProfilePic": False,
        "isVerified": False
    }
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "bot77712345"
        assert data["prediction"] == "fake"
        assert data["riskScore"] >= 65

@pytest.mark.anyio
async def test_validation_error():
    payload = {"username": ""}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/predict", json=payload)
        assert response.status_code == 422
