document.getElementById('add-income').addEventListener('click', () => {
    const incomeList = document.getElementById('income-list');
    const div = document.createElement('div');
    div.classList.add('row', 'g-2', 'income-item', 'mb-2');
    div.innerHTML = `
        <div class="col-md-6">
            <input type="text" class="form-control" placeholder="Income Source" required>
        </div>
        <div class="col-md-4">
            <input type="number" class="form-control" placeholder="Amount" required>
        </div>
        <div class="col-md-2 d-grid">
            <button type="button" class="btn btn-danger remove-item">Remove</button>
        </div>
    `;
    incomeList.appendChild(div);

    div.querySelector('.remove-item').addEventListener('click', () => div.remove());
});

// Add expense category
document.getElementById('add-expense-category').addEventListener('click', () => {
    const expenseList = document.getElementById('expense-list');
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('expense-category', 'border', 'p-3', 'mb-3');
    categoryDiv.innerHTML = `
        <div class="mb-2">
            <input type="text" class="form-control" placeholder="Expense Category Name" required>
        </div>
        <div class="expense-items"></div>
        <button type="button" class="btn btn-sm btn-outline-success add-expense-item">+ Add Item</button>
        <button type="button" class="btn btn-sm btn-outline-danger remove-category">Remove Category</button>
    `;
    expenseList.appendChild(categoryDiv);

    categoryDiv.querySelector('.add-expense-item').addEventListener('click', () => {
        const itemsDiv = categoryDiv.querySelector('.expense-items');
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
        itemDiv.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Item Name" required>
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control" placeholder="Amount" required>
            </div>
            <div class="col-md-2 d-grid">
                <button type="button" class="btn btn-danger remove-item">Remove</button>
            </div>
        `;
        itemsDiv.appendChild(itemDiv);

        itemDiv.querySelector('.remove-item').addEventListener('click', () => itemDiv.remove());
    });

    categoryDiv.querySelector('.remove-category').addEventListener('click', () => categoryDiv.remove());
});

// Save budget button
document.getElementById('save-budget').addEventListener('click', saveBudget);

async function saveBudget() {
    const budgetData = collectFormData();
    if (!budgetData.expenses || budgetData.expenses.length === 0) {
        alert('Please add at least one expense category before saving the budget.');
        return;
    }
    console.log("Budget Data:", budgetData); // Check the collected data

    try {
        const res = await fetch('http://localhost:5000/save_budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token') // Adding the token
            },
            body: JSON.stringify(budgetData)  // Send budget data as JSON
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to save budget');
        }

        alert('Budget saved successfully!');
        console.log('Saved Budget:', data.budget);  // Log the saved budget details (optional)
    } catch (error) {
        alert('Error: Could not save budget.');
        console.error('Save Budget Error:', error);
    }
}

// Generate AI budget button
document.getElementById('generate-budget').addEventListener('click', generateBudget);

async function generateBudget() {
    console.log("Generating budget...");
    const budgetData = collectFormData();
    if (!budgetData) {
        alert('Please fill in all required fields before generating the budget.');
        return;
    }
    console.log("Budget Data:", budgetData);
    // budgetData = JSON.stringify(budgetData, null, 2); // Convert to JSON string
    try {
        // const token = localStorage.getItem('token');


        const res = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                "Authorization": "Bearer " + localStorage.getItem("access_token")  // ✅ Add this line
            },
            body: JSON.stringify({
                message: "Return a clean JSON in the exact format I provided, with no extra explanation or text. Suggest a monthly budget based on the following income data: " + JSON.stringify(budgetData, null, 2) + ". Each category must include 'item', 'name', and 'amount'. Item names must be relevant and realistic. You must recalculate and adjust the budget to match the total income, even if the user provides preset values. Do not exceed the salary under any circumstances."
              })
              
              
              
        });

        const data = await res.json();
        console.log('Response:', data.response);
        // alert('Response:', data.response);
        if (!res.ok || !data.response) {
            throw new Error('Failed to generate AI budget.');
        }
        // alert('AI budget generated successfully!');
        // console.log('Generated Budget:', data.generated_budget);
        // displayGeneratedBudget(data.generated_budget); // Uncomment if needed
        const generatedBudget = await JSON.parse(data.response);
        console.log('Generated Budget:', generatedBudget);
        displayGeneratedBudget(generatedBudget);
    } catch (error) {
        alert('Error: Could not generate AI budget.');
        console.error('Generate Budget Error:', error);
    }
}

// Collect form data
function collectFormData() {
    const budgetName = document.getElementById('budget-name').value;
    const currency = document.getElementById('currency').value;

    const income = Array.from(document.querySelectorAll('.income-item')).map(item => ({
        source: item.querySelector('input[type="text"]').value,
        amount: parseFloat(item.querySelector('input[type="number"]').value)
    }));
    if(!budgetName) {
        alert('Please enter a budget name.');
        return false;
    }
    if(!currency) {
        alert('Please select a currency.');
        return false;
    }
    // Validate income data
    if (income.some(item => isNaN(item.amount))) {
        alert('Please enter valid amounts for all income sources.');
        return false;
    }
    if (income.length === 0) {
        alert('Please add at least one income source.');
        return false;
    }
    if (income.some(item => item.amount <= 0)) {
        alert('Income amounts must be greater than zero.');
        return false;
    }

    const expenses = Array.from(document.querySelectorAll('.expense-category')).map(category => ({
        category: category.querySelector('input[type="text"]').value,
        items: Array.from(category.querySelectorAll('.expense-item')).map(item => ({
            name: item.querySelector('input[type="text"]').value,
            amount: parseFloat(item.querySelector('input[type="number"]').value)
        }))
    }));

    return { budgetName, currency, income, expenses };
}

// Display generated budget
function displayGeneratedBudget(generatedBudget) {
    
    expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = ''; // Clear existing expenses
    generatedBudget.expenses.forEach(category => {
        if (!category.items) {
            category.items = [{
                name: category.name || category.item || "Unnamed",
                amount: category.amount || 0
            }];
            category.category = category.item || "Uncategorized";
        }
        

        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('expense-category', 'border', 'p-3', 'mb-3');
        categoryDiv.innerHTML = `
            <div class="mb-2">
                <input type="text" class="form-control" placeholder="Expense Category Name" value="${category.category}" required>
            </div>
            <div class="expense-items"></div>
            <button type="button" class="btn btn-sm btn-outline-success add-expense-item">+ Add Item</button>
            <button type="button" class="btn btn-sm btn-outline-danger remove-category">Remove Category</button>
        `;
        expenseList.appendChild(categoryDiv);

        const itemsDiv = categoryDiv.querySelector('.expense-items');
        category.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
            itemDiv.innerHTML = `
                <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Item Name" value="${item.name}" required>
                </div>
                <div class="col-md-4">
                    <input type="number" class="form-control" placeholder="Amount" value="${item.amount}" required>
                </div>
                <div class="col-md-2 d-grid">
                    <button type="button" class="btn btn-danger remove-item">Remove</button>
                </div>
            `;
            itemsDiv.appendChild(itemDiv);
        });

        categoryDiv.querySelector('.remove-category').addEventListener('click', () => categoryDiv.remove());
    });
}