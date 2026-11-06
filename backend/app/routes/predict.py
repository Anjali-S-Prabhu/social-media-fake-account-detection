from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import ProfileInput, PredictResponse, HistoryItem
from app.services.predictor import predictor
from app.services.history import history_service
import logging

logger = logging.getLogger("fade.predict")
router = APIRouter(tags=["Prediction"])

@router.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Instagram account authenticity"
)
async def predict_profile(profile: ProfileInput):
    """
    Takes Instagram profile metrics, runs inference via trained ML model,
    and returns risk score, classification, and dynamic indicators.
    """
    try:
        result = predictor.predict(profile)
        history_service.add_entry(result)
        logger.info(f"Analyzed @{profile.username}: Score={result.riskScore}, Level={result.riskLevel}")
        return result
    except RuntimeError as e:
        logger.error(f"Inference error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.exception("Unexpected error during profile prediction")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get(
    "/history",
    response_model=List[HistoryItem],
    summary="Get recent profile analysis history"
)
async def get_history():
    """Returns list of recently analyzed profiles."""
    return history_service.get_history()
