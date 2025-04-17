import { formatCurrency } from './data-processing.js';

// Create a DOM element with given attributes and content
function createDOMElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Set content
  if (content) {
    element.textContent = content;
  }
  
  return element;
}

// Update DOM elements with new data
function updateDOM(totals) {
  document.getElementById('total-value').textContent = formatCurrency(totals.total);
  document.getElementById('average-value').textContent = formatCurrency(totals.average);
  document.getElementById('maximum-value').textContent = formatCurrency(totals.maximum);
}

export { createDOMElement, updateDOM };

