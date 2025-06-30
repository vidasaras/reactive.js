# Reactive.js Documentation (generated with a capable LLM)

**Reactive.js** is a lightweight, template-based reactive library that enables you to create dynamic web applications with minimal configuration. It handles both direct state changes and external updates, making it perfect for small to medium-sized projects.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Template Syntax](#template-syntax)
4. [Data Binding](#data-binding)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Getting Started

Reactive.js offers two primary ways to include and use the library in your project:

### 1. Direct HTML Script Inclusion (for simple projects or quick prototyping)

This method is suitable for projects where you include JavaScript directly in your HTML or concatenate scripts without a module bundler.

1.  **Include the script:**
    ```html
    <script src="path/to/reactive.js"></script>
    ```
    * **Note:** When using this method, the `createStore`, `updateState`, and `renderAll` functions are exposed globally on the `window` object. You would call them like `window.createStore()`, `window.updateState()`, and `window.renderAll()`. For convenience, `window.updateState` and `window.renderAll` are automatically aliased to just `updateState` and `renderAll` in the global scope.

2.  **Create HTML elements with templates:**
    ```html
    <div data-template>
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
    ```

3.  **Initialize your store with initial data:**
    ```javascript
    const store = createStore({ // Uses the globally available createStore
      title: "Hello Reactive.js",
      message: "This is a reactive application"
    });

    // To update state:
    updateState({ message: "State updated!" }); // Uses the globally available updateState
    ```

### 2. ES Module Import (for modern projects with bundlers like Vite, Webpack, Rollup)

This method is recommended for structured projects using module bundlers, providing better dependency management and code organization.

1.  **Ensure `reactive-lib.js` is an ES Module:**
    The `reactive-lib.js` file should have `export` statements for the functions you want to use (e.g., `export function createStore(...)`). The version provided in our previous interaction is already set up this way.

2.  **Import the functions in your main JavaScript file (e.g., `main.js`):**
    ```javascript
    // main.js
    import { createStore, updateState, renderAll } from './reactive-lib.js'; // Adjust path as needed

    // Initialize your store
    const store = createStore({
      title: "Hello Reactive.js (Module)",
      message: "This is a reactive application using ES Modules"
    });

    // To update state:
    updateState({ message: "State updated via module import!" });

    // If you need to manually trigger a re-render:
    // renderAll();
    ```

3.  **Link your main JavaScript file as a module in your `index.html`:**
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <!-- ... -->
    </head>
    <body>
        <!-- Your HTML content with data-template elements -->
        <div data-template>
            <h1>${title}</h1>
            <p>${message}</p>
        </div>
        <!-- ... -->

        <script type="module" src="/main.js"></script>
    </body>
    </html>
    ```

That's it! Your UI will automatically update whenever your data changes.
## Core Concepts

### State Management

Reactive.js uses a centralized state object that serves as the single source of truth for your application. When the state changes, all templates using that data automatically update.

### Templates

Templates are regular HTML elements marked with the `data-template` attribute. They contain special expressions in `${}` syntax that are replaced with actual data from your state.

### Reactivity

The library maintains reactivity in two ways:
- Through form input bindings with `data-bind`
- Through programmatic state updates via `window.updateState()`

## Template Syntax

Reactive.js supports three main template features:

### Single Values

Display a single value from your state:

```html
<span>${propertyName}</span>
```

You can access nested properties using dot notation:

```html
<span>${user.profile.name}</span>
```

### Conditional Rendering

Conditionally render content based on state values:

```html
<div data-template>
  ${if:user.isLoggedIn}
    <p>Welcome, ${user.name}!</p>
  ${else}
    <p>Please log in</p>
  ${endif}
</div>
```

### Loops

Iterate over arrays to render lists:

```html
<ul data-template>
  ${loop:todos}
    <li>${item.text} - ${item.status}</li>
  ${endloop}
</ul>
```

In loops, use `${item.property}` to access properties of the current item.

## Data Binding

### Input Binding

To create two-way data binding with form elements:

```html
<input type="text" data-bind="user.name">
```

This automatically:
1. Sets the input's initial value from the state
2. Updates the state when the input changes
3. Re-renders all templates that use this data

### Custom Event Binding

By default, inputs use the 'input' event for binding. You can specify a different event:

```html
<select data-bind="preferences.theme" data-event="change">
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
```

## API Reference

### `createStore(initialData)`

Creates and initializes the application state.

- **Parameters:**
  - `initialData` (Object): Initial state data
- **Returns:** The state object

### `window.updateState(newState)`

Updates the application state and triggers a re-render.

- **Parameters:**
  - `newState` (Object): New state data to merge with existing state
- **Notes:**
  - Performs a deep merge with existing state
  - Arrays are replaced, not merged

### `window.renderAll()`

Manually triggers a re-render of all templates.

- **Use case:** When you need to re-render after DOM changes or other events

## Examples

### Simple Counter

```html
<div data-template>
  <h2>Counter: ${counter}</h2>
  <button onclick="updateState({counter: counter + 1})">Increment</button>
</div>

<script>
  const store = createStore({
    counter: 0
  });
</script>
```

### Todo List

```html
<div data-template>
  <h2>Todo List (${todos.length} items)</h2>

  <form onsubmit="addTodo(event)">
    <input type="text" data-bind="newTodo">
    <button type="submit">Add</button>
  </form>

  <ul>
    ${loop:todos}
      <li>
        <input type="checkbox" onchange="toggleTodo(${item.id})">
        <span style="${item.completed ? 'text-decoration: line-through' : ''}">${item.text}</span>
      </li>
    ${endloop}
  </ul>
</div>

<script>
  const store = createStore({
    todos: [
      { id: 1, text: "Learn Reactive.js", completed: false },
      { id: 2, text: "Build an app", completed: false }
    ],
    newTodo: ""
  });

  function addTodo(event) {
    event.preventDefault();
    const text = store.newTodo.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false
    };

    updateState({
      todos: [...store.todos, newTodo],
      newTodo: ""
    });
  }

  function toggleTodo(id) {
    const updatedTodos = store.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    updateState({ todos: updatedTodos });
  }
</script>
```

### User Profile Form

```html
<div data-template>
  <h2>User Profile</h2>

  <form>
    <div>
      <label>Name:</label>
      <input type="text" data-bind="user.name">
    </div>

    <div>
      <label>Email:</label>
      <input type="email" data-bind="user.email">
    </div>

    <div>
      <label>Preferences:</label>
      <select data-bind="user.preferences.theme" data-event="change">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  </form>

  <div class="preview">
    <h3>Preview:</h3>
    <p>Name: ${user.name}</p>
    <p>Email: ${user.email}</p>
    <p>Theme: ${user.preferences.theme}</p>
  </div>
</div>

<script>
  const store = createStore({
    user: {
      name: "John Doe",
      email: "john@example.com",
      preferences: {
        theme: "light"
      }
    }
  });
</script>
```

## Best Practices

### Performance Optimization

1. **Keep templates focused**: Create multiple smaller templates instead of one large template
2. **Use specific selectors**: Target specific elements for updates when possible
3. **Group updates**: Batch multiple state changes in a single `updateState()` call

### Code Organization

1. **Separate concerns**: Keep your templates in HTML and your logic in JavaScript
2. **Component-based approach**: Organize your code into reusable components
3. **State normalization**: Keep your state structure flat and avoid deeply nested objects when possible

### Debugging

If templates aren't rendering correctly:

1. Check the browser console for errors
2. Verify that elements have `data-template` attributes
3. Ensure your state properties match what's in templates
4. Add `console.log(state)` before `renderAll()` to verify state changes

## Troubleshooting

### Common Issues

#### Templates Not Updating

**Possible causes:**
- Missing `data-template` attribute
- Incorrect property names in templates
- State not updating correctly

**Solution:**
Verify your template attributes and check the state object in the console.

#### Data Binding Not Working

**Possible causes:**
- Incorrect `data-bind` value
- Using a property path that doesn't exist in state

**Solution:**
Make sure your data-bind paths match your state structure exactly.

#### Loops or Conditionals Not Rendering

**Possible causes:**
- Syntax errors in template expressions
- Missing closing tags (`${endloop}` or `${endif}`)
- Non-array data in loops

**Solution:**
Double-check your template syntax and ensure loop data is an array.

---

## Advanced Usage

### Custom Event Handlers

You can create custom event handlers that update the state:

```javascript
document.getElementById('myButton').addEventListener('click', () => {
  updateState({
    clickCount: state.clickCount + 1,
    lastClicked: new Date().toLocaleString()
  });
});
```

### External Data Integration

Loading data from an API:

```javascript
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const userData = await response.json();
    updateState({ user: userData });
  } catch (error) {
    updateState({ error: error.message });
  }
}
```

### Dynamic Template Loading

You can dynamically load and initialize templates:

```javascript
function loadTemplate(url, containerId) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById(containerId);
      container.innerHTML = html;
      container.setAttribute('data-template', '');
      scanDOM();  // Re-scan for new templates
      bindInputs(); // Re-bind inputs
    });
}
```

---

## Contributing

Reactive.js is an open-source project. If you find bugs or have feature requests, please open an issue or submit a pull request on GitHub.

## License

MIT License
