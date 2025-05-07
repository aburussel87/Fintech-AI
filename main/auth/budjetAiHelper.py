# import joblib
# import pandas as pd
# from datetime import datetime
# import json

# def flatten_user_data(user_data):
#     """
#     Flattens nested user data into a single-level dictionary.
#     Excludes 'verification', 'passwordSetup', and 'financialProfile' fields.
#     Joins 'spendingHabits' list into a string if present.
#     """
#     flat_data = {}
#     for key, value in user_data.items():
#         if key not in ['personalInfo', 'address', 'verification', 'passwordSetup', 'financialProfile']:
#             flat_data[key] = value
#     flat_data.update(user_data.get('personalInfo', {}))
#     flat_data.update(user_data.get('address', {}))
#     flat_data.update(user_data.get('financialProfile', {}))
#     if isinstance(flat_data.get("spendingHabits"), list):
#         flat_data["spendingHabits"] = ", ".join(flat_data["spendingHabits"])
#     return flat_data

# def validate_user_data(user_data):
#     """
#     Validates required fields and ensures numeric fields are in correct format.
#     Handles monthlyIncome as a range separately.
#     Allows rent to be empty/0 for 'Own home (no rent)'.
#     Handles non-numeric subscriptions and optional investments.
#     Raises ValueError for invalid or unrealistic values.
#     """
#     required_fields = [
#         "monthlyIncome", "rent", "transportCost", "groceryCost",
#         "utilitiesCost", "mobileInternetCost", "subscriptions", "loanPayment"
#     ]
#     optional_fields = ["investments"]

#     for field in required_fields + optional_fields:
#         if field not in user_data:
#             if field in optional_fields:
#                 user_data[field] = "0"  # Set optional fields to 0 if missing
#             else:
#                 raise ValueError(f"Missing required field: {field}")

#         if field == "monthlyIncome":
#             # Validate monthlyIncome as a range (e.g., "20,000–40,000")
#             try:
#                 # Handle typo in data (e.g., "20,00" → "20,000")
#                 cleaned_income = user_data[field].replace("20,00", "20,000")
#                 lower, upper = cleaned_income.split("–")
#                 lower = int(lower.replace(",", ""))
#                 upper = int(upper.replace(",", ""))
#                 if lower < 0 or upper < lower:
#                     raise ValueError(f"Invalid range for {field}: {user_data[field]}")
#             except (ValueError, AttributeError):
#                 raise ValueError(f"Invalid format for {field}: {user_data[field]}")
#         else:
#             # Handle special cases for rent and subscriptions
#             if field == "rent" and user_data.get("livingSituation") == "Own home (no rent)" and user_data[field] == "":
#                 user_data[field] = "0"  # Set rent to 0 for own home
#             elif field == "subscriptions" and user_data[field].lower() in ["no", "none"]:
#                 user_data[field] = "0"  # Convert "no" to 0 for subscriptions
#             elif user_data[field] == "" and field in optional_fields:
#                 user_data[field] = "0"  # Set empty optional fields to 0

#             # Validate numeric fields
#             try:
#                 int(user_data[field].replace(",", ""))
#             except (ValueError, AttributeError):
#                 raise ValueError(f"Invalid format for {field}: {user_data[field]}")

#     # Warn about unrealistic values
#     mobile_cost = int(user_data["mobileInternetCost"].replace(",", ""))
#     transport_cost = int(user_data["transportCost"].replace(",", ""))
#     utilities_cost = int(user_data["utilitiesCost"].replace(",", ""))
#     income_max = int(user_data["monthlyIncome"].replace("20,00", "20,000").split("–")[1].replace(",", ""))
    
#     if mobile_cost > 5000:
#         print(f"Warning: mobileInternetCost ({user_data['mobileInternetCost']}) seems unrealistically high.")
#     if transport_cost > income_max * 0.3:
#         print(f"Warning: transportCost ({user_data['transportCost']}) seems high for income {user_data['monthlyIncome']}.")
#     if utilities_cost > income_max * 0.2:
#         print(f"Warning: utilitiesCost ({user_data['utilitiesCost']}) seems high for income {user_data['monthlyIncome']}.")

# def generate_budget_from_user_data(user_data, model_path='finance_model.pkl', encoder_path='encoders.pkl'):
#     """
#     Generates a budget from user data using a model and encoders.
#     Handles numeric fields and unseen labels gracefully.
#     """
#     # Validate user data
#     validate_user_data(user_data['financialProfile'])
#     flat = flatten_user_data(user_data)

#     # Load model and encoders
#     try:
#         clf = joblib.load(model_path)
#         encoders = joblib.load(encoder_path)
#     except FileNotFoundError as e:
#         raise FileNotFoundError(f"Could not find file: {e.filename}. Ensure model and encoder files are in the correct directory.")

