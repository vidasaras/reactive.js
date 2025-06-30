// main.js - This file imports and uses the reactive.js library.

// Import the necessary functions from your reactive.js module
// Make sure the path to reactive.js is correct relative to main.js
import { createStore, updateState } from '../reactive-lib.js';

// Initialize the reactive store with some initial data
const store = createStore({
  user: {
    name: 'Jane Doe',
    age: 25
  },
  todos: [
    { text: 'Learn Reactive JS', completed: true },
    { text: 'Build a small app', completed: false },
    { text: 'Deploy to production', completed: false }
  ]
});

// You can access the state directly if needed (though updates should go through updateState)
console.log('Initial State:', store);

// Get references to buttons
const updateButton = document.getElementById('updateButton');
const addTodoButton = document.getElementById('addTodoButton');

// Add event listener to the "Update State Manually" button
updateButton.addEventListener('click', () => {
  // Example of manually updating the state
  updateState({
    user: {
      name: 'John Doe', // Change name
      age: store.user.age + 1 // Increment age
    },
    todos: [ // Add a new todo item
      ...store.todos,
      { text: 'Explore more features', completed: false }
    ]
  });
  console.log('State after manual update:', store);
});

// Add event listener to the "Add New Todo" button
addTodoButton.addEventListener('click', () => {
  const newTodoText = prompt('Enter a new todo item:');
  if (newTodoText) {
    updateState({
      todos: [
        ...store.todos, // Keep existing todos
        { text: newTodoText, completed: false } // Add the new todo
      ]
    });
    console.log('State after adding todo:', store);
  }
});

// You can also update the state from other parts of your application
// For example, after fetching data from an API:
// setTimeout(() => {
//   updateState({
//     user: {
//       name: 'API User',
//       age: 40
//     }
//   });
//   console.log('State updated from simulated API call:', store);
// }, 3000);

