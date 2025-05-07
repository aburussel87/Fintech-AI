const form = document.getElementById('uploadForm');
const output = document.getElementById('output');
let menus;
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    output.textContent = "Processing...";

    try {
        const res = await fetch('http://192.168.0.158:5000/api/process', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (data.error) {
            output.textContent = "Error: " + data.error;
        } else {

            let invoice = JSON.stringify(data, null, 2);
            menus = extractMenuItems(invoice);
            render_split_invoice(menus);
            let formatted = `<h5>Invoice Summary</h5>`;
            formatted += `<table class="table table-bordered table-sm"><thead><tr><th>Item</th><th>Qty</th><th>Total Price</th></tr></thead><tbody>`;

            menus.forEach(item => {
                formatted += `<tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.totalPrice}</td>
        </tr>`;
            });

            formatted += `</tbody></table>`;
            output.innerHTML = formatted;
        }
    } catch (err) {
        output.textContent = "Fetch error: " + err.message;
    }
});
let service_price = 0;
let tax_price = 0;

function extractMenuItems(jsonString) {
    try {
        // Parse the JSON string
        const data = JSON.parse(jsonString);

        const menuItems = data.menu.map(item => ({
            name: item.nm,
            quantity: parseInt(item.cnt),
            totalPrice: parseFloat(item.price)
        }));
        tax_price = parseFloat(data.sub_total.tax_price.replace(/,/g, ''));
        service_price = parseFloat(data.total.total_price.replace(/,/g, ''));
        return menuItems;
    } catch (error) {
        console.error("Invalid JSON string:", error);
        return [];
    }
}

function render_split_invoice(menus) {

    const addUserBtn = document.getElementById('addUserBtn');
    const splitDiv = document.getElementById('split');
    const userListDiv = document.getElementById('userList');
    const descriptionDiv = document.getElementById('description');
    const items = menus.map(item => item.name); // ✅ fixed this line
    const verifiedUsers = [];

    // Done button
    const doneBtn = document.createElement('button');
    doneBtn.textContent = 'Done';
    doneBtn.className = 'btn btn-success mt-3';
    doneBtn.addEventListener('click', () => {
        // Remove any unverified input groups
        const groups = splitDiv.querySelectorAll('.input-group');
        groups.forEach(group => {
            const input = group.querySelector('input');
            if (!input.disabled) {
                group.remove();
            }
        });

        // Create input sections for each verified user
        verifiedUsers.forEach(user => {
            createUserSection(user);
        });

        // Remove Done and Add User buttons
        doneBtn.remove();
        addUserBtn.remove();

        // Add Submit button after description
        addSubmitButton(menus);
    });

    addUserBtn.addEventListener('click', () => {
        createUserInputGroup();
        if (!splitDiv.contains(doneBtn)) {
            splitDiv.appendChild(doneBtn);
        }
    });

    function createUserInputGroup() {
        const container = document.createElement('div');
        container.className = 'input-group mb-2';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter User ID';
        input.className = 'form-control';

        const verifyBtn = document.createElement('button');
        verifyBtn.className = 'btn btn-outline-primary';
        verifyBtn.textContent = 'Verify';

        verifyBtn.addEventListener('click', async () => {
            const userId = input.value.trim();
            if (!userId) {
                alert('Please enter a user ID.');
                return;
            }

            const isValid = await verify(userId);
            if (isValid) {
                input.disabled = true;
                verifyBtn.disabled = true;
                verifyBtn.textContent = 'Verified';
                verifyBtn.classList.remove('btn-outline-primary');
                verifyBtn.classList.add('btn-success');
                verifiedUsers.push(userId);
                createUserInputGroup();
            } else {
                alert('Verification failed. Try again.');
            }
        });

        container.appendChild(input);
        container.appendChild(verifyBtn);

        if (splitDiv.contains(doneBtn)) {
            splitDiv.insertBefore(container, doneBtn);
        } else {
            splitDiv.appendChild(container);
        }
    }

    // verification
    async function verify() {
        const receiverId = document.getElementById('receiver-id');
        if (receiverId.value.trim() === "") {
          alert("Please enter both Receiver ID");
          return;
        }
      
        const receiverData = {
          id: receiverId.value
        };
      
        const token = localStorage.getItem("access_token");  // Assume token is stored in localStorage after login
        console.log(token);
        if (!token) {
          alert("Unauthorized Access. Please log in.");
          window.location.href = "index.html"; // Redirect to login page if not logged in
          return;
        }
      
        try {
          const response = await fetch("http://192.168.0.170:5000/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`  // Send the token in the Authorization header
            },
            body: JSON.stringify(receiverData)
          });
      
          const data = await response.json();
      
          if (data.success) {
            alert("Receiver verified successfully!");
            return true;
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Verification failed:", error);
          alert("Failed to verify receiver. Please try again.");
        }
      }

    function createUserSection(userId) {
        const section = document.createElement('div');
        section.className = 'mb-3';

        const label = document.createElement('h5');
        label.textContent = `User: ${userId}`;
        section.appendChild(label);

        const row = document.createElement('div');
        row.className = 'input-group mb-2';

        const select = document.createElement('select');
        select.className = 'form-select';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = 1;
        qtyInput.placeholder = 'Qty';
        qtyInput.className = 'form-control';

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add';
        addBtn.className = 'btn btn-primary';

        addBtn.addEventListener('click', () => {
            const item = select.value;
            const quantity = qtyInput.value;
            if (!quantity || quantity <= 0) {
                alert('Enter a valid quantity');
                return;
            }

            const entry = document.createElement('div');
            entry.textContent = `${userId} : { item: "${item}", quantity: ${quantity} }`;
            descriptionDiv.appendChild(entry);

            qtyInput.value = '';
            select.selectedIndex = 0;
        });

        row.appendChild(select);
        row.appendChild(qtyInput);
        row.appendChild(addBtn);
        section.appendChild(row);
        userListDiv.appendChild(section);
    }

    function addSubmitButton(menus) {
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.className = 'btn btn-warning mt-4';
    
        submitBtn.addEventListener('click', () => {
            const userExpenses = {}; // { user1: 120, user2: 85, ... }
    
            // Loop through all entries in descriptionDiv
            const entries = descriptionDiv.querySelectorAll('div');
            entries.forEach(entry => {
                const text = entry.textContent.trim(); // Example: user1 : { item: "Burger", quantity: 2 }
    
                // Extract values using regex
                const match = text.match(/^(\w+)\s*:\s*{ item: "(.+)", quantity: (\d+) }$/);
                if (match) {
                    const [, user, itemName, qtyStr] = match;
                    const qty = parseInt(qtyStr);
    
                    // Find item in menus
                    const menuItem = menus.find(m => m.name === itemName);
                    if (menuItem) {
                        const unitPrice = menuItem.totalPrice / menuItem.quantity;
                        const cost = unitPrice * qty;
    
                        if (!userExpenses[user]) userExpenses[user] = 0;
                        userExpenses[user] += cost;
                    }
                }
            });
    
            // Display results
            let result = `<h5 class="mt-4">Final Expense Summary</h5>`;
            result += `<ul class="list-group mb-3">`;
            for (const [user, total] of Object.entries(userExpenses)) {
                result += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    ${user}
                    <span class="badge bg-primary rounded-pill">৳${total.toFixed(2)}</span>
                </li>`;
            }
            result += `</ul>`;
    
            descriptionDiv.innerHTML += result;
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitted";
        });
    
        descriptionDiv.appendChild(submitBtn);
    }
    
}



