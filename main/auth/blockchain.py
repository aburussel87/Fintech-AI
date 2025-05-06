import json
import hashlib
import os
from datetime import datetime
from utils import load_blockchain, save_blockchain
from flask import Blueprint, jsonify
from utils import load_users, save_users
from utils import load_banned_users, save_banned_users

blockchain_bp = Blueprint('blockchain', __name__)

def calculate_hash(block):
    block_string = json.dumps(block, sort_keys=True).encode()
    return hashlib.sha256(block_string).hexdigest()

def add_block(type,transaction_data):
    chain = load_blockchain()
    last_block = chain[-1]
    new_block = {
        "index": len(chain),
        "type": type,
        "timestamp": str(datetime.now()),
        "transaction": transaction_data,
        "previous_hash": last_block["hash"]
    }
    new_block["hash"] = calculate_hash(new_block)

    chain.append(new_block)
    save_blockchain(chain)


def check_balance_integrity(user_id, actual_balance, email, mobile):
    chain = load_blockchain()
    last_balance = None

    # Reverse traverse the blockchain to find the last transaction involving the user
    for block in reversed(chain):
        tx = block["transaction"]
        tx_type = block["type"]

        # For Send Money / Pay Bill (user could be sender or receiver)
        if tx_type in ["Send Money", "Pay Bill"]:
            if tx["sender_id"] == user_id:
                last_balance = tx["sender_current_balance"]
                break
            elif tx["receiver_id"] == user_id:
                last_balance = tx["receiver_current_balance"]
                break

        # For Recharge (user is the recharging person)
        elif tx_type == "Recharge" and tx["user_id"] == user_id:
            last_balance = tx["current_balance"]
            break

    # If no transaction found, assume last balance is 0
    if last_balance is None:
        last_balance = 0

    # Compare blockchain balance with actual balance
    if last_balance != actual_balance:
        print(f"Mismatch for {user_id}: blockchain={last_balance}, actual={actual_balance}")
        ban_user(email, mobile)
        return {
         "success": False,
         "message": f"Mismatch for {user_id}: blockchain={last_balance}, actual={actual_balance}"
        }


    return {"success": True, "message": "Balance integrity check passed"}

def ban_user(email, mobile):
    banned = load_banned_users()
    if not banned:
        banned = []
    banned.append({
        "email": email,
        "phone": mobile,
        "banned_at": str(datetime.now())
    })
    save_banned_users(banned)
    users = load_users()
    save_users([user for user in users if not (user["email"] == email and user["phone"] == mobile)])
