from datetime import datetime
import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import joblib
import pandas as pd
# import os
from .chat import get_response
import re
from .fraudai import generate_fraudulent_transaction, generate_normal_transaction

# Get the absolute path of the file
# file_path = os.path.join(os.getcwd(), 'main\\auth\\fraud_list.json')
# print(f"File path: {file_path}")


fraud_bp = Blueprint('fraud', __name__)

def is_user_in_fraud_list(user_id):
    try:
        with open('main\\auth\\fraud_list.json', 'r') as file:
            fraud_list = json.load(file)
            for user in fraud_list:
                if user['user_id'] == user_id:
                    print(f"User {user_id} is in the fraud list.")
                    return True
        # return {user['user_id']: user for user in fraud_list}
    except (FileNotFoundError):
        print("Fraud list file not found or is empty.")
        return False
    except json.JSONDecodeError:
        print("Error decoding JSON from the fraud list file.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False
    else:
        print(f"User {user_id} is not in the fraud list.")
        return False
# is_user_in_fraud_list("user123")
# Load the trained model
model = joblib.load('fraud_detection_model.pkl')

# Function to preprocess the transaction data for the model
def preprocess_transaction(transaction):
    df = pd.DataFrame([{
        'amount': transaction['amount'],
        'payment_method': {"card": 0, "bank_transfer": 1, "crypto": 2}[transaction['payment_method']],
        'sender_location': 1 if 'Fraud' in transaction['sender_info']['location'] else 0,
        'hour': datetime.strptime(transaction['time'], '%Y-%m-%d %H:%M:%S').hour,
        'day_of_week': datetime.strptime(transaction['time'], '%Y-%m-%d %H:%M:%S').weekday()
    }])
    return df

# Function to check fraud using AI model
def check_fraud(transaction):
    # Preprocess the transaction data
    processed_data = preprocess_transaction(transaction)

<<<<<<< HEAD
    # Predict fraud using the trained model
    prediction = model.predict(processed_data)[0]
=======
def check_fraud_Ai(user_id, current_transaction):
    previsous_Transactions = []
    res = """ "flag": "red", "message": "Operation unsuccessful." """
    try :
        count = 0
        with open('main\\auth\\invoice.json', 'r') as file:
            invoices = json.load(file)
            for invoice in invoices:
                if(invoice['receiver_id'] == user_id):
                    print(f"{count+1} : User transaction {invoice['invoice_id']} is in the list.")
                    previsous_Transactions.append(invoice)
                    count += 1
                if count == 20:
                    break
                    # return True
        prompt = f"""
            give me clean json code nothing else, not a single extra word, just the json code.
            check if the follwing transaction of user {user_id} is consistent with the previous transactions of the user.
            carefully check the locations this user recieves from, like the cities and countries, if that varies thats a red flag
            and also check the amount recieved by this user. The user may be found as sender_id or reciever_id in the previous transactions.
            the previous transactions are:
            {previsous_Transactions}
            the current transaction is:
            {current_transaction}
            respond with clean Json format in this format:
            "flag": "red" or "green"
            "message" : "a short message in lone line about the transaction about if there is prababale fraud or not"
             give me one clean json code nothing else, not a single extra word, just the json code,
        """
        chat_response = get_response(prompt, user_id)
        # print(f"Prompt: {prompt}")
        print(f"Chat response: {chat_response}")
        print(f"Chat response type: {type(chat_response)}")
        res = extract_flag_and_message(chat_response)
        return res.strip()
    except (FileNotFoundError):
        print("invoice list file not found or is empty.")
        return res.strip()
    except json.JSONDecodeError:
        print("Error decoding JSON from the invoice list file.")
        return res.strip()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return res.strip()
        # return {user['user_id']: user for user in fraud_list}
>>>>>>> c2937586b59c318d652acfac3b6e1a3e0b153186

    # Return prediction result
    if prediction == 1:  # Fraudulent
        return json.dumps({"message": "This transaction is need review.", "flag": "red"})
    else:  # Normal
        return json.dumps({"message": "This transaction is normal.", "flag": "green"})

# Endpoint to handle fraud detection

@fraud_bp.route("/fraud", methods=["POST"])
@jwt_required()  # Protect this endpoint with JWT token
def fraud():
    current_user = get_jwt_identity()
    data = request.get_json()
    receiver_id = data.get("receiver_id")
    # sender_id = current_user['user_id']


    if not receiver_id:
        return jsonify({"error": "receiver_id is required"}), 400

    if is_user_in_fraud_list(receiver_id):
        return jsonify({"message": f"User {receiver_id} is in the fraud list {current_user} ", "flag": "red"}), 200
    else:
        # Example transaction data (replace with actual incoming data)
        current_transaction = {
            "invoice_id": "8BY6E2VMSHZ",
            "amount": 125000,
            "payment_method": "card",
            "time": "2025-05-02 01:14:32",
            "sender_id": "253JWHKCKFKJ",
            "sender_info": {
                "name": "Abu Russel",
                "phone": "01303501932",
                "email": "xyz@fraud.com",  # Example of fraudulent email
                "location": "Scamville"
            },
            "receiver_id": receiver_id,
            "receiver_info": {
                "name": "Fatema Khan",
                "phone": "01712345678",
                "email": "fatema.k@email.com"
            },
            "note": "Fraudulent transaction"
        }
        current_transaction = generate_fraudulent_transaction()
        # Use the AI model to check for fraud
        fraud_check_result = check_fraud(current_transaction)
        
        return json.loads(fraud_check_result)