from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils import load_users
import os
import json
import random
import string
from datetime import datetime

payment_bp = Blueprint('payment', __name__)

@payment_bp.route("/verifyReceiver", methods=["POST"])
@jwt_required()  # Protect this endpoint with JWT token
def verify_receiver():
    data = request.get_json()
    receiver_id = data.get("id")
    receiver_mobile = data.get("mobile")
    users = load_users()
    user = next((u for u in users if u["id"] == receiver_id and u["phone"] == receiver_mobile), None)

    if user is None:
        return jsonify({"success": False, "message": "Receiver's ID and Mobile do not match"}), 404
    curr = get_jwt_identity()  # Get current user's identity (user_id)
    if curr == receiver_id:
        return jsonify({"success": False, "message": "You cannot send money to yourself"}), 400
    return jsonify({"success": True, "message": "Receiver verified successfully"}), 200


INVOICE_FILE = os.path.join(os.path.dirname(__file__), "invoice.json")
def load_invoices():
    if not os.path.exists(INVOICE_FILE):
        return []
    with open(INVOICE_FILE, "r") as f:
        return json.load(f)

def save_invoices(invoices):
    with open(INVOICE_FILE, "w") as f:
        json.dump(invoices, f, indent=4)

def generate_invoice_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=11))

@payment_bp.route("/payment/submit", methods=["POST"])
@jwt_required()
def submit_payment():
    sender_id = get_jwt_identity()  # Get sender ID from JWT
    data = request.get_json()  # Get the request data

    receiver_id = data.get("id")
    receiver_mobile = data.get("mobile")
    note = data.get("note", "")  # Default to empty string if not provided
    amount = data.get("amount")
    paymentmethod = data.get("paymentMethod")

    users = load_users()  # Load the users list/dictionary

    # Find the receiver based on ID and mobile number
    receiver = next((u for u in users if u["id"] == receiver_id and u["phone"] == receiver_mobile), None)
    if receiver is None:
        return jsonify({"success": False, "message": "Receiver not found"}), 404

    invoice_id = generate_invoice_id()  # Generate a unique invoice ID
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Get the current time

    # Find the sender using sender_id
    sender = next((u for u in users if u["id"] == sender_id), None)
    if sender is None:
        return jsonify({"success": False, "message": "Sender not found"}), 404
    invoice = {
        "invoice_id": invoice_id,
        "amount": amount,
        "payment_method": paymentmethod,
        "time": time_str,
        "sender_id": sender_id,
        "sender_info": {  # Corrected typo: "seder_info" to "sender_info"
            "name": sender["firstName"]+" " + sender["lastName"],
            "phone": sender["phone"],
            "email": sender["email"]
        },
        "receiver_id": receiver_id,
        "receiver_info": {
            "name": receiver["firstName"] + " " + receiver["lastName"],
            "phone": receiver["phone"],
            "email": receiver["email"]
        },
        "note": note,
    }

    # Load existing invoices, append the new invoice, and save
    invoices = load_invoices()
    invoices.append(invoice)
    save_invoices(invoices)

    return jsonify({"success": True, "invoice": invoice}), 201