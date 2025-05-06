from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import os
from datetime import datetime
from utils import load_users
from utils import save_users
from utils import load_recharges
from utils import save_recharges
from auth.blockchain import add_block
from auth.blockchain import check_balance_integrity

recharge_bp = Blueprint('recharge', __name__)


@recharge_bp.route("/recharge", methods=["POST"])
@jwt_required()
def recharge():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get("amount")
    method = data.get("method")

    if not amount or not method:
        return jsonify({"success": False, "message": "Amount and method required"}), 400

    # Load and update user balance
    users = load_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if user is None:
        return jsonify({"success": False,"fraud":False, "message": "User not found"}), 404

    verification = check_balance_integrity(user_id, user["balance"], user["email"], user["phone"]) 
    if(verification["success"] == False):
        return jsonify({"success": False,"fraud":True, "message": verification["message"]}), 400
    

    try:
        user["balance"] = float(user.get("balance", 0)) + float(amount)
    except ValueError:
        return jsonify({"success": False,"fraud":False, "message": "Invalid amount"}), 400

    save_users(users)

    # Save recharge record
    recharges = load_recharges()
    recharge_entry = {
        "user_id": user_id,
        "amount": amount,
        "method": method,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    recharges.append(recharge_entry)
    save_recharges(recharges)
        # Save to blockchain
    add_block("Recharge",{
        "user_id": user_id,
        "amount": amount,
        "current_balance": user["balance"],
        "method": method,
        "time": recharge_entry["time"]
    })


    return jsonify({"success": True,"fraud":False, "message": "Recharge successful", "recharge": recharge_entry}), 201
