from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils import load_users, load_recharges
import json
import os

statement_bp = Blueprint('statement', __name__)

INVOICE_FILE = os.path.join(os.path.dirname(__file__), "invoice.json")

def load_invoices():
    if not os.path.exists(INVOICE_FILE):
        return []
    with open(INVOICE_FILE, "r") as f:
        return json.load(f)

# Route to handle user statement
@statement_bp.route("/statement", methods=["GET"])
@jwt_required()
def statement():
    current_user = get_jwt_identity()
    users = load_users()
    user = next((u for u in users if u["id"] == current_user), None)

    if user:
        transactions = []

        # Load and filter recharges
        recharges = load_recharges()
        user_recharges = [r for r in recharges if r["user_id"] == current_user]
        for r in user_recharges:
            transactions.append({
                "type": "recharge",
                "amount": float(r["amount"]),
                "method": r["method"],
                "time": r["time"],
                "details": f"Recharged via {r['method']}"
            })

        # Load and filter invoices (send money)
        invoices = load_invoices()
        user_invoices = [i for i in invoices if i["sender_id"] == current_user]
        for i in user_invoices:
            transactions.append({
                "type": "send_money",
                "amount": -float(i["amount"]),
                "method": i["payment_method"],
                "time": i["time"],
                "details": f"Sent money to {i['receiver_info'].get('name', 'Unknown')} -- invoice id {i['invoice_id']}"
            })
        user_invoices = [i for i in invoices if i["receiver_id"] == current_user]
        for i in user_invoices:
            transactions.append({
                "type": "recieved_money",
                "amount": float(i["amount"]),
                "method": i["payment_method"],
                "time": i["time"],
                "details": f"Recieved money from {i['sender_info'].get('name', 'Unknown')} -- invoice id {i['invoice_id']}"
            })

        # Optional: Sort by time (newest first)
        transactions.sort(key=lambda x: x["time"], reverse=True)

        return jsonify({"success": True, "transactions": transactions})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404
