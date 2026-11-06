from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
from app.schemas import ModelInfoResponse
from app.services.predictor import predictor

router = APIRouter(prefix="/model", tags=["Model Information"])

@router.get("/info", response_model=ModelInfoResponse, summary="Get trained model metadata")
async def get_model_info():
    """
    Returns the model name, feature list, evaluation metrics, and feature importances.
    """
    if not predictor.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded."
        )

    return ModelInfoResponse(
        model_name=predictor.model_name,
        features=predictor.feature_columns,
        feature_count=len(predictor.feature_columns),
        metrics=predictor.model_metrics.get("best_model_test_metrics", {}),
        feature_importances=predictor.feature_importances
    )

@router.get("/metrics", summary="Get comprehensive cross-validation and holdout test metrics")
async def get_model_metrics() -> Dict[str, Any]:
    """
    Returns full metrics JSON including CV comparison, test results, and overfitting check.
    """
    if not predictor.model_metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found."
        )
    return predictor.model_metrics
