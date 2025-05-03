import json
import hashlib
import os
from datetime import datetime
from utils import load_blockchain, save_blockchain
from flask import Blueprint, jsonify

blockchain_bp = Blueprint('blockchain', __name__)

def calculate_hash(block):
    block_string = json.dumps(block, sort_keys=True).encode()
    return hashlib.sha256(block_string).hexdigest()

def add_block(transaction_data):
    chain = load_blockchain()
    last_block = chain[-1]
    print(transaction_data)
    new_block = {
        "index": len(chain),
        "timestamp": str(datetime.now()),
        "transaction": transaction_data,
        "previous_hash": last_block["hash"]
    }
    new_block["hash"] = calculate_hash(new_block)

    chain.append(new_block)
    save_blockchain(chain)
