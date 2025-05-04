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


        const res = await fetch('http://localhost:5000/generate_budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                "Authorization": "Bearer " + localStorage.getItem("access_token")  // ✅ Add this line
            },
            body: JSON.stringify({
                message: JSON.stringify(budgetData, null, 2) 
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
        // const generatedBudget = await JSON.parse(data.response);
        const generatedBudget = parseBudgetJson(data.response);
        if (!generatedBudget) {
            alert('Failed to parse generated budget.');
            return;
        }
        console.log('Generated Budget:', generatedBudget);
        if(generatedBudget){
            displayGeneratedBudget(generatedBudget); // Display the generated budget
        }
        // generateBudget = json.parse(generateBudget);
        // displayGeneratedBudget(generatedBudget);
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
// function displayGeneratedBudget(generatedBudget) {
//     const expenseList = document.getElementById('expense-list');
//     expenseList.innerHTML = ''; // Clear existing expenses
//     generatedBudget.expenses.forEach(category => {
//         // Normalize item to items
//         if (category.item && !category.items) {
//             category.items = Array.isArray(category.item) ? category.item : [category.item];
//         }
//         if (!category.items) {
//             category.items = [{
//                 name: category.name || category.item || "Unnamed",
//                 amount: category.amount || 0
//             }];
//             category.category = category.item || "Uncategorized";
//         }

//         const categoryDiv = document.createElement('div');
//         categoryDiv.classList.add('expense-category', 'border', 'p-3', 'mb-3');
//         categoryDiv.innerHTML = `
//             <div class="mb-2">
//                 <input type="text" class="form-control" placeholder="Expense Category Name" value="${category.category}" required>
//             </div>
//             <div class="expense-items"></div>
//             <button type="button" class="btn btn-sm btn-outline-success add-expense-item">+ Add Item</button>
//             <button type="button" class="btn btn-sm btn-outline-danger remove-category">Remove Category</button>
//         `;
//         expenseList.appendChild(categoryDiv);

//         const itemsDiv = categoryDiv.querySelector('.expense-items');
        
//         category.items.forEach(item => {
//             const itemDiv = document.createElement('div');
//             itemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
//             itemDiv.innerHTML = `
//                 <div class="col-md-6">
//                     <input type="text" class="form-control" placeholder="Item Name" value="${item.name}" required>
//                 </div>
//                 <div class="col-md-4">
//                     <input type="number" class="form-control" placeholder="Amount" value="${item.amount}" required>
//                 </div>
//                 <div class="col-md-2 d-grid">
//                     <button type="button" class="btn btn-danger remove-item">Remove</button>
//                 </div>
//             `;
//             itemsDiv.appendChild(itemDiv);
//             itemDiv.querySelector('.remove-item').addEventListener('click', () => itemDiv.remove());
//         });

//         categoryDiv.querySelector('.remove-category').addEventListener('click', () => categoryDiv.remove());
//         categoryDiv.querySelector('.add-expense-item').addEventListener('click', () => {
//             const newItemDiv = document.createElement('div');
//             newItemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
//             newItemDiv.innerHTML = `
//                 <div class="col-md-6">
//                     <input type="text" class="form-control" placeholder="Item Name" required>
//                 </div>
//                 <div class="col-md-4">
//                     <input type="number" class="form-control" placeholder="Amount" required>
//                 </div>
//                 <div class="col-md-2 d-grid">
//                     <button type="button" class="btn btn-danger remove-item">Remove</button>
//                 </div>
//             `;
//             itemsDiv.appendChild(newItemDiv);
//             newItemDiv.querySelector('.remove-item').addEventListener('click', () => newItemDiv.remove());
//         });
//     });
// }

// function displayGeneratedBudget(generatedBudget) {
    
//     expenseList = document.getElementById('expense-list');
//     expenseList.innerHTML = ''; // Clear existing expenses
//     generatedBudget.expenses.forEach(category => {
//         if (!category.items) {
//             category.items = [{
//                 name: category.name || category.item || "Unnamed",
//                 amount: category.amount || 0
//             }];
//             category.category = category.item || "Uncategorized";
//         }
        

//         const categoryDiv = document.createElement('div');
//         categoryDiv.classList.add('expense-category', 'border', 'p-3', 'mb-3');
//         categoryDiv.innerHTML = `
//             <div class="mb-2">
//                 <input type="text" class="form-control" placeholder="Expense Category Name" value="${category.category}" required>
//             </div>
//             <div class="expense-items"></div>
//             <button type="button" class="btn btn-sm btn-outline-success add-expense-item">+ Add Item</button>
//             <button type="button" class="btn btn-sm btn-outline-danger remove-category">Remove Category</button>
//         `;
//         expenseList.appendChild(categoryDiv);

//         const itemsDiv = categoryDiv.querySelector('.expense-items');
        
//         category.items.forEach(item => {
//             const itemDiv = document.createElement('div');
//             itemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
//             itemDiv.innerHTML = `
//                 <div class="col-md-6">
//                     <input type="text" class="form-control" placeholder="Item Name" value="${item.name}" required>
//                 </div>
//                 <div class="col-md-4">
//                     <input type="number" class="form-control" placeholder="Amount" value="${item.amount}" required>
//                 </div>
//                 <div class="col-md-2 d-grid">
//                     <button type="button" class="btn btn-danger remove-item">Remove</button>
//                 </div>
//             `;
//             itemsDiv.appendChild(itemDiv);
            
            
//             itemsDiv.querySelector('.remove-item').addEventListener('click', () => itemDiv.remove());
//         });

//         categoryDiv.querySelector('.remove-category').addEventListener('click', () => categoryDiv.remove());
//         categoryDiv.querySelector('.add-expense-item').addEventListener('click', () => {
//             const newItemDiv = document.createElement('div');
//             newItemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
//             newItemDiv.innerHTML = `
//                 <div class="col-md-6">
//                     <input type="text" class="form-control" placeholder="Item Name" required>
//                 </div>
//                 <div class="col-md-4">
//                     <input type="number" class="form-control" placeholder="Amount" required>
//                 </div>
//                 <div class="col-md-2 d-grid">
//                     <button type="button" class="btn btn-danger remove-item">Remove</button>
//                 </div>
//             `;
//             itemsDiv.appendChild(newItemDiv);
//             newItemDiv.querySelector('.remove-item').addEventListener('click', () => newItemDiv.remove());
//         });
//     });
// }



const budgetSelect = document.getElementById('previous-budgets');
let previousBudgetsData = [];

async function loadPreviousBudgets() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login'; // Adjust redirect URL as needed
        return;
    }

    try {
        const res = await fetch('http://localhost:5000/get_budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                throw new Error(data.error || 'Failed to load budgets');
            }
        }

        if (data.success && Array.isArray(data.budgets)) {
            previousBudgetsData = data.budgets;
            const budgetSelect = document.getElementById('previous-budgets');
            budgetSelect.innerHTML = '<option value="" disabled selected>Select a budget</option>';
            data.budgets.forEach(b => {
                const option = document.createElement('option');
                option.value = b.budgetId;
                option.textContent = `${b.budgetName} (${b.currency})`;
                budgetSelect.appendChild(option);
            });
        } else {
            alert('No budgets found or invalid response.');
        }
    } catch (err) {
        console.error('Error loading budgets:', err);
        alert('Could not fetch previous budgets: ' + err.message);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadPreviousBudgets);



