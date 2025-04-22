from jose import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY, ALGORITHM

def create_jwt(user_id: int):
    # 1. Encode user ID into JWT token
    # 2. Set expiration time for token
    # 3. Return JWT token as string
    pass

def verify_jwt(token: str):
    # 1. Decode token using secret and algorithm
    # 2. Return user ID embedded in the token if valid
    # 3. Raise exception if invalid or expired
    pass
