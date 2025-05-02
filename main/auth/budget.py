import random
import string
from flask import Blueprint, request, jsonify
import json
import os

# from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required, get_jwt_identity


budget_bp = Blueprint('budget', __name__)

def generateBudgetId():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# Route for saving a new budget
@budget_bp.route('/save_budget', methods=['POST'])
@jwt_required()
def save_budget_route():
    data = request.get_json()
    print(data)
    # Ensure the required fields are provided
    required_fields = [ 'budgetName', 'currency', 'income', 'expenses']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Extract the user ID from the request (or assume it's passed in the data)
    # user_id = data.get('user_id')
    user_id = get_jwt_identity()  # Get user ID from JWT token
    if not user_id:
        return jsonify({"error": "User ID is required"}), 401
    # data.add('budgetID', generateBudgetId())
    # Try adding the new budget
    success = add_budget(user_id, data)
    
    if success:
        return jsonify({"success": True, "message": "Budget saved successfully"}), 201
    else:
        return jsonify({"error": "Failed to save budget"}), 500

# Function to add the budget (handles storage)
def add_budget(user_id, new_budget):
    try:
        file_path = 'main\\auth\\budgets.json'

        # Ensure budgetId and user_id are set
        new_budget['budgetId'] = generateBudgetId()
        if 'budgetId' not in new_budget or not new_budget['budgetId']:
            raise ValueError("budgetId is required in new_budget.")
        new_budget['user_id'] = user_id    
        # Load existing budgets if file exists
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                try:
                    budgets = json.load(file)
                except json.JSONDecodeError:
                    budgets = []
        else:
            budgets = []

        # Check for duplicate budgetId
        for budget in budgets:
            if budget['budgetId'] == new_budget['budgetId']:
                raise ValueError("A budget with this budgetId already exists.")

        # Add the new budget
        budgets.append(new_budget)

        # Save back to file
        with open(file_path, 'w') as file:
            json.dump(budgets, file, indent=2)

        print(f"✅ Budget {new_budget['budgetId']} for user {user_id} saved.")
        return True

    except Exception as e:
        print(f"❌ Error saving budget: {e}")
        return False

# Route for getting a user's budget (already exists)
@budget_bp.route('/get_budget', methods=['POST'])
def get_budget_route():
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    budget = get_budget(user_id)
    
    if budget is None:
        return jsonify({"error": "Budget not found"}), 404
    
    return jsonify({"budget": budget}), 200

# Function to get a user's budget (already exists)
def get_budget(user_id):
    try:
        with open('main\\auth\\budgets.json', 'r') as file:
            budgets = json.load(file)
            user_budgets = [budget for budget in budgets if budget['user_id'] == user_id]
            if user_budgets:
                print(f"{len(user_budgets)} budget(s) found for user {user_id}.\n")
                return user_budgets
            else:
                print(f"No budgets found for user {user_id}.")
                return []
    except FileNotFoundError:
        print("Budget file not found or is empty.")
        return []
    except json.JSONDecodeError:
        print("Error decoding JSON from the budget file.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []

# Example usage for adding a new budget
new_budget = {
    "budgetName": "November Budget",
    "currency": "BDT",
    "income": [{"source": "Salary", "amount": 25000}],
    "expenses": [
        {
            "category": "Housing",
            "items": [
                {"item": "Rent", "name": "Housing", "amount": 6000},
                {"item": "Utilities", "name": "Electricity", "amount": 1500}
            ]
        },
        {
            "category": "Savings",
            "items": [
                {"item": "Emergency Fund", "name": "Savings", "amount": 3000}
            ]
        }
    ]
}

# user_id = "user123"
# add_budget(user_id, new_budget)
# print(get_budget(user_id))