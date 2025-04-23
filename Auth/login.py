from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this to a secure key
jwt = JWTManager(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")

# Function to load users from a JSON file
def load_users():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

# Function to generate JWT token
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = create_access_token(identity=user_id)
    return token

# Route to handle user Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    users = load_users()
    user = next((u for u in users if u["email"].lower() == email), None)

    if user is None:
        return jsonify({
            "success": False,
            "message": "Invalid email"
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid password"
        }), 401
    
    token = generate_token(user["id"])
    return jsonify({
        "success": True,
        "access_token": token
    })

# Route to handle user Profile
@app.route("/profile", methods=["GET"])
@jwt_required()  # Protect this endpoint with JWT token
def profile():
    current_user = get_jwt_identity()  # Get current user's identity (user_id)
    users = load_users()
    user = next((u for u in users if u["id"] == current_user), None)

    if user:
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404

# Route to handle user Registration
@app.route("/register", methods=["POST"])
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

    with open(DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)

    return jsonify({"success": True, "message": "User registered successfully"}), 201

# Route to verify receiver (requires JWT token)
@app.route('/verifyReceiver', methods=['POST'])
@jwt_required()  # Protect this endpoint with JWT token
def verify_receiver():
    data = request.get_json()
    receiver_id = data.get("id")
    receiver_mobile = data.get("mobile")
    print(f"Receiver ID: {receiver_id}, Mobile: {receiver_mobile}")
    users = load_users()
    user = next((u for u in users if u["id"] == receiver_id and u["phone"] == receiver_mobile), None)

    if user is None:
       return jsonify({"success": False, "message": "Receiver's ID and Mobile do not match"}), 404
    return jsonify({"success": True, "message": "Receiver verified successfully"}), 200
   

if __name__ == "__main__":
    app.run(debug=True, port=8000)