#     # Define numeric columns that should not be encoded
#     numeric_columns = [
#         'rent', 'transportCost', 'groceryCost', 'utilitiesCost',
#         'mobileInternetCost', 'subscriptions', 'loanPayment', 'investments', 'dependents'
#     ]

#     # Define columns to exclude from prediction
#     exclude_columns = [
#         'firstName', 'lastName', 'mobile', 'dateOfBirth', 'email',
#         'verificationCode', 'password', 'confirmPassword'
#     ]

#     # Prepare DataFrame
#     df = pd.DataFrame([flat])

#     # Drop excluded columns
#     df = df.drop(columns=[col for col in exclude_columns if col in df.columns], errors='ignore')

#     # Encode categorical columns and handle numeric columns
#     for col in df.columns:
#         if col in encoders and col not in numeric_columns:
#             try:
#                 df[col] = encoders[col].transform(df[col].astype(str))
#             except ValueError as e:
#                 print(f"Warning: Unseen label in {col}: {df[col].iloc[0]}. Using default encoding (0).")
#                 df[col] = 0  # Default value for unseen labels
#         elif col in numeric_columns or col in ['age']:
#             # Convert numeric columns to float/int, removing commas
#             try:
#                 df[col] = pd.to_numeric(df[col].str.replace(",", ""), errors='coerce')
#             except AttributeError:
#                 df[col] = pd.to_numeric(df[col], errors='coerce')

#     # Handle any NaN values
#     df.fillna(0, inplace=True)

#     # Predict financial goal
#     try:
#         predicted_goal = clf.predict(df.drop(columns=['financialGoal'], errors='ignore'))[0]
#         # Map encoded prediction back to label if encoder exists
#         if 'financialGoal' in encoders:
#             predicted_goal = encoders['financialGoal'].inverse_transform([predicted_goal])[0]
#     except Exception as e:
#         print(f"Warning: Prediction failed ({str(e)}). Using default financial goal.")
#         predicted_goal = flat.get("financialGoal", "Monthly expense control")

#     # Extract income (use upper bound of range)
#     try:
#         income_amount = int(flat["monthlyIncome"].replace("20,00", "20,000").split("–")[1].replace(",", ""))
#     except (IndexError, ValueError):
#         raise ValueError("Invalid monthlyIncome format. Expected 'X,Y–Z,W'.")

#     # Build budget
#     budget = {
#         "budgetName": f"{datetime.now().strftime('%B')} Budget",
#         "currency": "BDT",
#         "income": [
#             {
#                 "source": "Salary",
#                 "amount": income_amount
#             }
#         ],
#         "expenses": [
#             {
#                 "category": "Housing",
#                 "items": [
#                     {"item": "Rent", "name": "Housing", "amount": int(flat["rent"].replace(",", ""))},
#                     {"item": "Utilities", "name": "Electricity", "amount": int(flat["utilitiesCost"].replace(",", "")) // 2},
#                     {"item": "Utilities", "name": "Gas & Water", "amount": int(flat["utilitiesCost"].replace(",", "")) // 2},
#                 ]
#             },
#             {
#                 "category": "Transportation",
#                 "items": [
#                     {"item": flat["transportMode"], "name": "Transport", "amount": int(flat["transportCost"].replace(",", ""))}
#                 ]
#             },
#             {
#                 "category": "Food & Groceries",
#                 "items": [
#                     {"item": "Groceries", "name": "Daily Needs", "amount": int(flat["groceryCost"].replace(",", ""))},
#                     {"item": "Eating Out", "name": "Dining", "amount": 1000 if 'Rarely' in flat["eatingOutFrequency"] else 3000}
#                 ]
#             },
#             {
#                 "category": "Communication",
#                 "items": [
#                     {"item": "Mobile & Internet", "name": "Connectivity", "amount": int(flat["mobileInternetCost"].replace(",", ""))}
#                 ]
#             },
#             {
#                 "category": "Entertainment",
#                 "items": [
#                     {"item": "Subscriptions", "name": "Streaming", "amount": int(flat["subscriptions"].replace(",", ""))}
#                 ]
#             },
#             {
#                 "category": "Shopping" if "Shopping" in flat.get("spendingHabits", "") else "Other",
#                 "items": [
#                     {"item": "Shopping", "name": "Miscellaneous", "amount": 2000}
#                 ]
#             },
#             {
#                 "category": "Debt",
#                 "items": [
#                     {"item": "Loan Repayment", "name": "Debt", "amount": int(flat["loanPayment"].replace(",", ""))}
#                 ]
#             }
#         ],
#         "financialGoal": predicted_goal
#     }

