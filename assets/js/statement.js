document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
});

async function loadTransactions() {
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = "index.html";
            return;
        }

        const response = await fetch('http://localhost:5000/statement', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert("Unauthorized access. Please log in again.");
            localStorage.removeItem("access_token");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();

        if (data.success === true) {
            const transactions = data.transactions;
            renderTransactions(transactions);
        } else {
            alert("Failed to fetch statement. Redirecting to login page.");
            localStorage.removeItem("access_token");
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error('Error fetching statement:', error);
        alert('Failed to load transaction data. Please try again later.');
    }
}

function renderTransactions(data) {
    const sections = {
        recharge: document.getElementById('recharge-section'),
        pay_bill: document.getElementById('paybill-section'),
        send_money: document.getElementById('sendmoney-section'),
        recieved_money: document.getElementById('recievedmoney-section')
    };

    // Clear previous content
    for (const key in sections) {
        sections[key].innerHTML = '';
    }

    // Group transactions by type and date
    const groupedByDate = {};

    data.forEach(transaction => {
        const dateOnly = new Date(transaction.time).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const type = transaction.type;

        if (!groupedByDate[type]) {
            groupedByDate[type] = {};
        }

        if (!groupedByDate[type][dateOnly]) {
            groupedByDate[type][dateOnly] = [];
        }

        groupedByDate[type][dateOnly].push(transaction);
    });

    // Render grouped transactions
    for (const type in groupedByDate) {
        const section = sections[type];
        const dateGroups = groupedByDate[type];

        for (const date in dateGroups) {
            const dateHeader = document.createElement('h4');
            dateHeader.textContent = date;
            dateHeader.classList.add('transaction-date-header');
            section.appendChild(dateHeader);

            dateGroups[date].forEach(transaction => {
                const transactionBox = createTransactionBox(transaction);
                section.appendChild(transactionBox);
            });
        }
    }
}

function createTransactionBox(transaction) {
    const box = document.createElement('div');
    box.classList.add('transaction-box');
    box.classList.add(transaction.amount > 0 ? 'credit' : 'debit');

    const header = document.createElement('div');
    header.classList.add('d-flex', 'justify-content-between');

    const amount = document.createElement('span');
    amount.classList.add('transaction-header');
    amount.textContent = (transaction.amount > 0 ? '+' : '-') + ' ৳' + Math.abs(transaction.amount).toFixed(2);

    const time = new Date(transaction.time).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const date = document.createElement('span');
    date.classList.add('transaction-date');
    date.textContent = time;

    header.appendChild(amount);
    header.appendChild(date);

    const details = document.createElement('p');
    details.classList.add('transaction-details');
    details.textContent = transaction.details;

    box.appendChild(header);
    box.appendChild(details);

    return box;
}
