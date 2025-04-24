from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()  # Protect this endpoint with JWT token
def protected():
    current_user = get_jwt_identity()
    return jsonify({"success": True, "message": f"Welcome, user {current_user}!"})
