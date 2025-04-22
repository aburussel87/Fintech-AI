from pydantic import BaseModel

class PaymentData(BaseModel):
    receiver_email: str
    amount: float

class TransactionRecord(BaseModel):
    sender: str
    receiver: str
    amount: float
    timestamp: str
    status: str
