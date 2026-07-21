from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str
