
  // BpieChart: Budget Breakdown (Animated)
  const BpieCtx = document.getElementById('BpieChart').getContext('2d');
  const BpieChart = new Chart(BpieCtx, {
    type: 'pie',
    data: {
      labels: ['Housing', 'Food', 'Entertainment', 'Savings', 'Transportation'],
      datasets: [{
        label: 'Budget Breakdown',
        data: [50, 20, 10, 15, 5], // Sample data (percentages)
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4caf50', '#ff9800'],
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      animation: {
        animateScale: true,
        animateRotate: true
      },
      plugins: {
        tooltip: {
          backgroundColor: '#222',
          titleColor: '#fff',
          bodyColor: '#fff',
        },
        legend: {
          labels: {
            color: '#fff' // <-- Change legend text color
          }
        },
        scale: {
          ticks: {
            color: '#fff' // <-- Change scale ticks color
          }
        }
      }
    }
  });

  // BlineChart: Monthly Spending History (Animated)
  const BlineCtx = document.getElementById('BlineChart').getContext('2d');

// Create gradient stroke
const gradientStroke = BlineCtx.createLinearGradient(0, 0, BlineCtx.canvas.width, 0);
gradientStroke.addColorStop(0, '#ff6a00'); // Orange
gradientStroke.addColorStop(0.5, '#ff00c8'); // Pink
gradientStroke.addColorStop(1, '#6a00ff'); // Purple

// Optional: Create gradient fill
const gradientFill = BlineCtx.createLinearGradient(0, 0, 0, BlineCtx.canvas.height);
gradientFill.addColorStop(0, 'rgba(255,106,0,0.3)');
gradientFill.addColorStop(1, 'rgba(106,0,255,0.05)');

const BlineChart = new Chart(BlineCtx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Spending History',
      data: [800, 1200, 900, 1100, 950, 1050, 1000],
      fill: true, // Enable area under the line
      backgroundColor: gradientFill,
      borderColor: gradientStroke,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: gradientStroke,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  },
  options: {
    responsive: true,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff'
      },
      legend: {
        labels: {
          color: '#fff' // <-- Change legend text color
        }
      }
    }
  }
  
});
