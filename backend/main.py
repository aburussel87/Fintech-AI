from fastapi import FastAPI
from app.routes import auth, payment, dashboard

app = FastAPI(title="FinGuardAI Backend")

# Include route groups
app.include_router(auth.router, prefix="/auth")
app.include_router(payment.router, prefix="/payment")
app.include_router(dashboard.router, prefix="/dashboard")

# Root test route
@app.get("/")
def read_root():
    return {"message": "Welcome to FinGuardAI API"}