// Populate the entire budget form
function populateBudgetForm(budget) {
    // Populate budget name and currency
    document.getElementById('budget-name').value = budget.budgetName || '';
    document.getElementById('currency').value = budget.currency || '';

    // Populate income sources
    const incomeList = document.getElementById('income-list');
    incomeList.innerHTML = ''; // Clear existing income
    budget.income.forEach(income => {
        const div = document.createElement('div');
        div.classList.add('row', 'g-2', 'income-item', 'mb-2');
        div.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Income Source" value="${income.source}" required>
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control" placeholder="Amount" value="${income.amount}" required>
            </div>
            <div class="col-md-2 d-grid">
                <button type="button" class="btn btn-danger remove-item">Remove</button>
            </div>
        `;
        incomeList.appendChild(div);
        div.querySelector('.remove-item').addEventListener('click', () => div.remove());
    });

    // Populate expenses using existing displayGeneratedBudget
    displayGeneratedBudget(budget);
}

// Display selected budget
document.getElementById('display-budget').addEventListener('click', () => {
    const selectedId = budgetSelect.value;
    if (!selectedId) {
        alert('Please select a budget to display.');
        return;
    }
    const budget = previousBudgetsData.find(b => b.budgetId === selectedId);
    if (!budget) {
        alert('Selected budget not found.');
        return;
    }
    populateBudgetForm(budget);
});





function parseBudgetJson(input) {
    let budget;
    if (typeof input === 'string') {
        try {
            budget = JSON.parse(input);
        } catch (error) {
            console.error('Failed to parse JSON:', error.message);
            return null;
        }
    } else if (typeof input === 'object' && input !== null) {
        budget = input;
    } else {
        console.error('Invalid input: must be a JSON string or object');
        return null;
    }

    if (!budget || typeof budget !== 'object' || Array.isArray(budget)) {
        console.error('Invalid budget object:', budget);
        return null;
    }

    const normalizedBudget = {
        budgetName: typeof budget.budgetName === 'string' ? budget.budgetName : 'Unnamed Budget',
        currency: typeof budget.currency === 'string' ? budget.currency : 'unknown',
        income: Array.isArray(budget.income) ? budget.income : [],
        expenses: []
    };

    normalizedBudget.income = normalizedBudget.income.map((income, index) => {
        if (!income || typeof income !== 'object') {
            console.warn(`Skipping invalid income at index ${index}:`, income);
            return null;
        }
        return {
            source: typeof income.source === 'string' ? income.source : `Source_${index + 1}`,
            amount: Number(income.amount) || 0
        };
    }).filter(item => item !== null);

    if (!Array.isArray(budget.expenses)) {
        console.error('budget.expenses is not an array:', budget.expenses);
        return normalizedBudget;
    }

    budget.expenses.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            console.warn(`Skipping invalid expense entry at index ${entryIndex}:`, entry);
            return;
        }

        const categories = [];
        const keys = Object.keys(entry);
        const categoryKeys = keys.filter((key, i) => key === 'category' && typeof entry[key] === 'string' && keys.indexOf(key) === i);
        const itemsKeys = keys.filter((key, i) => key === 'items' && Array.isArray(entry[key]) && keys.indexOf(key) === i);

        if (categoryKeys.length === 0 && itemsKeys.length === 0) {
            categories.push({
                category: entry.category || `Uncategorized_${entryIndex + 1}`,
                items: entry.items || [{
                    item: entry.item || 'Unnamed',
                    name: entry.name || entry.item || 'Unnamed',
                    amount: Number(entry.amount) || 0
                }]
            });
        } else {
            categoryKeys.forEach((catKey, i) => {
                const items = itemsKeys[i] ? entry[itemsKeys[i]] : [];
                categories.push({
                    category: entry[catKey],
                    items: Array.isArray(items) ? items : []
                });
            });
            itemsKeys.slice(categoryKeys.length).forEach((itemsKey, i) => {
                if (Array.isArray(entry[itemsKey])) {
                    categories.push({
                        category: `Uncategorized_${entryIndex + 1}_${i + 1}`,
                        items: entry[itemsKey]
                    });
                }
            });
        }

        categories.forEach((category, catIndex) => {
            if (!category.category || typeof category.category !== 'string') {
                category.category = `Uncategorized_${entryIndex + 1}_${catIndex + 1}`;
            }
            if (!Array.isArray(category.items)) {
                category.items = [{
                    item: 'Unnamed',
                    name: 'Unnamed',
                    amount: 0
                }];
            }
            category.items = category.items.map((item, itemIndex) => {
                if (!item || typeof item !== 'object') {
                    console.warn(`Skipping invalid item at index ${itemIndex} in category ${category.category}:`, item);
                    return null;
                }
                return {
                    item: typeof item.item === 'string' ? item.item : item.name || `Item_${itemIndex + 1}`,
                    name: typeof item.name === 'string' ? item.name : item.item || `Item_${itemIndex + 1}`,
                    amount: Number(item.amount) || 0
                };
            }).filter(item => item !== null);

            normalizedBudget.expenses.push(category);
        });
    });

    return normalizedBudget;
}

// Original displayGeneratedBudget function
function displayGeneratedBudget(generatedBudget) {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = ''; // Clear existing expenses
    generatedBudget.expenses.forEach(category => {
        // Normalize item to items
        if (category.item && !category.items) {
            category.items = Array.isArray(category.item) ? category.item : [category.item];
        }
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
            itemDiv.querySelector('.remove-item').addEventListener('click', () => itemDiv.remove());
        });

        categoryDiv.querySelector('.remove-category').addEventListener('click', () => categoryDiv.remove());
        categoryDiv.querySelector('.add-expense-item').addEventListener('click', () => {
            const newItemDiv = document.createElement('div');
            newItemDiv.classList.add('row', 'g-2', 'expense-item', 'mb-2');
            newItemDiv.innerHTML = `
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
            itemsDiv.appendChild(newItemDiv);
            newItemDiv.querySelector('.remove-item').addEventListener('click', () => newItemDiv.remove());
        });
    });
}

// Sample JSON (malformed)
// const budgetJson = `{
//     "budgetName": "May Budget",
//     "currency": "bdt",
//     "income": [
//         {
//             "source": "Salary",
//             "amount": 25000
//         }
//     ],
//     "expenses": [
//         {
//             "category": "Housing",
//             "items": [
//                 {
//                     "item": "Rent",
//                     "name": "Housing",
//                     "amount": 4000
//                 },
//                 {
//                     "item": "Utilities",
//                     "name": "Electricity & Internet",
//                     "amount": 1000
//                 }
//             ]
//         },
//         {
//             "category": "Food & Essentials",
//             "items": [
//                 {
//                     "item": "Groceries",
//                     "name": "Food",
//                     "amount": 2500
//                 }
//             ],
//             "category": "Transportation",
//             "items": [
//                 {
//                     "item": "Fuel",
//                     "name": "Transportation",
//                     "amount": 500
//                 }
//             ]
//         },
//         {
//             "category": "Entertainment",
//             "items": [
//                 {
//                     "item": "Dining Out",
//                     "name": "Entertainment",
//                     "amount": 1000
//                 }
//             ]
//         }
//     ]
// }`;