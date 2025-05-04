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

def delete_budget(budgetName,user_id):
    try:
        file_path = 'main\\auth\\budgets.json'
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                budgets = json.load(file)
            # Filter out the budget to be deleted
            budgets = [budget for budget in budgets if not (budget['budgetName'] == budgetName and budget['user_id'] == user_id)]
            # Save back to file
            with open(file_path, 'w') as file:
                json.dump(budgets, file, indent=2)
            print(f"✅ Budget {budgetName} deleted successfully.")
        else:
            print("No budgets found to delete.")
    except Exception as e:
        print(f"❌ Error deleting budget: {e}")

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
    delete_budget(data['budgetName'], get_jwt_identity())
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

@budget_bp.route('/get_budget', methods=['POST'])
@jwt_required()
def get_budget_route():
    user_id = get_jwt_identity()  # Get user ID from JWT token
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 401

    budgets = get_budget(user_id)
    return jsonify({"success": True, "budgets": budgets}), 200

# Function to get a user's budgets
def get_budget(user_id):
    try:
        file_path = os.path.join('main', 'auth', 'budgets.json')
        if not os.path.exists(file_path):
            return []

        with open(file_path, 'r') as file:
            budgets = json.load(file)
            user_budgets = [budget for budget in budgets if budget['user_id'] == user_id]
            return user_budgets

    except json.JSONDecodeError:
        return []
    except Exception as e:
        print(f"Error retrieving budgets: {e}")
        return []
# Example usage for adding a new budget
# new_budget = {
#     "budgetName": "November Budget",
#     "currency": "BDT",
#     "income": [{"source": "Salary", "amount": 25000}],
#     "expenses": [
#         {
#             "category": "Housing",
#             "items": [
#                 {"item": "Rent", "name": "Housing", "amount": 6000},
#                 {"item": "Utilities", "name": "Electricity", "amount": 1500}
#             ]
#         },
#         {
#             "category": "Savings",
#             "items": [
#                 {"item": "Emergency Fund", "name": "Savings", "amount": 3000}
#             ]
#         }
#     ]
# }

# user_id = "user123"
# add_budget(user_id, new_budget)
# print(get_budget(user_id))

