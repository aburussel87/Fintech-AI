# import pandas as pd
# import random
# import faker
# import json
# import joblib
# from datetime import datetime, timedelta
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import LabelEncoder

# # Initialize Faker library for generating fake data
# fake = faker.Faker()

# # Fraudulent domain and location lists
# fraudulent_domains = ['fraud.com', 'examplefraud.com', 'scamemail.com']
# fraudulent_locations = [
#     'Unknown Location', 'Fake City', 'Falsified Address', '123 Fraud St', 'Scamville'
# ]

# # Function to generate a fraudulent transaction
# def generate_fraudulent_transaction():
#     transaction = {
#         "invoice_id": fake.uuid4(),
#         "amount": round(random.uniform(10000, 100000), 2),  # High amounts for fraud
#         "payment_method": random.choice(["card", "bank_transfer", "crypto"]),
#         "time": fake.date_time_this_year().strftime('%Y-%m-%d %H:%M:%S'),
#         "sender_id": fake.uuid4(),
#         "sender_info": {
#             "name": fake.name(),
#             "phone": fake.phone_number(),
#             "email": fake.user_name() + '@' + random.choice(fraudulent_domains),
#             "location": random.choice(fraudulent_locations)
#         },
#         "receiver_id": fake.uuid4(),
#         "receiver_info": {
#             "name": fake.name(),
#             "phone": fake.phone_number(),
#             "email": fake.email()
#         },
#         "note": "Fraudulent transaction"
#     }
#     return transaction

# # Function to generate a normal transaction
# def generate_normal_transaction():
#     transaction = {
#         "invoice_id": fake.uuid4(),
#         "amount": round(random.uniform(10, 1000), 2),  # Normal amounts
#         "payment_method": random.choice(["card", "bank_transfer", "crypto"]),
#         "time": fake.date_time_this_year().strftime('%Y-%m-%d %H:%M:%S'),
#         "sender_id": fake.uuid4(),
#         "sender_info": {
#             "name": fake.name(),
#             "phone": fake.phone_number(),
#             "email": fake.user_name() + '@' + 'gmail.com',  # Normal email
#             "location": fake.address()
#         },
#         "receiver_id": fake.uuid4(),
#         "receiver_info": {
#             "name": fake.name(),
#             "phone": fake.phone_number(),
#             "email": fake.email()
#         },
#         "note": "Normal transaction"
#     }
#     return transaction

# # Generate synthetic dataset
# def generate_synthetic_data(num_fraudulent, num_normal):
#     data = []
    
#     # Generate fraudulent data
#     for _ in range(num_fraudulent):
#         data.append(generate_fraudulent_transaction())
    
#     # Generate normal data
#     for _ in range(num_normal):
#         data.append(generate_normal_transaction())
    
#     return data

# # Generate 100,000 fraudulent and 1,000 normal transactions
# synthetic_data = generate_synthetic_data(100000, 1000)

# # Convert the data to a DataFrame
# def data_to_dataframe(data):
#     records = []
#     for transaction in data:
#         record = {
#             "invoice_id": transaction['invoice_id'],
#             "amount": transaction['amount'],
#             "payment_method": transaction['payment_method'],
#             "time": transaction['time'],
#             "sender_id": transaction['sender_id'],
#             "sender_name": transaction['sender_info']['name'],
#             "sender_phone": transaction['sender_info']['phone'],
#             "sender_email": transaction['sender_info']['email'],
#             "sender_location": transaction['sender_info']['location'],
#             "receiver_id": transaction['receiver_id'],
#             "receiver_name": transaction['receiver_info']['name'],
#             "receiver_phone": transaction['receiver_info']['phone'],
#             "receiver_email": transaction['receiver_info']['email'],
#             "note": transaction['note'],
#             "fraud": 1 if "Fraudulent" in transaction['note'] else 0  # 1 for fraud, 0 for normal
#         }
#         records.append(record)
#     return pd.DataFrame(records)

# # Convert synthetic data to DataFrame
# df = data_to_dataframe(synthetic_data)

