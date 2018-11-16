<template>
  <li class="todo">
    <div class="view">
      <input class="toggle" type="checkbox" v-model="todo.completed">
      <label @dblclick="editTodo(todo)">{{todo.title}}</label>
      <button class="destroy" @click="removeTodo(todo)"></button>
    </div>
    <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)">
  </li>
</template>

<script>
export default {
  props: ['todo'],
  data() {
    return {
      editedTodo: null
    };
  },
  directives: {
    'todo-focus': function(el, binding) {
      if (binding.value) {
        el.focus();
      }
    }
  },
  methods: {
    editTodo: function(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    doneEdit: function(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit: function(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
</style>
