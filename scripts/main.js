import { createChart, updateChart } from './chart-utils.js';
import { processData, calculateTotals } from './data-processing.js';
import { createDOMElement, updateDOM } from './dom-utils.js';
import { setupEventListeners } from './event-handlers.js';

// Global variables
let myChart = null;
let currentData = null;
let currentView = 'daily';

// Initialize the application
function initApp() {
  // Load initial data
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      currentData = data;
      
      // Process data for initial view
      const processedData = processData(data, currentView);
      const totals = calculateTotals(processedData);
      
      // Create chart
      myChart = createChart('myChart', processedData);
      
      // Update DOM with totals
      updateDOM(totals);
      
      // Setup event listeners
      setupEventListeners(handleViewChange);
    })
    .catch(error => console.error('Error loading data:', error));
}

// Handle view change (daily, weekly, monthly)
function handleViewChange(newView) {
  if (newView !== currentView) {
    currentView = newView;
    
    // Process data for new view
    const processedData = processData(currentData, currentView);
    const totals = calculateTotals(processedData);
    
    // Update chart
    updateChart(myChart, processedData);
    
    // Update DOM with new totals
    updateDOM(totals);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export global variables and functions for access from other modules
export { myChart, currentData, currentView, handleViewChange };

