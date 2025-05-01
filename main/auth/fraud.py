import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# import os
from .chat import get_response

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



def check_fraud_Ai(user_id, current_transaction):
    previsous_Transactions = []
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
            check if the follwing transaction of user {user_id} is consistent with the previous transactions of the user.
            carefully check the locations this user recieves from, like the cities and countries, if that varies thats a red flag
            and also check the amount recieved by this user user
            the previous transactions are:
            {previsous_Transactions}
            the current transaction is:
            {current_transaction}
            respond with clean Json format in this format:
            "flag": "red" or "green" or "yellow"
            "message" : "a short message about the transaction about if there is prababale fraud or not"
        """
        chat_response = get_response(prompt, user_id)
        # print(f"Prompt: {prompt}")
        print(f"Chat response: {chat_response}")
        return chat_response
    except (FileNotFoundError):
        print("invoice list file not found or is empty.")
        return False
    except json.JSONDecodeError:
        print("Error decoding JSON from the invoice list file.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False
        # return {user['user_id']: user for user in fraud_list}


current_transaction =[]


@fraud_bp.route("/fraud", methods=["POST"])
@jwt_required()  # Protect this endpoint with JWT token
def fraud():
    current_user = get_jwt_identity()
    data = request.get_json()
    reciever_id = data.get("receiver_id")
    # sender_id = current_user['user_id']

    if not reciever_id:
        return jsonify({"error": "reciever_id is required"}), 400

    if is_user_in_fraud_list(reciever_id):
        return jsonify({"message": f"User {reciever_id} is in the fraud list {current_user} ","flag": "red"}), 200
    else:

        # return jsonify({"message": f"User {reciever_id} is not in the fraud list{current_user}","flag":"green"}), 200
        data = check_fraud_Ai("253JWHKCKFKJ", current_transaction)
        return json.loads(data)
    
def check_fraud(reciever_id,current_user,current_transaction):

    if is_user_in_fraud_list(reciever_id):
        return json.dumps({
        "message": f"User {reciever_id} is in the fraud list",
        "flag": "red"
        }), 200

    
    else:

        # return jsonify({"message": f"User {reciever_id} is not in the fraud list{current_user}","flag":"green"}), 200
        data = check_fraud_Ai(reciever_id, current_transaction)
        return data