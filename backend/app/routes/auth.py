from fastapi import APIRouter, HTTPException, Header, status
from typing import Optional
from app.schemas import UserRegister, UserLogin, UserResponse, AuthResponse
from app.services.auth import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(data: UserRegister):
    try:
        return auth_service.register(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=AuthResponse)
async def login_user(data: UserLogin):
    try:
        return auth_service.login(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing.")
    
    token = authorization.replace("Bearer ", "").strip()
    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    return user

