from fastapi import APIRouter, Depends
from app.utils.jwt_handler import verify_jwt
from app.utils.db import get_connection

router = APIRouter()

@router.get("/summary")
def get_user_summary(user_id=Depends(verify_jwt)):
    # 1. Fetch balance
    # 2. Fetch recent transactions
    pass
