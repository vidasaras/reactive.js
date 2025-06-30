// reactive.js - Simple template-based reactive library that handles direct and external changes
// https://github.com/vidasaras/reactive.js

// Regular expressions for template matching
const singleValueRegex = /\${([^}]*)}/g;
const loopRegex = /\${loop:([^}]*)}([\s\S]*?)\${endloop}/g;
const loopItemRegex = /\${item\.([^}]*)}/g;
const conditionalRegex = /\${if:([^}]*)}([\s\S]*?)(?:\${else}([\s\S]*?))?\${endif}/g;

// Global state with handler to detect changes
let state = {};
let listeners = [];

// Main store creation function - returns a proxy to detect changes
function createStore(initialData = {}) {
  // Set initial state
  state = structuredClone(initialData);

  // Scan DOM when loaded
  document.addEventListener('DOMContentLoaded', () => {
    scanDOM();
    bindInputs();
  });

  // Return proxy for state
  return state;
}

// Process all templates in the DOM
function scanDOM() {
  // Process all template elements
  document.querySelectorAll('[data-template]').forEach(el => {
    if (!el.hasAttribute('data-original')) {
      el.setAttribute('data-original', el.innerHTML);
    }
    updateElement(el);
  });
}

// Update a specific element with current state
function updateElement(element) {
  const template = element.getAttribute('data-original');

  // Skip if template is missing
  if (!template) return;

  let result = template;

  // Process conditionals
  result = result.replace(conditionalRegex, (match, condition, trueBlock, falseBlock = '') => {
    const isTrue = evaluateExpression(condition.trim());
    return isTrue ? trueBlock : falseBlock;
  });

  // Process loops
  result = result.replace(loopRegex, (match, arrayName, itemTemplate) => {
    const array = evaluateExpression(arrayName.trim());

    if (!array || !Array.isArray(array) || array.length === 0) {
      return '';
    }

    return array.map(item => {
      // Replace ${item.property} with actual values
      return itemTemplate.replace(loopItemRegex, (match, property) => {
        return item[property] !== undefined ? item[property] : '';
      });
    }).join('');
  });

  // Process single values
  result = result.replace(singleValueRegex, (match, propertyName) => {
    const value = evaluateExpression(propertyName.trim());
    return value !== undefined ? value : '';
  });

  // Update the element content
  element.innerHTML = result;
}

// Evaluate expression against current state
function evaluateExpression(expression) {
  try {
    // Split by dots for nested properties
    const parts = expression.split('.');
    let value = state;

    for (const part of parts) {
      if (value === undefined || value === null) return '';
      value = value[part];
    }

    return value;
  } catch (e) {
    console.error('Error evaluating expression:', expression, e);
    return '';
  }
}

// Bind input elements
function bindInputs() {
  document.querySelectorAll('[data-bind]').forEach(input => {
    const property = input.getAttribute('data-bind');
    const event = input.getAttribute('data-event') || 'input';

    // Set initial value from state
    setInputValue(input, property);

    // Update state when input changes
    input.addEventListener(event, () => {
      setStateValue(property, input.value);
      renderAll();
    });

    // Add to listeners to update on state change
    addListener(() => {
      setInputValue(input, property);
    });
  });
}

// Set input value from state
function setInputValue(input, property) {
  const value = getStateValue(property);
  if (input.value !== value && value !== undefined) {
    input.value = value;
  }
}

// Get a value from state using dot notation
function getStateValue(path) {
  const parts = path.split('.');
  let value = state;

  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }

  return value;
}

// Set a value in state using dot notation
function setStateValue(path, value) {
  const parts = path.split('.');
  let current = state;

  // Navigate to the object containing the final property
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }

  // Set the final property
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

// Add a listener function to be called when state changes
function addListener(fn) {
  listeners.push(fn);
}

// Render all templates
function renderAll() {
  document.querySelectorAll('[data-template]').forEach(updateElement);
  listeners.forEach(fn => fn());
}

// Export a function to update state from outside and trigger re-render
window.updateState = function(newState) {
  // Deep merge new state
  mergeState(state, newState);
  renderAll();
};

// Helper to deep merge objects
function mergeState(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeState(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Create global render function
window.renderAll = renderAll;
