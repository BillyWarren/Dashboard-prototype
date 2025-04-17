// Process data based on the current view (daily, weekly, monthly)
function processData(data, view) {
  let labels = [];
  let values = [];
  
  switch(view) {
    case 'daily':
      // Process daily data
      data.daily.forEach(item => {
        labels.push(item.date);
        values.push(item.value);
      });
      break;
    case 'weekly':
      // Process weekly data
      data.weekly.forEach(item => {
        labels.push(`Week ${item.week}`);
        values.push(item.value);
      });
      break;
    case 'monthly':
      // Process monthly data
      data.monthly.forEach(item => {
        labels.push(item.month);
        values.push(item.value);
      });
      break;
  }
  
  return { labels, values };
}

// Calculate totals from the processed data
function calculateTotals(data) {
  const sum = data.values.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.values.length;
  const max = Math.max(...data.values);
  
  return {
    total: sum,
    average: avg.toFixed(2),
    maximum: max
  };
}

// Format currency values
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export { processData, calculateTotals, formatCurrency };

