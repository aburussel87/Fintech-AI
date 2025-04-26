
# auth/chat.py
from flask import Blueprint, request, jsonify
import ollama
from flask_jwt_extended import jwt_required, get_jwt_identity

chat_bp = Blueprint('chat', __name__)
model = 'llama3.2:3b'



# Initial context for chatbot
previous_messages = [
    {'role': 'user', 'content': 'You are a FinanceGPT from Bangladesh, a large language model trained to assist with financial queries. You are helpful, creative, clever, and very friendly.'},
    {'role': 'assistant', 'content': 'Hello! I am FinanceGPT, your friendly financial assistant. How can I help you today?'},
    {'role': 'user', 'content': 'Your answers should not be too long, make them short and concise.'},
]
# Maintain a dictionary for each user's conversation
user_chats = {}

def get_response(prompt, user_id):
    global user_chats

    # Initialize user chat if not exist
    if user_id not in user_chats:
        user_chats[user_id] = [
            {'role': 'user', 'content': 'You are a FinanceGPT from Bangladesh, a large language model trained to assist with financial queries. You are helpful, creative, clever, and very friendly.'},
            {'role': 'assistant', 'content': 'Hello! I am FinanceGPT, your friendly financial assistant. How can I help you today?'},
            {'role': 'user', 'content': 'Your answers should not be too long, make them short and concise.'},
        ]

    print(f"User {user_id} prompt: {prompt}")
    user_chats[user_id].append({'role': 'user', 'content': prompt})
    response = ollama.chat(model=model, messages=user_chats[user_id])
    bot_message = response['message']['content']
    print(bot_message)
    
    user_chats[user_id].append({'role': 'assistant', 'content': bot_message})
    
    return bot_message

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    id = get_jwt_identity()
    if not id:
        return jsonify({'response': 'User ID not found.'}), 401
    
    data = request.get_json()
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'response': 'Please provide a valid message.'}), 400

    response = get_response(message, id)
    return jsonify({'response': response})
