from typing import Optional, List, Dict, Any, Union, Literal
from pydantic import BaseModel, Field, field_validator
import re

class ProfileInput(BaseModel):
    username: str = Field(..., min_length=1, max_length=100, description="Instagram username")
    accountType: Optional[Literal["public", "private"]] = Field(
        default="public",
        description="Public or private account"
    )
    posts: Optional[Union[int, str]] = Field(default=0, description="Number of posts published")
    followers: Optional[Union[int, str]] = Field(default=0, description="Followers count")
    following: Optional[Union[int, str]] = Field(default=0, description="Following count")
    bio: Optional[str] = Field(default="", description="User biography / bio description")
    hasProfilePic: Optional[bool] = Field(
        default=True,
        description="Whether a custom profile picture is uploaded"
    )
    isVerified: Optional[bool] = Field(
        default=False,
        description="Whether account is verified"
    )
    dateJoined: Optional[str] = Field(
        default=None,
        description="Joined date (e.g. YYYY-MM)"
    )
    location: Optional[str] = Field(
        default=None,
        description="Account location or country"
    )

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty or whitespace only")
        # Remove leading @ if present
        if v.startswith('@'):
            v = v[1:]
        return v

    @field_validator('posts', 'followers', 'following', mode='before')
    @classmethod
    def parse_numeric(cls, v: Any) -> int:
        if v is None or v == "":
            return 0
        if isinstance(v, (int, float)):
            return max(0, int(v))
        if isinstance(v, str):
            clean = re.sub(r'[^\d]', '', v.strip())
            return int(clean) if clean else 0
        return 0

    @field_validator('bio')
    @classmethod
    def clean_bio(cls, v: Optional[str]) -> str:
        return v.strip() if v else ""

class AnalysisFlag(BaseModel):
    category: str
    description: str
    severity: Literal['low', 'medium', 'high']

class PredictResponse(BaseModel):
    username: str
    prediction: Literal['fake', 'genuine']
    probability: float
    riskScore: int
    riskLevel: Literal['low', 'medium', 'high']
    flags: List[AnalysisFlag]
    features: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    environment: str

class ModelInfoResponse(BaseModel):
    model_name: str
    features: List[str]
    feature_count: int
    metrics: Dict[str, Any]
    feature_importances: Dict[str, float]

class HistoryItem(BaseModel):
    id: str
    timestamp: str
    username: str
    riskScore: int
    riskLevel: str
    prediction: str

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class DashboardStatsResponse(BaseModel):
    total_scans: int
    fake_detected: int
    genuine_verified: int
    avg_risk_score: float
    recent_scans: List[HistoryItem]
    model_name: str
    benchmark_accuracy: float
