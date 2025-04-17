// Set up event listeners for the application
function setupEventListeners(viewChangeHandler) {
  // View toggle buttons
  document.getElementById('daily-btn').addEventListener('click', () => {
    setActiveButton('daily-btn');
    viewChangeHandler('daily');
  });
  
  document.getElementById('weekly-btn').addEventListener('click', () => {
    setActiveButton('weekly-btn');
    viewChangeHandler('weekly');
  });
  
  document.getElementById('monthly-btn').addEventListener('click', () => {
    setActiveButton('monthly-btn');
    viewChangeHandler('monthly');
  });
  
  // Set daily as default active button
  setActiveButton('daily-btn');
}

// Helper function to set the active button
function setActiveButton(buttonId) {
  // Remove active class from all buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected button
  document.getElementById(buttonId).classList.add('active');
}

export { setupEventListeners };

