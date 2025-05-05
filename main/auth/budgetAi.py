import json
import sentence_transformers

file_path="main\\auth\\budgets.json"
# Load budget data from JSON
def load_budgets(file_path):
    with open(file_path, "r") as f:
        return json.load(f)

# Get budget for specific user_id
def get_user_budget(user_id, budgets_data):
    user_budgets = [b for b in budgets_data if b["user_id"] == user_id]
    return user_budgets[-1] if user_budgets else None

# Match transaction note to best budget category using NLP
def match_transaction_to_category(transaction_note, categories, model):
    note_embedding = model.encode(transaction_note)
    category_embeddings = model.encode(categories)
    similarity = sentence_transformers.util.cos_sim(note_embedding, category_embeddings)[0]
    best_idx = similarity.argmax().item()
    return categories[best_idx]

# Calculate current spending for the matched category
def calculate_spending(category, budget):
    return sum(
        item["amount"]
        for e in budget["expenses"]
        if e["category"] == category
        for item in e["items"]
    )

# Check if overspending occurred (margin default is 10%)
def check_overspending(current_spent, new_amount, margin=0.1):
    return (current_spent + new_amount) > (current_spent * (1 + margin))

# Main function to verify a transaction
def verify_transaction(transaction, budgets_path=file_path):
    budgets_data = load_budgets(budgets_path)
    user_id = transaction["sender_id"]
    budget = get_user_budget(user_id, budgets_data)
    
    if not budget:
        return json.dumps({"flag": "green", "message": "No budget found for user"})
    
    categories = [e["category"] for e in budget["expenses"]]
    model = sentence_transformers.SentenceTransformer('all-MiniLM-L6-v2')
    best_category = match_transaction_to_category(transaction["note"], categories, model)
    
    current_spent = calculate_spending(best_category, budget)
    transaction_amount = int(transaction["amount"])
    
    overspent = check_overspending(current_spent, transaction_amount)
    flag = "red" if overspent else "green"
    message = f"Please review this expense. You are about to overspend"
    
    return json.dumps({"flag": flag, "message": message})


# ------------------------
# Example usage
# ------------------------
# if __name__ == "__main__":
#     example_transaction = {
#         "invoice_id": "Y0861ZKGW40",
#         "amount": "100",
#         "payment_method": "bank",
#         "time": "2025-05-03 22:00:32",
#         "sender_id": "25MHRI2HUPSM",
#         "sender_info": {
#             "name": "Abu Russel",
#             "phone": "01303501932",
#             "email": "aburussel87@gmail.com",
#             "location": "Bangladesh University of Engineering & Technology, Azimpur Road, Polashi, Azimpur, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1211, Bangladesh"
#         },
#         "receiver_id": "253JWHKCKFKJ",
#         "receiver_info": {
#             "name": "Abu Russel",
#             "phone": "01303501932",
#             "email": "xyz@"
#         },
#         "note": "burger"
#     }

#     result = verify_transaction(example_transaction)
#     print(result)
