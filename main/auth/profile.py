from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from utils import load_users
from flask_cors import CORS

profile_bp = Blueprint('profile', __name__)

# Route to handle user Profile
@profile_bp.route("/profile", methods=["GET"])
@jwt_required()  # Protect this endpoint with JWT token
def profile():
    current_user = get_jwt_identity()  # Get current user's identity (user_id)
    users = load_users()
    user = next((u for u in users if u["id"] == current_user), None)

    if user:
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404