# # Preprocessing and feature engineering
# df['amount'] = df['amount']  # Keep amount as numeric
# df['payment_method'] = df['payment_method'].map({"card": 0, "bank_transfer": 1, "crypto": 2})  # Encoding payment_method
# df['sender_location'] = df['sender_location'].apply(lambda x: 1 if 'Fraud' in x else 0)  # Binary encoding for location

# # Extracting date-time features
# df['time'] = pd.to_datetime(df['time'])
# df['hour'] = df['time'].dt.hour
# df['day_of_week'] = df['time'].dt.dayofweek

# # Features and target
# X = df[['amount', 'payment_method', 'sender_location', 'hour', 'day_of_week']]
# y = df['fraud']

# # Split data into training and testing sets
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # Initialize and train the RandomForestClassifier
# model = RandomForestClassifier(n_estimators=100, random_state=42)
# model.fit(X_train, y_train)

# # Save the trained model to a .pkl file
# joblib.dump(model, 'fraud_detection_model.pkl')

# print("Model trained and saved to 'fraud_detection_model.pkl'.")


import pandas as pd
import joblib
from datetime import datetime
import random
import faker

# Initialize Faker library for generating fake data
fake = faker.Faker()

# Load the trained model
model = joblib.load('fraud_detection_model.pkl')

# Function to generate a fraudulent transaction
def generate_fraudulent_transaction():
    return {
        "invoice_id": fake.uuid4(),
        "amount": round(random.uniform(10000, 100000), 2),  # High amounts for fraud
        "payment_method": random.choice(["card", "bank_transfer", "crypto"]),
        "time": fake.date_time_this_year().strftime('%Y-%m-%d %H:%M:%S'),
        "sender_id": fake.uuid4(),
        "sender_info": {
            "name": fake.name(),
            "phone": fake.phone_number(),
            "email": fake.user_name() + '@fraud.com',  # Fraudulent email
            "location": "Scamville"  # Fraudulent location
        },
        "receiver_id": fake.uuid4(),
        "receiver_info": {
            "name": fake.name(),
            "phone": fake.phone_number(),
            "email": fake.email()
        },
        "note": "Fraudulent transaction"
    }

# Function to generate a normal transaction
def generate_normal_transaction():
    return {
        "invoice_id": fake.uuid4(),
        "amount": round(random.uniform(10, 1000), 2),  # Normal amounts
        "payment_method": random.choice(["card", "bank_transfer", "crypto"]),
        "time": fake.date_time_this_year().strftime('%Y-%m-%d %H:%M:%S'),
        "sender_id": fake.uuid4(),
        "sender_info": {
            "name": fake.name(),
            "phone": fake.phone_number(),
            "email": fake.user_name() + '@gmail.com',  # Normal email
            "location": fake.address()  # Normal location
        },
        "receiver_id": fake.uuid4(),
        "receiver_info": {
            "name": fake.name(),
            "phone": fake.phone_number(),
            "email": fake.email()
        },
        "note": "Normal transaction"
    }

# Generate a fraudulent transaction for testing
# transaction = generate_fraudulent_transaction()
# transaction = generate_normal_transaction()

# Convert the generated transaction into the format expected by the model
def preprocess_transaction(transaction):
    df = pd.DataFrame([{
        'amount': transaction['amount'],
        'payment_method': {"card": 0, "bank_transfer": 1, "crypto": 2}[transaction['payment_method']],
        'sender_location': 1 if 'Fraud' in transaction['sender_info']['location'] else 0,
        'hour': datetime.strptime(transaction['time'], '%Y-%m-%d %H:%M:%S').hour,
        'day_of_week': datetime.strptime(transaction['time'], '%Y-%m-%d %H:%M:%S').weekday()
    }])
    return df

# Preprocess the transaction data
# processed_data = preprocess_transaction(transaction)

# Predict using the trained model
# prediction = model.predict(processed_data)[0]


# Output the result
# if prediction == 1:
#     print("This transaction is fraudulent.")
# else:
#     print("This transaction is normal.")

def predict_fraud(transaction):
    # Preprocess the transaction data
    processed_data = preprocess_transaction(transaction)
    
    # Predict using the trained model
    prediction = model.predict(processed_data)[0]
    
    return prediction

# if predict_fraud(generate_fraudulent_transaction()) == 1:
#     print("This transaction is fraudulent.")
# else:
#     print("This transaction is normal.")
