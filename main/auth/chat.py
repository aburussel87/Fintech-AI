# from flask import Flask, request, jsonify,Blueprint
# from flask_cors import CORS
# import ollama
# from flask_jwt_extended import jwt_required, get_jwt_identity

# chat_bp = Blueprint('chat', __name__)
# model = 'llama3.2:3b'
# # Initial context for the chatbot
# previous_messages = [
#     {'role': 'user', 'content': 'You are a FinanceGPT from Bangladesh, a large language model trained to assist with financial queries. You are helpful, creative, clever, and very friendly.'},
#     {'role': 'assistant', 'content': 'Hello! I am FinanceGPT, your friendly financial assistant. How can I help you today?'},
#     {'role': 'user', 'content': 'Your answers should not be too long, make them short and concise.'},
# ]

# @chat_bp.route('/chat', methods=['POST'])
# # app = Flask(__name__)
# # CORS(app)  # Enable CORS for all routes



# def get_response(prompt):
#     global previous_messages
#     print(f"User prompt: {prompt}")
#     previous_messages.append({'role': 'user', 'content': prompt})
    
#     response = ollama.chat(model=model, messages=previous_messages)
#     bot_message = response['message']['content']
    
#     previous_messages.append({'role': 'assistant', 'content': bot_message})
#     print(f"Bot response: {bot_message}")
    
#     return bot_message

# # @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.get_json()
#     user_message = data.get('message', '')
#     if not user_message:
#         return jsonify({'response': 'Please provide a valid message.'}), 400

#     bot_response = get_response(user_message)
#     return jsonify({'response': bot_response})








# auth/chat.py
from flask import Blueprint, request, jsonify
import ollama

chat_bp = Blueprint('chat', __name__)
model = 'llama3.2:3b'

# Initial context for chatbot
previous_messages = [
    {'role': 'user', 'content': 'You are a FinanceGPT from Bangladesh, a large language model trained to assist with financial queries. You are helpful, creative, clever, and very friendly.'},
    {'role': 'assistant', 'content': 'Hello! I am FinanceGPT, your friendly financial assistant. How can I help you today?'},
    {'role': 'user', 'content': 'Your answers should not be too long, make them short and concise.'},
]

def get_response(prompt):
    global previous_messages
    print(f"User prompt: {prompt}")
    previous_messages.append({'role': 'user', 'content': prompt})
    
    response = ollama.chat(model=model, messages=previous_messages)
    bot_message = response['message']['content']
    
    previous_messages.append({'role': 'assistant', 'content': bot_message})
    print(f"Bot response: {bot_message}")
    
    return bot_message

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'response': 'Please provide a valid message.'}), 400

    response = get_response(message)
    return jsonify({'response': response})
