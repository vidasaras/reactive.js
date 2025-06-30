// reactive.js - Simple template-based reactive library that handles direct and external changes
// https://github.com/vidasaras/reactive.js

// Regular expressions for template matching
const singleValueRegex = /\${([^}]*)}/g;
const loopRegex = /\${loop:([^}]*)}([\s\S]*?)\${endloop}/g;
const loopItemRegex = /\${item\.([^}]*)}/g;
const conditionalRegex = /\${if:([^}]*)}([\s\S]*?)(?:\${else}([\s\S]*?))?\${endif}/g;

// Global state for the reactive system, now module-scoped
let state = {};
let listeners = [];

/**
 * Creates and initializes the reactive store.
 * Sets the initial state and scans the DOM for templates and input bindings.
 * @param {object} initialData - The initial data for the store.
 * @returns {object} The reactive state object.
 */
export function createStore(initialData = {}) {
  // Set initial state for this module
  state = structuredClone(initialData);

  // Scan DOM when loaded
  document.addEventListener('DOMContentLoaded', () => {
    scanDOM();
    bindInputs();
  });

  // Return the state object (or a proxy if more advanced reactivity is desired)
  return state;
}

/**
 * Scans the DOM for elements with 'data-template' and processes them.
 * Stores the original HTML content in 'data-original' attribute for re-rendering.
 */
function scanDOM() {
  document.querySelectorAll('[data-template]').forEach(el => {
    if (!el.hasAttribute('data-original')) {
      el.setAttribute('data-original', el.innerHTML);
    }
    updateElement(el);
  });
}

/**
 * Updates a specific DOM element based on the current state and its original template.
 * Processes conditionals, loops, and single value substitutions.
 * @param {HTMLElement} element - The DOM element to update.
 */
function updateElement(element) {
  const template = element.getAttribute('data-original');

  // Skip if template is missing
  if (!template) return;

  let result = template;

  // Process conditionals: ${if:condition}trueBlock${else}falseBlock${endif}
  result = result.replace(conditionalRegex, (match, condition, trueBlock, falseBlock = '') => {
    const isTrue = evaluateExpression(condition.trim());
    return isTrue ? trueBlock : falseBlock;
  });

  // Process loops: ${loop:arrayName}itemTemplate${endloop}
  result = result.replace(loopRegex, (match, arrayName, itemTemplate) => {
    const array = evaluateExpression(arrayName.trim());

    if (!array || !Array.isArray(array) || array.length === 0) {
      return ''; // Return empty string if array is not found or empty
    }

    // Map each item in the array to its processed template
    return array.map(item => {
      // Replace ${item.property} with actual values from the current loop item
      return itemTemplate.replace(loopItemRegex, (match, property) => {
        return item[property] !== undefined ? item[property] : '';
      });
    }).join(''); // Join processed item templates
  });

  // Process single values: ${propertyName}
  result = result.replace(singleValueRegex, (match, propertyName) => {
    const value = evaluateExpression(propertyName.trim());
    return value !== undefined ? value : '';
  });

  // Update the element's inner HTML with the processed result
  element.innerHTML = result;
}

/**
 * Evaluates a given expression against the current state.
 * Supports dot notation for nested properties (e.g., 'user.name').
 * @param {string} expression - The expression string to evaluate.
 * @returns {*} The value of the expression from the state, or an empty string if not found or error.
 */
function evaluateExpression(expression) {
  try {
    // Split by dots to navigate nested properties
    const parts = expression.split('.');
    let value = state; // Start from the global module state

    for (const part of parts) {
      if (value === undefined || value === null) return ''; // Stop if any part of the path is null/undefined
      value = value[part];
    }

    return value;
  } catch (e) {
    console.error('Error evaluating expression:', expression, e);
    return '';
  }
}

/**
 * Binds input elements with 'data-bind' attribute to the state.
 * Updates the state when the input value changes and re-renders all templates.
 */
function bindInputs() {
  document.querySelectorAll('[data-bind]').forEach(input => {
    const property = input.getAttribute('data-bind');
    const event = input.getAttribute('data-event') || 'input'; // Default to 'input' event

    // Set initial value of the input from the state
    setInputValue(input, property);

    // Add event listener to update state when input changes
    input.addEventListener(event, () => {
      setStateValue(property, input.value);
      renderAll(); // Re-render all templates after state change
    });

    // Add a listener to update the input value when state changes from other sources
    addListener(() => {
      setInputValue(input, property);
    });
  });
}

/**
 * Sets the value of an input element from the current state.
 * @param {HTMLInputElement} input - The input element to update.
 * @param {string} property - The state property path to get the value from.
 */
function setInputValue(input, property) {
  const value = getStateValue(property);
  // Only update if the input's current value is different from the state value
  // to prevent infinite loops or unnecessary DOM updates.
  if (input.value !== value && value !== undefined) {
    input.value = value;
  }
}

/**
 * Gets a value from the module's global state using dot notation path.
 * @param {string} path - The dot-separated path to the property (e.g., 'user.name').
 * @returns {*} The value at the specified path, or undefined if not found.
 */
function getStateValue(path) {
  const parts = path.split('.');
  let value = state; // Start from the module's global state

  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }

  return value;
}

/**
 * Sets a value in the module's global state using dot notation path.
 * Creates nested objects if they don't exist.
 * @param {string} path - The dot-separated path to the property (e.g., 'user.name').
 * @param {*} value - The value to set.
 */
function setStateValue(path, value) {
  const parts = path.split('.');
  let current = state; // Start from the module's global state

  // Navigate to the object containing the final property
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {}; // Create nested object if it doesn't exist
    }
    current = current[part];
  }

  // Set the final property
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

/**
 * Adds a listener function to be called whenever the state changes and re-renders occur.
 * @param {function} fn - The function to add as a listener.
 */
function addListener(fn) {
  listeners.push(fn);
}

/**
 * Renders all elements with 'data-template' attribute and calls all registered listeners.
 * This function should be called after any direct state modification.
 */
export function renderAll() {
  document.querySelectorAll('[data-template]').forEach(updateElement);
  listeners.forEach(fn => fn());
}

/**
 * Updates the global state with new data and triggers a re-render.
 * Performs a deep merge of the new state into the existing state.
 * @param {object} newState - The new state object to merge.
 */
export function updateState(newState) {
  // Deep merge new state into the module's global state
  mergeState(state, newState);
  renderAll(); // Trigger re-render after state update
}

/**
 * Helper function to deep merge two objects.
 * @param {object} target - The target object to merge into.
 * @param {object} source - The source object to merge from.
 */
function mergeState(target, source) {
  for (const key in source) {
    // Check if the source property is an object (and not an array)
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {}; // Create target property if it doesn't exist
      mergeState(target[key], source[key]); // Recursively merge nested objects
    } else {
      target[key] = source[key]; // Directly assign primitive values or arrays
    }
  }
}

