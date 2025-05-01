import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# import os
from .chat import get_response
import re

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
            and also check the amount recieved by this user user
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


# current_transaction =[]
def extract_flag_and_message(input_string):
    try:
        pattern = r'"flag":\s*"(red|green|yellow)",\s*"message":\s*"(.*?)"'
        match = re.search(pattern, input_string)
        if match:
            res = "{\n"+f""""flag": "{match.group(1)}",\n"message": "{match.group(2)}" """+"\n}"
                
            
            print(f"Extracted data:\n {res.strip()}")
            # print(type(res))
            return res.strip()  
        else:
            print("No matching pattern found.")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# extract_flag_and_message(""" 'asdasdasd asdasdasdas {"flag": "green", "message": "Operation successful."} sadasdasdasdasd' """)


current_transaction = """
{'invoice_id': 'SVM3Z3PCEAL', 'amount': '125000', 'payment_method': 'bank', 'time': '2025-05-02 00:44:07',
 'sender_id': '253JWHKCKFKJ', 'sender_info': {'name': 'Abu Russel', 'phone': '01303501932', 'email': 'xyz@', 
 'location': 'Dr. M.A. Rashid Hall Electrical Substation, Dr. M.A. Rashid Hall, BUET, Dhaka, Polashi Road, Polashi, 
 Azimpur, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1211, Bangladesh'}, 'receiver_id': '987LKJHGFDS', 
 'receiver_info': {'name': 'Fatema Khan', 'phone': '01712345678', 'email': 'fatema.k@email.com'}, 'note': 'hi'}
"""
user_id = "987LKJHGFDS"
# check_fraud_Ai(user_id, current_transaction)

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