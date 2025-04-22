import joblib

# Load model once
model = joblib.load("models/fraud_model.pkl")

def is_fraudulent(sender_id, receiver_email, amount):
    # 1. Construct feature vector from sender, receiver, amount
    # 2. Use model to predict fraud
    # 3. Return True if fraudulent, else False
    pass