#     # Check budget balance
#     total_expenses = sum(
#         item["amount"] for category in budget["expenses"] for item in category["items"]
#     )
#     total_income = sum(income["amount"] for income in budget["income"])
#     if total_expenses > total_income:
#         budget["warnings"] = [f"Expenses ({total_expenses} BDT) exceed income ({total_income} BDT)!"]

#     return budget

import joblib
import pandas as pd
from datetime import datetime
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

def flatten_user_data(user_data):
    """
    Flattens nested user data into a single-level dictionary.
    Excludes 'verification', 'passwordSetup', and 'financialProfile' fields.
    Joins 'spendingHabits' list into a string if present.
    """
    flat_data = {}
    for key, value in user_data.items():
        if key not in ['personalInfo', 'address', 'verification', 'passwordSetup', 'financialProfile']:
            flat_data[key] = value
    flat_data.update(user_data.get('personalInfo', {}))
    flat_data.update(user_data.get('address', {}))
    flat_data.update(user_data.get('financialProfile', {}))
    if isinstance(flat_data.get("spendingHabits"), list):
        flat_data["spendingHabits"] = ", ".join(flat_data["spendingHabits"])
    return flat_data

def validate_user_data(user_data):
    """
    Validates required fields and ensures numeric fields are in correct format.
    Handles monthlyIncome as a range separately.
    Allows rent to be empty/0 for 'Own home (no rent)'.
    Handles non-numeric subscriptions and optional investments.
    Raises ValueError for invalid or unrealistic values.
    """
    required_fields = [
        "monthlyIncome", "rent", "transportCost", "groceryCost",
        "utilitiesCost", "mobileInternetCost", "subscriptions", "loanPayment"
    ]
    optional_fields = ["investments"]

    # Clean and validate data
    user_data = user_data.copy()  # Avoid modifying original data
    user_data["monthlyIncome"] = user_data["monthlyIncome"].replace("20,00", "20,000")  # Fix typo
    if user_data.get("division") == "Chattagram":
        user_data["division"] = "Chittagong"  # Fix typo

    for field in required_fields + optional_fields:
        if field not in user_data:
            if field in optional_fields:
                user_data[field] = "0"
            else:
                raise ValueError(f"Missing required field: {field}")

        if field == "monthlyIncome":
            # Validate monthlyIncome as a range (e.g., "20,000–40,000")
            try:
                lower, upper = user_data[field].split("–")
                lower = int(lower.replace(",", ""))
                upper = int(upper.replace(",", ""))
                if lower < 0 or upper < lower:
                    raise ValueError(f"Invalid range for {field}: {user_data[field]}")
            except (ValueError, AttributeError):
                raise ValueError(f"Invalid format for {field}: {user_data[field]}")
        else:
            # Handle special cases
            if field == "rent" and user_data.get("livingSituation") == "Own home (no rent)" and user_data[field] == "":
                user_data[field] = "0"
            elif field == "subscriptions" and user_data[field].lower() in ["no", "none"]:
                user_data[field] = "0"
            elif user_data[field] == "" and field in optional_fields:
                user_data[field] = "0"

            # Validate numeric fields
            try:
                int(user_data[field].replace(",", ""))
            except (ValueError, AttributeError):
                raise ValueError(f"Invalid format for {field}: {user_data[field]}")

    # Warn about unrealistic values
    mobile_cost = int(user_data["mobileInternetCost"].replace(",", ""))
    transport_cost = int(user_data["transportCost"].replace(",", ""))
    utilities_cost = int(user_data["utilitiesCost"].replace(",", ""))
    income_max = int(user_data["monthlyIncome"].split("–")[1].replace(",", ""))
    
    if mobile_cost > 5000:
        print(f"Warning: mobileInternetCost ({user_data['mobileInternetCost']}) seems unrealistically high.")
    if transport_cost > income_max * 0.3:
        print(f"Warning: transportCost ({user_data['transportCost']}) seems high for income {user_data['monthlyIncome']}.")
    if utilities_cost > income_max * 0.2:
        print(f"Warning: utilitiesCost ({user_data['utilitiesCost']}) seems high for income {user_data['monthlyIncome']}.")

    return user_data

