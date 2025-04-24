from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from utils import load_users

login_bp = Blueprint('login', __name__)

def generate_token(user_id):
    return create_access_token(identity=user_id)

@login_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    users = load_users()
    user = next((u for u in users if u["email"].lower() == email), None)

    if user is None:
        return jsonify({"success": False, "message": "Invalid email"}), 401
    if not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid password"}), 401

    token = generate_token(user["id"])
    return jsonify({"success": True, "access_token": token})
