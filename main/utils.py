import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")
CHAT_FILE = os.path.join(os.path.dirname(__file__), "chat.json") 
def load_users():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)

def save_message(id, message, reply, time):
    # Load existing chat data
    if os.path.exists(CHAT_FILE):
        with open(CHAT_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    # Create the new chat message
    chat = {
        "id": id,
        "sent": message,
        "reply": reply,
        "time": time
    }

    # Append and save
    data.append(chat)
    with open(CHAT_FILE, "w") as f:
        json.dump(data, f, indent=4)