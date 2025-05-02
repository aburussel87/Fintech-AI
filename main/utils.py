import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")
RECHARGE_FILE = os.path.join(os.path.dirname(__file__), "recharge.json")
def load_users():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)

def load_recharges():
    if not os.path.exists(RECHARGE_FILE):
        return []
    with open(RECHARGE_FILE, "r") as f:
        return json.load(f)

# Save recharge data to the JSON file
def save_recharges(recharges):
    with open(RECHARGE_FILE, "w") as f:
        json.dump(recharges, f, indent=4)