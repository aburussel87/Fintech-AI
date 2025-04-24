from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from datetime import datetime
from utils import load_users, save_users

register_bp = Blueprint('register', __name__)

@register_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    required_fields = ["firstName", "lastName", "age", "dob", "maritalStatus", 
                       "bloodGroup", "country", "division", "district", 
                       "email", "password", "phone", "id"]
    
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    users = load_users()

    if any(user["email"].lower() == email for user in users):
        return jsonify({"success": False, "message": "Email already registered"}), 409

    data["password"] = generate_password_hash(data["password"])
    data["joiningDate"] = datetime.now().strftime("%d %B %Y")
    users.append(data)

    save_users(users)

    return jsonify({"success": True, "message": "User registered successfully"}), 201
