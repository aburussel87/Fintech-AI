from fastapi import APIRouter, Depends
from app.models.transaction import PaymentData
from app.utils.jwt_handler import verify_jwt
from app.utils.fraud_detector import is_fraudulent
from app.utils.db import get_connection

router = APIRouter()

@router.post("/")
def make_payment(data: PaymentData, user_id=Depends(verify_jwt)):
    # 1. Fetch sender balance
    # 2. Fraud detection check
    # 3. Deduct sender, credit receiver
    # 4. Log transaction
    # 5. Return success or fail message
    pass
