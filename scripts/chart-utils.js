// Create a new chart
function createChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Sales',
        data: data.values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Update an existing chart with new data
function updateChart(chart, data) {
  chart.data.labels = data.labels;
  chart.data.datasets[0].data = data.values;
  chart.update();
}

export { createChart, updateChart };

