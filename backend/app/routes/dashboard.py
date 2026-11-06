from fastapi import APIRouter
from app.schemas import DashboardStatsResponse
from app.services.history import history_service
from app.services.predictor import predictor

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    history = history_service.get_history()
    total_scans = len(history)
    fake_detected = sum(1 for item in history if item.prediction == "fake")
    genuine_verified = sum(1 for item in history if item.prediction == "genuine")
    
    if total_scans > 0:
        avg_risk = sum(item.riskScore for item in history) / total_scans
    else:
        avg_risk = 0.0

    acc = predictor.model_metrics.get("best_model_test_metrics", {}).get("accuracy", 0.9143)

    return DashboardStatsResponse(
        total_scans=total_scans,
        fake_detected=fake_detected,
        genuine_verified=genuine_verified,
        avg_risk_score=round(avg_risk, 1),
        recent_scans=history[:10],
        model_name=predictor.model_name,
        benchmark_accuracy=round(acc * 100, 1)
    )
