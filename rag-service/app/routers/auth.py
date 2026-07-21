import json
import uuid
import hashlib
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import APIRouter, HTTPException, Depends, Header

from app.models.auth import RegisterRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/api/Auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "studyrag-secret-key-change-in-production")
ALGORITHM = "HS256"
EXPIRY_HOURS = 24

USERS_FILE = Path(__file__).resolve().parent.parent.parent / "storage" / "users.json"


def _load_users() -> dict:
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text())
    return {}


def _save_users(users: dict):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    USERS_FILE.write_text(json.dumps(users, indent=2, ensure_ascii=False))


def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return f"{salt}:{h}"


def _verify_password(password: str, stored: str) -> bool:
    salt, h = stored.split(":", 1)
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return check == h


def _create_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalido")
    users = _load_users()
    user = users.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    users = _load_users()

    for u in users.values():
        if u["email"].lower() == req.email.lower():
            raise HTTPException(status_code=409, detail="El email ya esta registrado.")

    user_id = str(uuid.uuid4())
    users[user_id] = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password": _hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save_users(users)

    token = _create_token(user_id, req.email, req.name)
    return AuthResponse(id=user_id, name=req.name, email=req.email, token=token)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    users = _load_users()

    for u in users.values():
        if u["email"].lower() == req.email.lower():
            if _verify_password(req.password, u["password"]):
                token = _create_token(u["id"], u["email"], u["name"])
                return AuthResponse(id=u["id"], name=u["name"], email=u["email"], token=token)
            break

    raise HTTPException(status_code=401, detail="Email o contrasena incorrectos.")


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "createdAt": user["created_at"],
    }
