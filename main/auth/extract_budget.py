import re
import json

# def extract_budget_json(text):
#     # Initialize the result dictionary with default values
#     budget = {
#         "budgetId": "",
#         "user_id": "",
#         "budgetName": "",
#         "currency": "",
#         "income": [],
#         "expenses": []
#     }
    
#     # Extracting budgetId (e.g., BUD001)
#     budget_id_match = re.search(r"budgetId\s*:\s*\"([A-Za-z0-9]+)\"", text)
#     if budget_id_match:
#         budget["budgetId"] = budget_id_match.group(1)

#     # Extracting user_id (e.g., alice)
#     user_id_match = re.search(r"user_id\s*:\s*\"([A-Za-z0-9]+)\"", text)
#     if user_id_match:
#         budget["user_id"] = user_id_match.group(1)

#     # Extracting budgetName (e.g., April Budget)
#     budget_name_match = re.search(r"budgetName\s*:\s*\"([A-Za-z0-9\s]+)\"", text)
#     if budget_name_match:
#         budget["budgetName"] = budget_name_match.group(1)

#     # Extracting currency (e.g., BDT)
#     currency_match = re.search(r"currency\s*:\s*\"([A-Za-z]+)\"", text)
#     if currency_match:
#         budget["currency"] = currency_match.group(1)
    
#     # Extracting income data (e.g., Salary: 20000)
#     income_matches = re.findall(r"\"source\"\s*:\s*\"([A-Za-z\s]+)\"[\s\S]+\"amount\"\s*:\s*([0-9]+)", text)
#     for source, amount in income_matches:
#         budget["income"].append({"source": source.strip(), "amount": int(amount)})

#     # Extracting expenses categories and items
#     expense_categories = re.findall(r"\"category\"\s*:\s*\"([A-Za-z\s&]+)\"[\s\S]+?\"items\"\s*:\s*\[([\s\S]+?)\]", text)
#     for category, items_str in expense_categories:
#         category_data = {"category": category.strip(), "items": []}
        
#         # Extract items in the category
#         items_matches = re.findall(r"\"item\"\s*:\s*\"([A-Za-z\s]+)\"[\s\S]+\"name\"\s*:\s*\"([A-Za-z\s&]+)\"[\s\S]+\"amount\"\s*:\s*([0-9]+)", items_str)
#         for item, name, amount in items_matches:
#             category_data["items"].append({
#                 "item": item.strip(),
#                 "name": name.strip(),
#                 "amount": int(amount)
#             })
        
#         budget["expenses"].append(category_data)

#     return json.dumps(budget, indent=4)

# Example usage
# text = """ hi adasdasd asdasdjash dasd asdjahsdka,sjgd asdka hsdakjsd asd asd asd asd asd asd asd asd asd asd asd asd asd asd
# {
#   "budgetId": "BUD001",
#   "user_id": "alice",
#   "budgetName": "April Budget",
#   "currency": "BDT",
#   "income": [
#     {
#       "source": "Salary",
#       "amount": 20000
#     }
#   ],
#   "expenses": [
#     {
#       "category": "Housing",
#       "items": [
#         {
#           "item": "Rent",
#           "name": "Housing",
#           "amount": 5000
#         },
#         {
#           "item": "Utilities",
#           "name": "Electricity & Internet",
#           "amount": 1500
#         }
#       ]
#     },
#     {
#       "category": "Food & Essentials",
#       "items": [
#         {
#           "item": "Groceries",
#           "name": "Food",
#           "amount": 3000
#         }
#       ]
#     }
#   ]
# }

# sdasdasdasdasdasdasdasdasdasdasda
# """

# # Extract budget JSON
# budget_json = extract_budget_json(text)
# print(budget_json)


# def extract_budget_json(text):
#     try:
#         start = text.find('{')
#         end = text.rfind('}') + 1
#         if start == -1 or end == -1:
#             raise ValueError("No JSON object found in text.")

#         json_str = text[start:end]
#         return json.loads(json_str)

#     except Exception as e:
#         return {"error": str(e)}


# import json

# def extract_budget_json(text):
#     try:
#         # Find the substring starting from first { to last }
#         start = text.find('{')
#         end = text.rfind('}') + 1
#         if start == -1 or end == -1:
#             raise ValueError("No JSON object found in text.")

#         json_str = text[start:end]
#         parsed = json.loads(json_str)

#         # Prepare the cleaned budget structure
#         budget = {
#             "budgetId": parsed.get("budgetId", ""),
#             "user_id": parsed.get("user_id", ""),
#             "budgetName": parsed.get("budgetName", ""),
#             "currency": parsed.get("currency", ""),
#             "income": parsed.get("income", []),
#             "expenses": []
#         }

#         expenses = parsed.get("expenses", [])
#         if all("category" in e and "items" in e for e in expenses):
#             # Already nested: format item names
#             for group in expenses:
#                 category = group["category"]
#                 items = group["items"]
#                 formatted_items = []
#                 for i, item in enumerate(items, 1):
#                     formatted_items.append({
#                         "item": f"item-{i}",
#                         "name": item.get("name", ""),
#                         "amount": item.get("amount", 0)
#                     })
#                 budget["expenses"].append({
#                     "category": category,
#                     "items": formatted_items
#                 })

#         return json.dumps(budget, indent=4)

#     except Exception as e:
#         return json.dumps({"error": str(e)})


def extract_budget_json(text):
    start = text.find('{')
    end = text.rfind('}') + 1
    if start == -1 or end == -1 or start >= end:
        return ""
    return json.dumps(text[start:end],indent=4)