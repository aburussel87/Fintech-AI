# auth/budget.py
from flask import Blueprint, request, jsonify
import json
# from  .budgetAi import ask_budget_ai  # Assuming this function is defined in budgetAi.py
from  .storage import load_budget, save_budget  # Assuming these functions are defined in storage.py

print("Imports are working!")


budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/load_budget', methods=['POST'])
def load_user_budget():
    user_id = request.json.get('user_id')
    budget = load_budget(user_id)
    if budget:
        return jsonify({'success': True, 'budget': budget})
    else:
        return jsonify({'success': False, 'message': 'No budget found for this user.'})

@budget_bp.route('/save_budget', methods=['POST'])
def save_user_budget():
    user_id = request.json.get('user_id')
    budget_data = request.json.get('budget')
    save_budget(user_id, budget_data)
    return jsonify({'success': True, 'message': 'Budget saved successfully.'})

