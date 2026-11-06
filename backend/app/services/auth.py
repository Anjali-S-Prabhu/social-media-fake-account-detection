import os
import json
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.schemas import UserRegister, UserLogin, UserResponse, AuthResponse

class AuthService:
    def __init__(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.data_dir = os.path.join(backend_dir, 'data')
        os.makedirs(self.data_dir, exist_ok=True)
        self.users_file = os.path.join(self.data_dir, 'users.json')
        self.users: Dict[str, Dict[str, Any]] = {}
        self.sessions: Dict[str, str] = {} # token -> user_id
        self._load_users()

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()

    def _load_users(self):
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    self.users = json.load(f)
            except Exception:
                self.users = {}
        
        # Ensure default demo user exists
        demo_email = "demo@fade.ai"
        if demo_email not in self.users:
            demo_id = "user_demo_001"
            self.users[demo_email] = {
                "id": demo_id,
                "name": "Sarah Connor",
                "email": demo_email,
                "password_hash": self._hash_password("fade2026"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self._save_users()

    def _save_users(self):
        with open(self.users_file, 'w') as f:
            json.dump(self.users, f, indent=2)

    def register(self, data: UserRegister) -> AuthResponse:
        email = data.email.strip().lower()
        if email in self.users:
            raise ValueError("An account with this email already exists.")
        
        user_id = "user_" + str(uuid.uuid4())[:8]
        user_record = {
            "id": user_id,
            "name": data.name.strip(),
            "email": email,
            "password_hash": self._hash_password(data.password),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.users[email] = user_record
        self._save_users()

        token = "token_" + str(uuid.uuid4())
        self.sessions[token] = user_id

        return AuthResponse(
            token=token,
            user=UserResponse(
                id=user_record["id"],
                name=user_record["name"],
                email=user_record["email"],
                created_at=user_record["created_at"]
            )
        )

    def login(self, data: UserLogin) -> AuthResponse:
        email = data.email.strip().lower()
        user_record = self.users.get(email)
        if not user_record:
            raise ValueError("Invalid email or password.")
        
        if self._hash_password(data.password) != user_record["password_hash"]:
            raise ValueError("Invalid email or password.")

        token = "token_" + str(uuid.uuid4())
        self.sessions[token] = user_record["id"]

        return AuthResponse(
            token=token,
            user=UserResponse(
                id=user_record["id"],
                name=user_record["name"],
                email=user_record["email"],
                created_at=user_record["created_at"]
            )
        )

    def get_user_by_token(self, token: str) -> Optional[UserResponse]:
        user_id = self.sessions.get(token)
        if not user_id:
            return None
        for record in self.users.values():
            if record["id"] == user_id:
                return UserResponse(
                    id=record["id"],
                    name=record["name"],
                    email=record["email"],
                    created_at=record["created_at"]
                )
        return None

auth_service = AuthService()
