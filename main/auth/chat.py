from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from utils import load_users, save_message

chat_bp = Blueprint('chat', __name__)

chat_replies = [
    {
        "id": 1,
        "message": "Hello! How can I assist you today?",
        "timestamp": "2023-10-01T12:00:00Z"
    },
    {
        "id": 2,
        "message": "I'm here to help with your queries.",
        "timestamp": "2023-10-01T12:05:00Z"
    }
]

def get_message(user_id, sent_message):
    # Get current timestamp
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Get a simple bot reply (could be improved with NLP later)
    bot_reply = chat_replies[0]["message"]

    # Save the conversation (Make sure save_message function is well-defined)
    save_message(user_id, sent_message, bot_reply, time)

    # Return the bot's reply
    return bot_reply


@chat_bp.route("/chat", methods=["GET", "POST"])
@jwt_required()
def chat():
    try:
        # Get sender's ID from JWT token
        sender = get_jwt_identity()
        users = load_users()  # Load user data from your storage system
        data = request.get_json()  # Get JSON data from the request
        sent_message = data.get("text")  # Match frontend key "text"

        # Find the user from the loaded users data
        user = next((u for u in users if u["id"] == sender), None)

        if user:
            # Get the bot's response
            reply = get_message(user["id"], sent_message)
            return jsonify({"success": True, "message": reply}), 200
        else:
            # Return error if user not found
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        # Catch any unexpected errors and return a message
        return jsonify({"success": False, "message": str(e)}), 500
