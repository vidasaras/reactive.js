# JS data bound DOM elements

This is a lightweight template-based reactive system that allows you to write HTML with embedded templates that automatically update when the data changes.

## Examples

### Simple variable display:
    <div>${user.name}</div>

### Rendering a list:
    ${loop:articles}
    <div>
        <h2>${item.title}</h2>
        <p>${item.content}</p>
    </div>
    ${endloop}

### Conditional rendering:
    ${if:user.loggedIn}
        Welcome back, <strong>${user.name}</strong>!
    ${else}
        Hello, Guest!
    ${endif}

### Data binding:
    <input type="text" data-bind="user.name">


## How to Use It

### Include the script:
    <script src="reactive.js"></script>

### Initialize your data:
    const data = createStore({
        username: "John",
        items: ["Item 1", "Item 2"]
    });

### Mark template elements:
    <div>Hello, ${username}!</div>

### Direct Manual Rendering:
After modifying data, call renderAll() to update the UI
    data.articles[0].title = "New Title";
    renderAll(); // Update UI
