<template>
  <section class="todoapp">
    <header class="header">
      <h1>tasks</h1>
      <input
        class="new-todo"
        autofocus
        autocomplete="off"
        placeholder="What needs to be done?"
        v-model="newTodo"
        @keyup.enter="addTodo"
      />
    </header>
    <section class="main" v-show="todos.length">
      <TodoList v-bind:todos="filteredTodos" />
    </section>
    <footer class="footer">
      <span class="todo-count">
        Tasks for: <strong v-text="email"></strong
      ></span>
    </footer>
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong v-text="remaining"></strong>
        {{ pluralize('item', remaining) }} left
      </span>
      <ul class="filters">
        <li>
          <a
            href="#"
            :class="{ selected: visibility == 'all' }"
            @click="toggleVisibility(0);"
            >All</a
          >
        </li>
        <li>
          <a
            href="#"
            :class="{ selected: visibility == 'active' }"
            @click="toggleVisibility(1);"
            >Active</a
          >
        </li>
        <li>
          <a
            href="#"
            :class="{ selected: visibility == 'completed' }"
            @click="toggleVisibility(2);"
            >Completed</a
          >
        </li>
      </ul>
      <button
        class="clear-completed"
        @click="removeCompleted"
        v-show="todos.length > remaining"
      >
        Clear completed
      </button>
    </footer>
  </section>
</template>

<script>
import TodoList from './components/TodoList.vue';
const visibilities = ['all', 'active', 'completed'];
const filters = {
  all: function(todos) {
    return todos;
  },
  active: function(todos) {
    return todos.filter(function(todo) {
      return !todo.completed;
    });
  },
  completed: function(todos) {
    return todos.filter(function(todo) {
      return todo.completed;
    });
  },
};

export default {
  name: 'app',
  components: {
    TodoList,
  },
  data() {
    return {
      todos: [],
      newTodo: '',
      editedTodo: null,
      visibility: 'all',
      email: '',
    };
  },
  created() {
    fetch('/api/me')
      .then(response => response.json())
      .then(data => {
        this.email = data;
      });

    fetch('/api/tasks')
      .then(response => response.json())
      .then(data => {
        this.todos = data;
      });
  },
  computed: {
    filteredTodos: function() {
      return filters[this.visibility](this.todos);
    },
    remaining: function() {
      return filters.active(this.todos).length;
    },
    allDone: {
      get: function() {
        return this.remaining === 0;
      },
      set: function(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value;
        });
      },
    },
  },
  methods: {
    toggleVisibility: function(visibilityIndex) {
      if (visibilityIndex < visibilities.length)
        this.visibility = visibilities[visibilityIndex];
    },
    pluralize: function(word, count) {
      return word + (count === 1 ? '' : 's');
    },

    addTodo: function() {
      const title = this.newTodo && this.newTodo.trim();
      if (!title) {
        return;
      }
      const todo = {
        title,
        completed: false,
        update_time: new Date().toISOString(),
      };

      this.todos.unshift(todo);
      const index = this.todos.indexOf(todo);
      this.newTodo = '';
      console.log(`todo: ${JSON.stringify(todo)}`);
      fetch(`/api/tasks/`, {
        headers,
        method: 'POST',
        body: JSON.stringify(todo),
      })
        .then(res => res.json())
        .then(data => {
          this.todos.splice(index, 1, data);
        })
        .catch(err => {
          this.todos.splice(index, 1);
          // eslint-disable-next-line
          console.log(err);
        });
    },

    removeCompleted: function() {
      this.todos = filters.active(this.todos);
    },
  },
};
</script>

<style>
.todoapp {
  background: #fff;
  margin: 130px 0 40px 0;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
}

.todoapp input::-webkit-input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.todoapp input::-moz-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.todoapp input::input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.todoapp h1 {
  position: absolute;
  top: -155px;
  width: 100%;
  font-size: 100px;
  font-weight: 100;
  text-align: center;
  color: rgba(175, 47, 47, 0.15);
  -webkit-text-rendering: optimizeLegibility;
  -moz-text-rendering: optimizeLegibility;
  text-rendering: optimizeLegibility;
}

.new-todo,
.edit {
  position: relative;
  margin: 0;
  width: 100%;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  border: 0;
  color: inherit;
  padding: 6px;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.new-todo {
  padding: 16px 16px 16px 60px;
  border: none;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
}

.main {
  position: relative;
  z-index: 2;
  border-top: 1px solid #e6e6e6;
}

.footer {
  color: #777;
  padding: 10px 15px;
  height: 20px;
  text-align: center;
  border-top: 1px solid #e6e6e6;
}

.footer:before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 50px;
  overflow: hidden;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6,
    0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6,
    0 17px 2px -6px rgba(0, 0, 0, 0.2);
}

.todo-count {
  float: left;
  text-align: left;
}

.todo-count strong {
  font-weight: 400;
}

.filters {
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  right: 0;
  left: 0;
}

.filters li {
  display: inline;
}

.filters li a {
  color: inherit;
  margin: 3px;
  padding: 3px 7px;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 3px;
}

.filters li a:hover {
  border-color: rgba(175, 47, 47, 0.1);
}

.filters li a.selected {
  border-color: rgba(175, 47, 47, 0.2);
}

.clear-completed,
html .clear-completed:active {
  float: right;
  position: relative;
  line-height: 20px;
  text-decoration: none;
  cursor: pointer;
}

.clear-completed:hover {
  text-decoration: underline;
}
</style>
