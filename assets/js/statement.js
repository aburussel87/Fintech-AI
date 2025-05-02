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
    const rechargeSection = document.getElementById('recharge-section');
    const payBillSection = document.getElementById('paybill-section');
    const sendMoneySection = document.getElementById('sendmoney-section');

    // Clear previous content
    rechargeSection.innerHTML = "";
    payBillSection.innerHTML = "";
    sendMoneySection.innerHTML = "";

    data.forEach(transaction => {
        const transactionBox = createTransactionBox(transaction);

        if (transaction.type === 'recharge') {
            rechargeSection.appendChild(transactionBox);
        } else if (transaction.type === 'pay_bill') {
            payBillSection.appendChild(transactionBox);
        } else if (transaction.type === 'send_money') {
            sendMoneySection.appendChild(transactionBox);
        }
    });
}

function createTransactionBox(transaction) {
    const box = document.createElement('div');
    box.classList.add('transaction-box');
    box.classList.add(transaction.amount > 0 ? 'credit' : 'debit');

    const header = document.createElement('div');
    header.classList.add('d-flex', 'justify-content-between');

    const amount = document.createElement('span');
    amount.classList.add('transaction-header');
    amount.textContent = (transaction.amount > 0 ? '+' : '-') + ' $' + Math.abs(transaction.amount).toFixed(2);

    const date = document.createElement('span');
    date.classList.add('transaction-date');
    date.textContent = transaction.time;

    header.appendChild(amount);
    header.appendChild(date);

    const details = document.createElement('p');
    details.classList.add('transaction-details');
    details.textContent = transaction.details;

    box.appendChild(header);
    box.appendChild(details);

    return box;
}
