document.addEventListener('DOMContentLoaded', async () => {
    // Fetch user data
    let userData;
    try {
      const res = await fetch('assets/js/user_data.json');
      const data = await res.json();
      userData = data.user;
      console.log('Fetched userData:', userData);
      // Set dashboard profile picture
      var profilePic = document.getElementById('dashboardProfilePic');
      if (profilePic && userData.avatar) {
        // Fix relative path if needed
        let avatarPath = userData.avatar;
        if (avatarPath.startsWith('../')) {
          avatarPath = avatarPath.replace('../', 'assets_2/');
        }
        profilePic.src = avatarPath;
      }
    } catch (e) {
      document.getElementById('userBalance').textContent = 'Error loading data';
      document.getElementById('transactionList').innerHTML = '<div style="color:#f48fb1;padding:18px;text-align:center;">Error loading transactions.</div>';
      return;
    }
  
    // Category mapping
    const CATEGORY_MAP = {
      must: ["Groceries", "Rent", "Utilities", "Transportation"],
      need: ["Healthcare", "Education", "Insurance"],
      want: ["Entertainment", "Dining", "Shopping", "Subscriptions"]
    };
  
    // Helper: categorize
    function getCategoryType(category) {
      if (CATEGORY_MAP.must.includes(category)) return 'Must';
      if (CATEGORY_MAP.need.includes(category)) return 'Need';
      if (CATEGORY_MAP.want.includes(category)) return 'Want';
      return 'Other';
    }
  
    // Helper: get date X days ago
    function getDateXDaysAgo(days) {
      const d = new Date();
      d.setDate(d.getDate() - days + 1); // inclusive
      d.setHours(0,0,0,0);
      return d;
    }
  
    // Helper: ordinal suffix for date
    function getOrdinal(n) {
      if (n > 3 && n < 21) return n + 'th';
      switch (n % 10) {
        case 1: return n + 'st';
        case 2: return n + 'nd';
        case 3: return n + 'rd';
        default: return n + 'th';
      }
    }
  
    // Helper: format date as '1st May'
    function formatDateLabel(dateStr) {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' });
      return `${getOrdinal(day)} ${month}`;
    }
  
    // Set balance
    document.getElementById('userBalance').textContent = `$${userData.balance.toLocaleString()}`;
  
    // Render transactions (show both date and time)
    function renderTransactions(transactions) {
      const list = document.getElementById('transactionList');
      list.innerHTML = '';
      if (!transactions.length) {
        list.innerHTML = '<div style="color:#90caf9;padding:18px;text-align:center;">No transactions in this period.</div>';
        return;
      }
      transactions.forEach(tx => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.tabIndex = 0;
        div.innerHTML = `
          <span class="transaction-date">${tx.date} ${tx.time}</span>
          <span class="transaction-category">${tx.category}</span>
          <span class="transaction-amount">$${tx.amount.toFixed(2)}</span>
        `;
        div.addEventListener('click', () => showModal(tx));
        div.addEventListener('keypress', e => { if (e.key === 'Enter') showModal(tx); });
        list.appendChild(div);
      });
    }
  
    // Modal logic
    const modal = document.getElementById('transactionModal');
    const closeModalBtn = document.getElementById('closeModal');
    function showModal(tx) {
      document.getElementById('modalDetails').innerHTML = `
        <h4 style="margin-bottom:16px;">Transaction Details</h4>
        <div><b>Date:</b> ${tx.date} ${tx.time}</div>
        <div><b>Category:</b> ${tx.category}</div>
        <div><b>Amount:</b> $${tx.amount.toFixed(2)}</div>
        <div><b>Invoice ID:</b> ${tx.invoice_id}</div>
        <div><b>Receiver ID:</b> ${tx.receiver_id}</div>
      `;
      modal.style.display = 'flex';
    }
    closeModalBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  
    // Timeline filter
    const timelineSelect = document.getElementById('timelineSelect');
    function filterTransactions(days) {
      const fromDate = getDateXDaysAgo(days);
      return userData.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        txDate.setHours(0,0,0,0);
        return txDate >= fromDate;
      });
    }
  
    // Pie chart data
    function getPieData(transactions) {
      const sums = { Must: 0, Need: 0, Want: 0 };
      transactions.forEach(tx => {
        const type = getCategoryType(tx.category);
        if (sums[type] !== undefined) sums[type] += tx.amount;
      });
      return [sums.Must, sums.Need, sums.Want];
    }
  
    // Line chart data (three lines: Must, Need, Want)
    function getLineData(transactions, days) {
      // Prepare date keys
      const dateKeys = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0,10);
        dateKeys.push(key);
      }
      // Prepare sums for each type
      const sums = {
        Must: dateKeys.map(() => 0),
        Need: dateKeys.map(() => 0),
        Want: dateKeys.map(() => 0)
      };
      transactions.forEach(tx => {
        const type = getCategoryType(tx.category);
        const idx = dateKeys.indexOf(tx.date);
        if (idx !== -1 && sums[type] !== undefined) {
          sums[type][idx] += tx.amount;
        }
      });
      return {
        labels: dateKeys.map(formatDateLabel),
        Must: sums.Must,
        Need: sums.Need,
        Want: sums.Want
      };
    }
  
    // Chart.js theme colors
    const pieColors = [
      'rgba(33, 150, 243, 0.7)', // Must
      'rgba(244, 180, 0, 0.7)',  // Need
      'rgba(244, 143, 177, 0.7)' // Want
    ];
  
    // Render charts
    let pieChart, lineChart;
    function renderCharts(transactions, days) {
      // Pie
      const pieData = getPieData(transactions);
      if (pieChart) pieChart.destroy();
      pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
          labels: ['Must', 'Need', 'Want'],
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
              labels: { color: '#fff', font: { family: 'Share Tech Mono', size: 16 } }
            }
          }
        }
      });
      // Line (three lines)
      const lineData = getLineData(transactions, days);
      if (lineChart) lineChart.destroy();
      lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
          labels: lineData.labels,
          datasets: [
            {
              label: 'Must',
              data: lineData.Must,
              fill: false,
              borderColor: pieColors[0],
              backgroundColor: pieColors[0],
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: '#fff',
              borderWidth: 3
            },
            {
              label: 'Need',
              data: lineData.Need,
              fill: false,
              borderColor: pieColors[1],
              backgroundColor: pieColors[1],
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: '#fff',
              borderWidth: 3
            },
            {
              label: 'Want',
              data: lineData.Want,
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
              labels: { color: '#fff', font: { family: 'Share Tech Mono', size: 14 } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#fff', font: { family: 'Share Tech Mono', size: 13 } },
              grid: { color: 'rgba(255,255,255,0.08)' }
            },
            y: {
              ticks: { color: '#fff', font: { family: 'Share Tech Mono', size: 13 } },
              grid: { color: 'rgba(255,255,255,0.08)' }
            }
          }
        }
      });
    }
  
    // Initial render
    function updateDashboard() {
      const days = parseInt(timelineSelect.value, 10);
      const filtered = filterTransactions(days);
      renderTransactions(filtered);
      renderCharts(filtered, days);
    }
  
    timelineSelect.addEventListener('change', updateDashboard);
  
    // Initial load
    updateDashboard();
  });
  