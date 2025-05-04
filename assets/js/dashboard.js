document.addEventListener('DOMContentLoaded', async () => {
    let transactions = [];
    let user;
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = "index.html";
            return;
        }

        const response = await fetch('http://localhost:5000/statement/dashboard', {
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
            user = data.user;
            transactions = user.transactions;
            document.getElementById('userName').innerText = user.name;
            document.getElementById('userEmail').innerText = user.email;
            document.getElementById('userPhone').innerText = user.phone;
            document.getElementById('userid').innerText = user.id;
            const img = document.getElementById("dashboardProfilePic");
            img.src = data.image ? `http://localhost:5000${data.image}` : "assets/logo.png";
            const summary = getTransactionSummaryByType(transactions, 7);
        } else {
            alert("Failed to fetch statement. Redirecting to login page.");
            localStorage.removeItem("access_token");
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error('Error fetching statement:', error);
        alert('Failed to load transaction data. Please try again later.');
    }


    function getTransactionSummaryByType(transactions, days = 7) {
        const summary = {
            "Recharge": { count: 0, totalAmount: 0 },
            "Sent Money": { count: 0, totalAmount: 0 },
            "Received Money": { count: 0, totalAmount: 0 },
            "Pay Bill": { count: 0, totalAmount: 0 },
        };

        // Get the cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        transactions.forEach(tx => {
            const txDate = new Date(`${tx.date} ${tx.time}`);

            if (txDate >= cutoffDate) {
                const category = tx.category;
                const amount = parseFloat(tx.amount);
                if (summary[category]) {
                    summary[category].count += 1;
                    summary[category].totalAmount += amount;
                }
            }
        });
        document.getElementById("box1Count").innerText = summary["Recharge"].count;
        document.getElementById("box1Total").innerText = `৳ ${summary["Recharge"].totalAmount.toFixed(2)}`;
        document.getElementById("box2Count").innerText = summary["Sent Money"].count;
        document.getElementById("box2Total").innerText = `৳ ${summary["Sent Money"].totalAmount.toFixed(2)}`;
        document.getElementById("box3Count").innerText = summary["Received Money"].count;
        document.getElementById("box3Total").innerText = `৳ ${summary["Received Money"].totalAmount.toFixed(2)}`;
        document.getElementById("box4Count").innerText = summary["Pay Bill"].count;
        document.getElementById("box4Total").innerText = `৳ ${summary["Pay Bill"].totalAmount.toFixed(2)}`;
        return summary;
    }




    const CATEGORY_MAP = {
        sentMoney: ["Sent Money"],
        receivedMoney: ["Received Money"],
        recharge: ["Recharge"]
    };

    function getCategoryType(category) {
        if (CATEGORY_MAP.sentMoney.includes(category)) return 'SentMoney';
        if (CATEGORY_MAP.receivedMoney.includes(category)) return 'ReceivedMoney';
        if (CATEGORY_MAP.recharge.includes(category)) return 'Recharge';
        return 'Other';
    }

    function getDateXDaysAgo(days) {
        const d = new Date();
        d.setDate(d.getDate() - days + 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getOrdinal(n) {
        if (n > 3 && n < 21) return n + 'th';
        switch (n % 10) {
            case 1: return n + 'st';
            case 2: return n + 'nd';
            case 3: return n + 'rd';
            default: return n + 'th';
        }
    }

    function formatDateLabel(dateStr) {
        const d = new Date(dateStr);
        const day = d.getDate();
        const month = d.toLocaleString('default', { month: 'short' });
        return `${getOrdinal(day)} ${month}`;
    }

    function formatLocalDate(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    



    const timelineSelect = document.getElementById('timelineSelect');

    function filterTransactions(days) {
        const fromDate = formatLocalDate(getDateXDaysAgo(days));

        return transactions.filter(tx => {
            return tx.date >= fromDate;
        });
    }

    function getPieData(transactions) {
        const sums = { SentMoney: 0, ReceivedMoney: 0, Recharge: 0 };

        transactions.forEach(tx => {
            const type = getCategoryType(tx.category);
            if (sums.hasOwnProperty(type)) {
                sums[type] += parseFloat(tx.amount,2);
            }
        });

        return [sums.SentMoney, sums.ReceivedMoney, sums.Recharge];
    }

    function getLineData(transactions, days) {
        const dateKeys = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dateKeys.push(formatLocalDate(d));

        }

        const sums = {
            SentMoney: dateKeys.map(() => 0),
            ReceivedMoney: dateKeys.map(() => 0),
            Recharge: dateKeys.map(() => 0)
        };

        transactions.forEach(tx => {
            const type = getCategoryType(tx.category);
            const idx = dateKeys.indexOf(tx.date);
            if (idx !== -1 && sums.hasOwnProperty(type)) {
                sums[type][idx] += parseFloat(tx.amount,2);
            }
        });

        return {
            labels: dateKeys.map(formatDateLabel),
            SentMoney: sums.SentMoney,
            ReceivedMoney: sums.ReceivedMoney,
            Recharge: sums.Recharge
        };
    }

    const pieColors = [
        'rgba(33, 150, 243, 0.7)',  // Sent Money
        'rgba(244, 180, 0, 0.7)',   // Received Money
        'rgba(255, 118, 230, 0.83)'  // Recharge
    ];

    let TpieChart, TlineChart;

    function renderCharts(transactions, days) {
        const pieData = getPieData(transactions);
        if (TpieChart) TpieChart.destroy(); // Destroy previous pie chart
        TpieChart = new Chart(document.getElementById('TpieChart'), {
            type: 'pie',
            data: {
                labels: ['Sent Money', 'Received Money', 'Recharge'],
                datasets: [{
                    data: pieData,
                    backgroundColor: pieColors,
                    borderColor: '#222',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: { family: 'Share Tech Mono', size: 16 }
                        }
                    }
                }
            }
        });

        const lineData = getLineData(transactions, days);
        if (TlineChart) TlineChart.destroy(); // Destroy previous line chart
        TlineChart = new Chart(document.getElementById('TlineChart'), {
            type: 'line',
            data: {
                labels: lineData.labels,
                datasets: [
                    {
                        label: 'Sent Money',
                        data: lineData.SentMoney,
                        fill: false,
                        borderColor: pieColors[0],
                        backgroundColor: pieColors[0],
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#fff',
                        borderWidth: 3
                    },
                    {
                        label: 'Received Money',
                        data: lineData.ReceivedMoney,
                        fill: false,
                        borderColor: pieColors[1],
                        backgroundColor: pieColors[1],
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#fff',
                        borderWidth: 3
                    },
                    {
                        label: 'Recharge',
                        data: lineData.Recharge,
                        fill: false,
                        borderColor: pieColors[2],
                        backgroundColor: pieColors[2],
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#fff',
                        borderWidth: 3
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: { family: 'Share Tech Mono', size: 14 }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff',
                            font: { family: 'Share Tech Mono', size: 13 }
                        },
                        grid: { color: 'rgba(255,255,255,0.08)' }
                    },
                    y: {
                        ticks: {
                            color: '#fff',
                            font: { family: 'Share Tech Mono', size: 13 }
                        },
                        grid: { color: 'rgba(255,255,255,0.08)' }
                    }
                }
            }
        });
    }

    let begin = true;
    function updateDashboard() {
        if (begin) {
            const filtered = filterTransactions(7); // Default to 30 days
            // renderTransactions(filtered); // Render the filtered transactions
            renderCharts(filtered, 7);  // Render the charts (pie and line)
            getTransactionSummaryByType(filtered, 7); // Render the summary boxes
            begin = false;
            return;
        }
        const days = parseInt(timelineSelect.value, 10);
        const filtered = filterTransactions(days);
        //renderTransactions(filtered); // Render the filtered transactions
        renderCharts(filtered, days);  // Render the charts (pie and line)
        getTransactionSummaryByType(filtered, days); // Render the summary boxes

    }

    timelineSelect.addEventListener('change', updateDashboard);

    updateDashboard(); // Initial render
});
