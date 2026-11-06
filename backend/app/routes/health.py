from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.predictor import predictor
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Returns service health status, whether ML model is loaded, and environment info.
    """
    return HealthResponse(
        status="healthy" if predictor.is_loaded() else "degraded",
        model_loaded=predictor.is_loaded(),
        model_name=predictor.model_name,
        environment=settings.ENVIRONMENT
    )
