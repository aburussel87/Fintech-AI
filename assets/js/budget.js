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
    try {
        const res = await fetch('http://localhost:5000/save_budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budgetData)
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error('Failed to save budget.');
        }

        alert('Budget saved successfully!');
    } catch (error) {
        alert('Error: Could not save budget.');
        console.error('Save Budget Error:', error);
    }
}

// Generate AI budget button
document.getElementById('generate-budget').addEventListener('click', generateBudget);

async function generateBudget() {
    const budgetData = collectFormData();
    try {
        const res = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "You will return clean JSON, in the same format that I provided. Suggest me the budget and don't put any extra explanation, not a single extra word other than the JSON file." + JSON.stringify(budgetData)
            })
        });
        const data = await res.json();
        console.log('Response:', data.response);
        alert('Response:', data.response);
        if (!res.ok || !data.success) {
            throw new Error('Failed to generate AI budget.');
        }

        // console.log('Generated Budget:', data.generated_budget);
        // displayGeneratedBudget(data.generated_budget); // Uncomment if needed
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
    const savedBudget = document.getElementById('saved-budget');
    savedBudget.innerHTML = `
        <h5 class="text-success">AI Suggested Budget</h5>
        <pre class="bg-white p-3 rounded shadow-sm">${JSON.stringify(generatedBudget, null, 2)}</pre>
    `;
}