def generate_budget_from_user_data(user_data, model_path='finance_model.pkl', encoder_path='encoders.pkl'):
    """
    Generates a budget from user data using a model and encoders.
    Handles numeric fields and unseen labels gracefully.
    """
    # Validate and clean user data
    validated_data = validate_user_data(user_data['financialProfile'])
    user_data = user_data.copy()
    user_data['financialProfile'] = validated_data
    flat = flatten_user_data(user_data)

    # Load model and encoders
    try:
        clf = joblib.load(model_path)
        encoders = joblib.load(encoder_path)
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Could not find file: {e.filename}. Ensure model and encoder files are in the correct directory.")

    # Define numeric columns that should not be encoded
    numeric_columns = [
        'rent', 'transportCost', 'groceryCost', 'utilitiesCost',
        'mobileInternetCost', 'subscriptions', 'loanPayment', 'investments', 'dependents'
    ]

    # Define columns to exclude from prediction
    exclude_columns = [
        'firstName', 'lastName', 'mobile', 'dateOfBirth', 'email',
        'verificationCode', 'password', 'confirmPassword'
    ]

    # Prepare DataFrame
    df = pd.DataFrame([flat])

    # Drop excluded columns
    df = df.drop(columns=[col for col in exclude_columns if col in df.columns], errors='ignore')

    # Log DataFrame for debugging
    logging.info(f"DataFrame before encoding:\n{df}")

    # Encode categorical columns
    for col in df.columns:
        if col in encoders and col not in numeric_columns:
            try:
                df[col] = encoders[col].transform(df[col].astype(str))
            except ValueError as e:
                print(f"Warning: Unseen label in {col}: {df[col].iloc[0]}. Using default encoding (0).")
                df[col] = 0
        elif col in numeric_columns or col in ['age']:
            try:
                df[col] = pd.to_numeric(df[col].str.replace(",", ""), errors='coerce')
            except AttributeError:
                df[col] = pd.to_numeric(df[col], errors='coerce')

    # Handle NaN values
    df.fillna(0, inplace=True)

    # Log DataFrame after encoding
    logging.info(f"DataFrame after encoding:\n{df}")

    # Predict financial goal
    try:
        predicted_goal = clf.predict(df.drop(columns=['financialGoal'], errors='ignore'))[0]
        if 'financialGoal' in encoders:
            predicted_goal = encoders['financialGoal'].inverse_transform([predicted_goal])[0]
    except Exception as e:
        print(f"Warning: Prediction failed ({str(e)}). Using default financial goal.")
        predicted_goal = flat.get("financialGoal", "Monthly expense control")

    # Extract income
    try:
        income_amount = int(flat["monthlyIncome"].replace("20,00", "20,000").split("–")[1].replace(",", ""))
    except (IndexError, ValueError):
        raise ValueError("Invalid monthlyIncome format. Expected 'X,Y–Z,W'.")

    # Build budget
    budget = {
        "budgetName": f"{datetime.now().strftime('%B')} Budget",
        "currency": "BDT",
        "income": [
            {
                "source": "Salary",
                "amount": income_amount
            }
        ],
        "expenses": [
            {
                "category": "Housing",
                "items": [
                    {"item": "Rent", "name": "Housing", "amount": int(flat["rent"].replace(",", ""))},
                    {"item": "Utilities", "name": "Electricity", "amount": int(flat["utilitiesCost"].replace(",", "")) // 2},
                    {"item": "Utilities", "name": "Gas & Water", "amount": int(flat["utilitiesCost"].replace(",", "")) // 2},
                ]
            },
            {
                "category": "Transportation",
                "items": [
                    {"item": flat["transportMode"], "name": "Transport", "amount": int(flat["transportCost"].replace(",", ""))}
                ]
            },
            {
                "category": "Food & Groceries",
                "items": [
                    {"item": "Groceries", "name": "Daily Needs", "amount": int(flat["groceryCost"].replace(",", ""))},
                    {"item": "Eating Out", "name": "Dining", "amount": 1000 if 'Rarely' in flat["eatingOutFrequency"] else 3000}
                ]
            },
            {
                "category": "Communication",
                "items": [
                    {"item": "Mobile & Internet", "name": "Connectivity", "amount": int(flat["mobileInternetCost"].replace(",", ""))}
                ]
            },
            {
                "category": "Entertainment",
                "items": [
                    {"item": "Subscriptions", "name": "Streaming", "amount": int(flat["subscriptions"].replace(",", ""))}
                ]
            },
            {
                "category": "Shopping" if "Shopping" in flat.get("spendingHabits", "") else "Other",
                "items": [
                    {"item": "Shopping", "name": "Miscellaneous", "amount": 2000}
                ]
            },
            {
                "category": "Debt",
                "items": [
                    {"item": "Loan Repayment", "name": "Debt", "amount": int(flat["loanPayment"].replace(",", ""))}
                ]
            }
        ],
        "financialGoal": predicted_goal
    }

    # Check budget balance
    total_expenses = sum(
        item["amount"] for category in budget["expenses"] for item in category["items"]
    )
    total_income = sum(income["amount"] for income in budget["income"])
    if total_expenses > total_income:
        budget["warnings"] = [f"Expenses ({total_expenses} BDT) exceed income ({total_income} BDT)!"]

    return budget

