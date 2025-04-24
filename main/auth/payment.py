from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils import load_users

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
    return jsonify({"success": True, "message": "Receiver verified successfully"}), 200
