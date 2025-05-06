import json
import os
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")
RECHARGE_FILE = os.path.join(os.path.dirname(__file__), "recharge.json")
BLOCKCHAIN_FILE = os.path.join(os.path.dirname(__file__), "blockchain.json")
BANNED_USERS = os.path.join(os.path.dirname(__file__), "banned_users.json")

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

def load_banned_users():
    if not os.path.exists(BANNED_USERS):
        return []
    with open(BANNED_USERS, "r") as f:
        return json.load(f)

def save_banned_users(banned_users):
    with open(BANNED_USERS, "w") as f:
        json.dump(banned_users, f, indent=4)

 #Blockchain functions

def load_blockchain():
    if not os.path.exists(BLOCKCHAIN_FILE):
        genesis_block = {
            "index": 0,
            "timestamp": str(datetime.now()),
            "transaction": "Genesis Block",
            "previous_hash": "0",
            "hash": "0"
        }
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump([genesis_block], f, indent=2)
    with open(BLOCKCHAIN_FILE, 'r') as f:
        return json.load(f)

def save_blockchain(chain):
    with open(BLOCKCHAIN_FILE, 'w') as f:
        json.dump(chain, f, indent=2)