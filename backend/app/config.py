import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from backend directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(base_dir, '.env')
load_dotenv(env_file)

class Settings(BaseModel):
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS_RAW: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,*"
    )
    MODEL_PATH: str = os.path.join(
        base_dir,
        os.getenv("MODEL_PATH", "models/best_model.joblib")
    )
    METRICS_PATH: str = os.path.join(
        base_dir,
        os.getenv("METRICS_PATH", "models/model_metrics.json")
    )
    FEATURES_PATH: str = os.path.join(
        base_dir,
        os.getenv("FEATURES_PATH", "models/features.json")
    )

    @property
    def allowed_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS_RAW:
            return ["*"]
        origins = [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]
        return origins if origins else ["*"]

settings = Settings()
