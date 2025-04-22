from fastapi import APIRouter, HTTPException
from app.models.user import UserCreate, LoginRequest
from app.utils.jwt_handler import create_jwt
from app.utils.db import get_connection
from passlib.hash import bcrypt

router = APIRouter()

@router.post("/register")
def register_user(user: UserCreate):
    # 1. Connect to DB
    # 2. Check if user already exists
    # 3. Hash password and insert user
    pass

@router.post("/login")
def login_user(credentials: LoginRequest):
    # 1. Fetch user from DB by email
    # 2. Verify password
    # 3. Return JWT token if valid
    pass
